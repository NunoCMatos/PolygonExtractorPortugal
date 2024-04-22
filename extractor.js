const readline = require('readline');
const https = require('https');
const fs = require('fs');
const simplify = require('simplify-js');

// Function to fetch JSON data from the provided link
function fetchMunicipioData(name) {
    return new Promise((resolve, reject) => {
        const url = `https://geoapi.pt/municipio/${name}?json=1`;
        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

// Create interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to prompt user for municipio name
function promptForMunicipioName() {
    rl.question('Enter the name of the municipio: ', parseName);
}

function switchCoordinates(coordinates) {
    return coordinates.map(coord => ({x: coord[1], y: coord[0]}));
}

function formatCoordinates(coordinates) {
    return coordinates.map(coord => [coord.x, coord.y]);
}

function simplifyCoordinates(coordinates) {

    coordinates = simplify(coordinates, 0.001, true);

    return formatCoordinates(coordinates);
}

async function parseName(name) {
    
    if ('all'.substring(0, name.length) === name.toLowerCase()) {
        //Are you sure you want to fetch all municipios?
        rl.question('Are you sure you want to fetch all municipios (2869 files - ~310MB) ? (yes/no): ', (answer) => {
            if ('yes'.substring(0, answer.length) === answer.toLowerCase()) {
                fetchAllMunicipios();
            } else {
                promptForMunicipioName();
            }
        });

    } else {
        await fetchDataAndWrite(name);
    }
}

// Function to fetch data and write to file
async function fetchDataAndWrite(name) {

    let municipio;

    try {
        // Fetch JSON data based on the input name
        municipio = await fetchMunicipioData(name);

        if (municipio.erro) {
            console.error(municipio.erro);
            promptForMunicipioName(); // Prompt user again if there's an error
        } else {
            const folderName = `${name}`;
            fs.mkdirSync(folderName, { recursive: true }); // Create folder

            const geojsons = municipio.geojsons;
            
            // Check if the municipio has a "geojsons" property
            if (geojsons && geojsons.freguesias) {
                const freguesias = geojsons.freguesias;
                freguesias.forEach(freguesia => {
                    const nome = freguesia.properties.Freguesia;
                    const coordinates = freguesia.geometry.coordinates;
                    const switchedCoordinates = switchCoordinates(coordinates[0]);
                    const simplifiedCoordinates = simplifyCoordinates(switchedCoordinates);

                    // Write switched coordinates to new JSON file
                    fs.writeFile(`${folderName}/${nome}_polygon.json`, JSON.stringify({ name: nome, path: simplifiedCoordinates }, null, 4), (err) => {
                        if (!err) {
                            console.log(`Switched coordinates saved to ${folderName}/${nome}_polygon.json`);
                        } else {
                            console.error('Error writing file:', err);
                        }
                    });
                });
            }

            rl.close(); // Close the readline interface when done
        }
    } catch (error) {
        console.error('Error fetching or writing data:', error);
    }
}

function fetchAllMunicipios() {
    
        const url = 'https://geoapi.pt/municipios?json=1';

        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    jsonData.forEach(async municipio => {
                        await fetchDataAndWrite(municipio);
                    });
                } catch (error) {
                    console.error(error);
                }
            });

        }).on('error', (error) => {
            console.error(error);
        });
};

// Start by prompting for the municipio name
promptForMunicipioName();

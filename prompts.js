function promptForTolerance() {
    rl.question('Enter the tolerance value (default is 0.001): ', (value) => {
        if (value) {

            tolerance = parseFloat(value);

            if (tolerance <= 0 || isNaN(tolerance)) {
                console.error('Invalid tolerance value. Must be a number greater than 0.');
                 return promptForTolerance();
            }
        }

        return promptForMunicipioName();
    });
}


function promptForMunicipioName() {
    rl.question('Enter the name of the municipio: ', parseName);
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
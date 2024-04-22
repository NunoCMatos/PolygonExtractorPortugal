function promptForTolerance() {
    rl.question('Enter the tolerance value (default is 0.001): ', (value) => {
        if (value) {
            tolerance = parseFloat(value);

            if (isNaN(tolerance)) { 
                console.error('Invalid tolerance value. Must be a number.');
                promptForTolerance(); 
            }
        } else {
            tolerance = 0.001; 
        }

        promptForMunicipioName();
    });
}

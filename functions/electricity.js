var config = require('./config')
const requestLib = require('request');

exports.processRequest = function(parameters) {
    return new Promise(function(resolve, reject) {
        let consumed_quantity = 1,
            consumption_country = 'Default',
            emission_type = '';

        if (parameters.quantity !== "")
            consumed_quantity = parameters.quantity;

        if (parameters.geo_country !== "")
            consumption_country = parameters.geo_country;

        console.log("Electricity consumed =" + consumed_quantity + ", country =" + consumption_country);

        var options = {
            uri: config.endpoint + "/emissions",
            method: 'POST',
            headers: {
                'access-key': config.access_key
            },
            json: true,
            body: {
                "item": "electricity",
                "unit": "kWh",
                "region": consumption_country,
                "quantity": consumed_quantity
            }
        };

        requestLib(options, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                console.log(body);
                if (parameters.emission_type !== "") {
                    let emissionType = parameters.emission_type;
                    let emission;
                    if (emissionType === "CO2")
                        emission = body.emissions.CO2;
                    else if (emissionType === "N2O")
                        emission = body.emissions.N2O;
                    else
                        emission = body.emissions.CH4;

                    let basicResponseString = emissionType + ' emissions due to electricity consumption of ' + consumed_quantity + ' kWh';
                    let finalResponseString = "";

                    if (consumption_country != "" && consumption_country != "Default")
                        finalResponseString = basicResponseString + ' in ' + consumption_country + ' are ' + emission;
                    else
                        finalResponseString = basicResponseString + ' are ' + emission;


                    let unit = body.unit;
                    if (unit !== undefined)
                        resolve(finalResponseString + ' ' + unit);
                    else
                        resolve(finalResponseString + ' kg');
                } else {
                    let basicResponseString = 'Emissions due to electricity consumption of ' + consumed_quantity + ' kWh';
                    let finalResponseString = "";
                    if (consumption_country != "" && consumption_country != "Default")
                        finalResponseString = basicResponseString + ' in ' + consumption_country;
                    else
                        finalResponseString = basicResponseString;
                    let carbonEmission = body.emissions.CO2;
                    let nitrousEmission = body.emissions.N2O;
                    let methaneEmission = body.emissions.CH4;
                    resolve(finalResponseString + ' are as follows:\n  \n' +
                        'Carbon Dioxide: ' + carbonEmission + ' kg.\n' +
                        "Nitrous Oxide: " + nitrousEmission + ' kg.\n' +
                        "Methane: " + methaneEmission + ' kg.');
                }
            } else {
                if (body.err !== undefined) {
                    console.log("Error: " + JSON.stringify(body));
                    reject(body.err);
                } else {
                    reject("Sorry, we are facing a temporary outage. Please contact our support.");
                }
            }
        });
    });
}
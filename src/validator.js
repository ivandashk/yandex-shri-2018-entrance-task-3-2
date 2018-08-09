const ajv = require('ajv');
const schema = require('./json-data/validation-schema');
const constants = Object.freeze(require('./json-data/constants'));

const validate = input => {
    validateAccordingSchema(input);
    validateDevices(input.devices, input.maxPower);
    validateRatesIntervals(input.rates);
}

const validateAccordingSchema = input => {
    const validator = new ajv({allErrors: true});
    if (!validator.validate(schema, input)) 
        throw new Error(validator.errors.shift().message);
}

const validateDevices = (devices, maxPower) => {
    devices.forEach(device => {
        if (!!device.mode) {
            const modeDuration = constants.modesDuration[device.mode];
            if (device.duration > modeDuration) 
                throw new Error(`duration of ${device.name} (${device.duration}) ` +
                    `overextends it's mode's duration - ${device.mode} (${modeDuration})`);
        }
        if (device.power > maxPower)
            throw new Error(`power of ${device.name} overextends max power`);
    });
}

const validateRatesIntervals = rates => {
    let hoursCoveredByRates = 0;
    rates.forEach(rate => {
        if (rate.from === rate.to) 
            throw new Error("property 'to' and 'from' shouldn't be equal");

        if (rate.from < rate.to) {
            hoursCoveredByRates += rate.to - rate.from;
        } else {
            hoursCoveredByRates += constants.hoursInDay - rate.from;
            hoursCoveredByRates += rate.to;
        }
    });

    if (hoursCoveredByRates < constants.hoursInDay) {
        throw new Error("rates don't cover the full day");
    } else if (hoursCoveredByRates > constants.hoursInDay) {
        throw new Error("rates input error - there are only 24 hours in a day");
    }
}

module.exports = validate
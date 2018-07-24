const ajv = require('ajv');
const schema = require('./validation-schema');

const hoursInDay = 24;
const modeStarterHour = {
    "day": 7,
    "night": 21
}


validate = input => {
    var validator = new ajv({allErrors: true}); 
    var valid = validator.validate(schema, input);
    if (!valid) throw new Error(validator.errors.shift().message);
    validateIntervals(input.rates);
}

validateIntervals = rates => {
    let hoursCoveredByRates = 0;
    rates.forEach(rate => {
        if (rate.from === rate.to) 
            throw new Error("property 'to' and 'from' shouldn't be equal");

        if (rate.from < rate.to) {
            hoursCoveredByRates += rate.to - rate.from;
        } else {
            hoursCoveredByRates += hoursInDay - rate.from;
            hoursCoveredByRates += rate.to;
        }
    });

    if (hoursCoveredByRates < hoursInDay) {
        throw new Error("rates don't cover the full day");
    } else if (hoursCoveredByRates > hoursInDay) {
        throw new Error("rates input error - there are only 24 hours in a day");
    }
}

module.exports = validate
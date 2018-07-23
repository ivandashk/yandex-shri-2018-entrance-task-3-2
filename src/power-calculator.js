const validate = require('./validator');

function calculate(a) {
    validate(a);
    return { answer: true };
}

module.exports = calculate
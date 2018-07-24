const validate = require('./validation/validator');

calculate = input => {
    validate(input);
    return { "answer": true };
}

module.exports = calculate
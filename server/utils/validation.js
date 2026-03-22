const joi = require("joi");

const Joi = joi.defaults((schema) =>
    schema.prefs({ abortEarly: true })
);

module.exports = Joi;
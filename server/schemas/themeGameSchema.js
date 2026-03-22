const Joi = require('../utils/validation');

const themeGameSchema = Joi.object({
    themeId: Joi.string()
        .guid()
        .required()
}).messages({
    "string.empty": "Поле {#key} не может быть пустым",
    "string.base": "Поле {#key} должно быть строкой",
    'string.guid': 'Поле {#key} должен быть валидным UUID.',
    'any.required': 'Поле {#key} обязателен.',
})

module.exports = { themeGameSchema };
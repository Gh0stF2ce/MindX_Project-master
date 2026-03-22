const Joi = require('../utils/validation');

const accessGameSchema = Joi.object({
    roleId: Joi.string()
        .guid()
        .required(),
    gameId: Joi.string()
        .guid()
        .required()
}).messages({
    "string.empty": "Поле {#key} не может быть пустым",
    "string.base": "Поле {#key} должно быть строкой",
    'string.guid': 'Поле {#key} должен быть валидным UUID.',
    'any.required': 'Поле {#key} обязателен.',
})

module.exports = { accessGameSchema };
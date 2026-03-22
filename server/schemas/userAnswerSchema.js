const Joi = require('../utils/validation');

const userAnswerSchema = Joi.object({
    questionGameId: Joi.string()
        .guid()
        .required(),
    userAnswer: Joi.string().allow(null).default(null),
}).messages({
    'string.guid': 'Поле {#key} должен быть валидным UUID.',
    'string.empty': 'Поле {#key} не может быть пустым.',
    'string.base': 'Поле {#key} должен быть строкой.',
    'any.required': 'Поле {#key} обязателен.',
})

module.exports = { userAnswerSchema };
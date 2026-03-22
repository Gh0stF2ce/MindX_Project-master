const Joi = require('../utils/validation');

const questionGamePutSchema = Joi.object({
    questionId: Joi.string()
        .guid()
        .required()
        .messages({
            "string.empty": "Поле {#key} не может быть пустым",
            "string.base": "Поле {#key} должно быть строкой",
            'string.guid': 'Поле {#key} должен быть валидным UUID.',
            'any.required': 'Поле {#key} обязателен.',
        }),
});

const questionGamePostSchema = questionGamePutSchema.append({
    gameId: Joi.string()
        .guid()
        .required()
        .messages({
            "string.empty": "Поле {#key} не может быть пустым",
            "string.base": "Поле {#key} должно быть строкой",
            'string.guid': 'Поле {#key} должен быть валидным UUID.',
            'any.required': 'Поле {#key} обязателен.',
        })
});

module.exports = { questionGamePutSchema, questionGamePostSchema };

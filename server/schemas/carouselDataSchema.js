const Joi = require('../utils/validation');

const carouselDataSchema = Joi.object({
    gameId: Joi.string().guid().required(),
    scoreFirst: Joi.number().required(),
    scoreSuccess: Joi.number().required(),
    scoreFailure: Joi.number().required()
}).messages({
    'string.base': 'Поле {#key} должно быть строкой',
    'string.empty': 'Поле {#key} не может быть пустым',
    'string.guid': 'Поле {#key} должно быть в формате UUID',
    'number.base': 'Поле {#key} должен быть числом.',
    'any.required': 'Поле {#key} обязательно для заполнения'
})

module.exports = { carouselDataSchema }
const Joi = require('../utils/validation');

const questionSchema = Joi.object({
    question: Joi.string().required(),
    answer: Joi.string().required(),
    imageId: Joi.string().allow(null).guid().default(null).optional()
}).messages({
    'string.base': 'Поле {#key} должно быть строкой',
    'string.empty': 'Поле {#key} не может быть пустым',
    'string.guid': 'Поле {#key} должно быть в формате UUID',
    'any.required': 'Поле {#key} обязательно для заполнения'
})

module.exports = { questionSchema };

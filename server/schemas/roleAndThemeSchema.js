const Joi = require('../utils/validation');

const schema = Joi.object({
    name: Joi.string()
        .pattern(/^[a-zA-Z0-9А-Яа-яЁё -]+$/)
        .min(1)
        .max(30)
        .messages({
            "string.empty": "Поле 'name' не может быть пустым",
            "string.base": "Поле 'name' должно быть строкой",
            "string.pattern.base": "Поле 'name' должно содержать только буквы и цифры",
            "string.min": "Поле 'name' должно содержать не менее 3 символов",
            "string.max": "Поле 'name' должно содержать не более 30 символов"
        })
})

module.exports = { schema };
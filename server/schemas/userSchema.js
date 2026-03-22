const Joi = require('../utils/validation');

// Базовая схема паролей
const passwordSchema = Joi.string()
    .min(8)
    .pattern(/(?=.*[a-zа-яё])/, 'строчную букву')
    .pattern(/(?=.*[A-ZА-ЯЁ])/, 'заглавную букву')
    .pattern(/(?=.*\d)/, 'число')
    .pattern(/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/, 'специальный символ')
    .messages({
        "string.min": "Поле {#key} должно содержать не менее 8 символов.",
        "string.pattern.name": "Поле {#key} должно содержать {#name}.",
    });

// Базовая схема имени пользователя
const usernameValidation = Joi.string()
    .pattern(/^[a-zA-Z0-9А-Яа-яЁё]+$/)
    .min(3)
    .max(30)
    .messages({
        "string.pattern.base": "Поле {#key} должно содержать только буквы и цифры.",
        "string.min": "Поле {#key} должно содержать не менее 3 символов.",
        "string.max": "Поле {#key} должно содержать не более 30 символов.",
    });

const userPutSchema = Joi.object({
    username: usernameValidation.optional().allow(null),
    password: passwordSchema.required(),
    confirmPassword: Joi.required()
        .valid(Joi.ref('password'))
        .messages({
            "any.only": "Поле {#key} должно совпадать с паролем.",
        }),
}).messages({
    "any.required": "Поле {#key} обязательно для заполнения.",
    "string.empty": "Поле {#key} не может быть пустым.",
    "string.base": "Поле {#key} должно быть строкой.",
});

const userPostSchema = Joi.object({
    username: usernameValidation.required(),
    password: passwordSchema.required(),
    confirmPassword: Joi.required()
        .valid(Joi.ref('password'))
        .messages({
            "any.only": "Поле {#key} должно совпадать с паролем.",
        }),
}).messages({
    "any.required": "Поле {#key} обязательно для заполнения.",
    "string.empty": "Поле {#key} не может быть пустым.",
    "string.base": "Поле {#key} должно быть строкой.",
});


// Схемы для администратора
const roleIdValidation = Joi.string()
    .guid()
    .default("aff50f23-2fbc-41be-ba07-c1c69c5e388c")
    .messages({
        "string.guid": "Поле {#key} должно быть корректным UUID.",
    });

const userPutSchemaForAdmin = Joi.object({
    username: usernameValidation.optional(),
    roleId: roleIdValidation.required(),
    password: passwordSchema.optional().allow(null),
    confirmPassword: Joi.optional()
        .when('password', {
            is: Joi.exist(), // Проверяем, что password существует
            then: Joi.valid(Joi.ref('password')).required(), // Если существует, confirmPassword обязательно и должно совпадать
            otherwise: Joi.optional(), // В противном случае confirmPassword не проверяется
        })
        .messages({
            "any.only": "Поле {#key} должно совпадать с паролем.",
            "any.required": "Поле {#key} обязательно для заполнения, если задан пароль."
        }),
}).messages({
    "string.empty": "Поле {#key} не может быть пустым.",
    "string.base": "Поле {#key} должно быть строкой.",
});

const userPostSchemaForAdmin = Joi.object({
    username: usernameValidation.required(),
    roleId: roleIdValidation.optional().allow(null).default(''),
    password: passwordSchema.required(),
    confirmPassword: Joi.required()
        .valid(Joi.ref('password'))
        .messages({
            "any.only": "Поле {#key} должно совпадать с паролем.",
        }),
}).messages({
    "any.required": "Поле {#key} обязательно для заполнения.",
    "string.empty": "Поле {#key} не может быть пустым.",
    "string.base": "Поле {#key} должно быть строкой.",
});


module.exports = { userPutSchema, userPostSchema, userPutSchemaForAdmin, userPostSchemaForAdmin };

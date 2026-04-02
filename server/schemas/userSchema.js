const Joi = require('../utils/validation');

const passwordSchema = Joi.string()
  .min(8)
  .pattern(/(?=.*[a-zа-яё])/, 'строчную букву')
  .pattern(/(?=.*[A-ZА-ЯЁ])/, 'заглавную букву')
  .pattern(/(?=.*\d)/, 'число')
  .pattern(/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/, 'специальный символ')
  .messages({
    'string.min': 'Поле {#key} должно содержать не менее 8 символов.',
    'string.pattern.name': 'Поле {#key} должно содержать {#name}.',
  });

const usernameValidation = Joi.string()
  .pattern(/^[a-zA-Z0-9А-Яа-яЁё]+$/)
  .min(3)
  .max(30)
  .messages({
    'string.pattern.base': 'Поле {#key} должно содержать только буквы и цифры.',
    'string.min': 'Поле {#key} должно содержать не менее 3 символов.',
    'string.max': 'Поле {#key} должно содержать не более 30 символов.',
  });

const emailValidation = Joi.string().email({ tlds: { allow: false } }).messages({
  'string.email': 'Поле {#key} должно быть корректным email.',
});

const codeValidation = Joi.string().length(6).pattern(/^\d+$/).messages({
  'string.length': 'Код должен содержать 6 цифр.',
  'string.pattern.base': 'Код должен содержать только цифры.',
});

const sharedMessages = {
  'any.required': 'Поле {#key} обязательно для заполнения.',
  'string.empty': 'Поле {#key} не может быть пустым.',
  'string.base': 'Поле {#key} должно быть строкой.',
};

const userPutSchema = Joi.object({
  username: usernameValidation.optional().allow(null),
  email: emailValidation.optional().allow(null),
  password: passwordSchema.optional().allow(null, ''),
  confirmPassword: Joi.optional()
    .allow(null, '')
    .when('password', {
      is: Joi.exist().not(null, ''),
      then: Joi.valid(Joi.ref('password')).required(),
      otherwise: Joi.optional(),
    })
    .messages({
      'any.only': 'Поле {#key} должно совпадать с паролем.',
      'any.required': 'Поле {#key} обязательно, если задан пароль.',
    }),
  isTwoFactorEnabled: Joi.boolean().optional(),
}).messages(sharedMessages);

const userPostSchema = Joi.object({
  username: usernameValidation.required(),
  email: emailValidation.required(),
  password: passwordSchema.required(),
  confirmPassword: Joi.required().valid(Joi.ref('password')).messages({
    'any.only': 'Поле {#key} должно совпадать с паролем.',
  }),
}).messages(sharedMessages);

const signinSchema = Joi.object({
  identifier: Joi.string().required(),
  password: Joi.string().required(),
}).messages(sharedMessages);

const verifyEmailSchema = Joi.object({
  email: emailValidation.required(),
  code: codeValidation.required(),
}).messages(sharedMessages);

const resendVerificationSchema = Joi.object({
  email: emailValidation.required(),
}).messages(sharedMessages);

const verifyTwoFactorSchema = Joi.object({
  challengeToken: Joi.string().required(),
  code: codeValidation.required(),
  rememberDevice: Joi.boolean().optional().default(false),
}).messages(sharedMessages);

const forgotPasswordSchema = Joi.object({
  email: emailValidation.required(),
}).messages(sharedMessages);

const resetPasswordSchema = Joi.object({
  email: emailValidation.required(),
  code: codeValidation.required(),
  password: passwordSchema.required(),
  confirmPassword: Joi.required().valid(Joi.ref('password')).messages({
    'any.only': 'Поле {#key} должно совпадать с паролем.',
  }),
}).messages(sharedMessages);

const roleIdValidation = Joi.string().guid().default('aff50f23-2fbc-41be-ba07-c1c69c5e388c').messages({
  'string.guid': 'Поле {#key} должно быть корректным UUID.',
});

const userPutSchemaForAdmin = Joi.object({
  username: usernameValidation.optional(),
  email: emailValidation.optional(),
  roleId: roleIdValidation.required(),
  isTwoFactorEnabled: Joi.boolean().optional(),
  isEmailVerified: Joi.boolean().optional(),
  password: passwordSchema.optional().allow(null, ''),
  confirmPassword: Joi.optional()
    .allow(null, '')
    .when('password', {
      is: Joi.exist().not(null, ''),
      then: Joi.valid(Joi.ref('password')).required(),
      otherwise: Joi.optional(),
    })
    .messages({
      'any.only': 'Поле {#key} должно совпадать с паролем.',
      'any.required': 'Поле {#key} обязательно, если задан пароль.',
    }),
}).messages(sharedMessages);

const userPostSchemaForAdmin = Joi.object({
  username: usernameValidation.required(),
  email: emailValidation.required(),
  roleId: roleIdValidation.optional().allow(null).default(''),
  isTwoFactorEnabled: Joi.boolean().optional().default(false),
  isEmailVerified: Joi.boolean().optional().default(true),
  password: passwordSchema.required(),
  confirmPassword: Joi.required().valid(Joi.ref('password')).messages({
    'any.only': 'Поле {#key} должно совпадать с паролем.',
  }),
}).messages(sharedMessages);

module.exports = {
  userPutSchema,
  userPostSchema,
  signinSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  verifyTwoFactorSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  userPutSchemaForAdmin,
  userPostSchemaForAdmin,
};

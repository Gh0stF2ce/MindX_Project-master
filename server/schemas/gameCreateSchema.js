const Joi = require('../utils/validation');

const commonStringRules = Joi.string().messages({
    'string.empty': 'Поле {#key} не может быть пустым',
    'string.base': 'Поле {#key} должно быть строкой',
    'string.guid': 'Поле {#key} должно быть в формате UUID',
    'string.isoDate': 'Поле {#key} должно быть в формате ISO даты',
    'any.required': 'Поле {#key} обязательно для заполнения',
})

const gameCreateSchema = Joi.object({
    typeGame: commonStringRules.required(),
    name: commonStringRules.required(),
    imageId: commonStringRules.guid().allow(null).default(null),
    startDate: commonStringRules.isoDate().required(),
    endDate: commonStringRules.isoDate().required().custom((value, helpers) => {
        const startDate = new Date(helpers.state.ancestors[0].startDate);
        const endDate = new Date(value);

        if (endDate <= startDate) {
            return helpers.message('Конечная дата должна быть больше или равна начальной дате')
        }

        return value;
    }, 'Date comparison'),

    questionGames: Joi.array().items(
        Joi.object({
            id: Joi.string().guid().required(),
        })
    ).required().messages({
        'string.empty': 'Поле {#key} не может быть пустым',
        'string.base': 'Поле {#key} должно быть строкой',
        'string.guid': 'Поле {#key} должно быть в формате UUID',
        'any.required': 'Поле {#key} обязательно для заполнения',
    }),

    themeGames: Joi.array().items(
        Joi.object({
            id: Joi.string().guid().required()
        })
    ).allow(null).messages({
        'string.empty': 'Поле {#key} не может быть пустым',
        'string.base': 'Поле {#key} должно быть строкой',
        'string.guid': 'Поле {#key} должно быть в формате UUID',
    }),

    accessGames: Joi.array().items(
        Joi.object({
            id: Joi.string().guid().required()
        })
    ).required().messages({
        'string.empty': 'Поле {#key} не может быть пустым',
        'string.base': 'Поле {#key} должно быть строкой',
        'string.guid': 'Поле {#key} должно быть в формате UUID',
    }),

    carouselData: Joi.object({
        scoreFirst: Joi.number().integer().required(),
        scoreSuccess: Joi.number().integer().required(),
        scoreFailure: Joi.number().integer().required(),
    }).allow(null).messages({
        'number.base': 'Поле {#key} должно быть числом',
        'any.required': 'Поле {#key} обязательно для заполнения',
    }),

    invadersData: Joi.object({
        schoolClass: commonStringRules.required(),
    }).allow(null).messages({
        'object.base': 'Поле {#key} должно быть объектом',
        'any.required': 'Поле {#key} обязательно для заполнения',
    })
}).custom((value, helpers) => {
    if (value.typeGame === 'square') {
        if (!value.themeGames) {
            return helpers.message('Поле themeGames обязательно для заполнения');
        }
        if (value.themeGames.length !== 5) {
            return helpers.message('Массив themeGames должен содержать ровно 5 элементов');
        }
        if (value.questionGames.length !== 25) {
            return helpers.message('Массив questionGames должен содержать ровно 25 элементов');
        }
    }
    else if (value.typeGame === 'carousel') {
        if (!value.carouselData) {
            return helpers.message('Поле carouselData обязательно для заполнения');
        }
        if (value.questionGames.length === 0) {
            return helpers.message('Массив questionGames должен содержать хотя бы один элемент');
        }
    }
    else if (value.typeGame === 'invaders') {
        if (!value.invadersData?.schoolClass) {
            return helpers.message('Поле invadersData.schoolClass обязательно для заполнения');
        }
    }
    return value;
}).messages({
    'any.required': 'Поле {#key} обязательно для заполнения',
    'array.base': 'Поле {#key} должно быть массивом',
    'object.base': 'Поле {#key} должно быть объектом'
});

module.exports = { gameCreateSchema };

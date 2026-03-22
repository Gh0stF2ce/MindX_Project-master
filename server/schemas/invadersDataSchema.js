const Joi = require('../utils/validation');

const invadersDataSchema = Joi.object({
  gameId: Joi.string().guid().required()
    .messages({
      'string.empty': '{{#label}} не может быть пустым',
      'string.base': '{{#label}} должен быть строкой',
      'string.guid': '{{#label}} должен быть UUID'
    }),
  level: Joi.number().integer().min(1).max(20).default(1)
    .messages({
      'number.base': 'level должен быть числом',
      'number.integer': 'level должен быть целым',
      'number.min': 'level минимум 1',
      'number.max': 'level максимум 20'
    }),
  speed: Joi.number().integer().min(1).max(10).default(3)
    .messages({
      'number.base': 'speed должен быть числом',
      'number.integer': 'speed должен быть целым',
      'number.min': 'speed минимум 1',
      'number.max': 'speed максимум 10'
    }),
  enemiesCount: Joi.number().integer().min(5).max(50).default(10)
    .messages({
      'number.base': 'enemiesCount должен быть числом',
      'number.integer': 'enemiesCount должен быть целым',
      'number.min': 'enemiesCount минимум 5',
      'number.max': 'enemiesCount максимум 50'
    }),
  schoolClass: Joi.string().allow(null, '')
    .messages({
      'string.base': 'schoolClass должен быть строкой'
    }),
  scoreFirst: Joi.number().integer().min(0).default(100)
    .messages({
      'number.base': 'scoreFirst должен быть числом',
      'number.integer': 'scoreFirst должен быть целым',
      'number.min': 'scoreFirst минимум 0'
    }),
  scoreSuccess: Joi.number().integer().min(0).default(50)
    .messages({
      'number.base': 'scoreSuccess должен быть числом',
      'number.integer': 'scoreSuccess должен быть целым',
      'number.min': 'scoreSuccess минимум 0'
    }),
  scoreFailure: Joi.number().integer().min(-100).default(-25)
    .messages({
      'number.base': 'scoreFailure должен быть числом',
      'number.integer': 'scoreFailure должен быть целым',
      'number.min': 'scoreFailure минимум -100'
    })
})

module.exports = { invadersDataSchema }

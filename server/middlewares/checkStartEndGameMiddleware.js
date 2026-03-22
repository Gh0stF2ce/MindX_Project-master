const ApiError = require('../error/ApiError');
const { Game } = require('../models/index')

module.exports = function () {
    return async function (req, res, next) {
        if (req.method === 'OPTIONS') {
            next()
        }
        try {
            const isPlayGame = await Game.findByPk(req.params.id, {
                attributes: ['startDate', 'endDate'],
            })
            const time = new Date()
            if (isPlayGame.startDate > time) {
                return next(ApiError.forbidden('Игра еще не началась!'))
            }
            if (req.method === 'POST' && isPlayGame.endDate < time) {
                return next(ApiError.forbidden('Игра уже закончилась!'))
            }
            next()
        } catch {
            return next(ApiError.forbidden('Ошибка запроса времени игры!'))
        }
    }
}
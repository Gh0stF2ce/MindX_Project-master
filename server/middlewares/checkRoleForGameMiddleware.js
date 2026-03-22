const ApiError = require('../error/ApiError');
const { Role, AccessGame } = require('../models/index')

module.exports = function () {
    return async function (req, res, next) {
        if (req.method === 'OPTIONS') {
            next()
        }
        try {
            const roleGame = await AccessGame.findOne({
                where: {
                    '$role.name$': req.user.role,
                    gameId: req.params.id
                },
                include: [{
                    model: Role,
                    attributes: [],
                    required: true,
                }],
                attributes: ['id'],
            })
            if (!roleGame) {
                return next(ApiError.forbidden('Нет доступа к данной игре!'))
            }
            next()
        } catch {
            return next(ApiError.badRequest('Ошибка доступа к игре!'))
        }
    }
}
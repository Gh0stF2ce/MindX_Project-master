const ApiError = require('../error/ApiError');

module.exports = function (role) {
    return function (req, res, next) {
        if (req.method === 'OPTIONS') {
            next()
        }
        try {
            if (req.user.role !== role) {
                return next(ApiError.forbidden('Недостаточно прав'))
            }
            next()
        } catch (error) {
            return next(ApiError.badRequest(error.message))
        }
    }
}
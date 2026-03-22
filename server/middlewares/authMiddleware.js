const ApiError = require('../error/ApiError');
const jwt = require('jsonwebtoken')

module.exports = function () {
    return function (req, res, next) {
        if (req.method === 'OPTIONS') {
            next()
        }
        try {
            // Проверяем наличие заголовка Authorization
            if (!req.headers?.authorization) {
                throw new Error('Требуется авторизация');
            }
            // Извлекаем токен из заголовка
            const [bearer, token] = req.headers.authorization.split(' ')
            // Проверяем формат заголовка (Bearer token)
            if (bearer !== 'Bearer' || !token) {
                throw new Error('Неверный формат токена');
            }
            // Проверяем валидность токена
            req.user = jwt.verify(token, process.env.SECRET_KEY)
            next()
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                return next(ApiError.unauthorized('Срок действия токена истек'));
            }

            if (error instanceof jwt.JsonWebTokenError) {
                return next(ApiError.unauthorized('Недействительный токен'));
            }

            return next(ApiError.unauthorized(error.message));
        }
    }
}
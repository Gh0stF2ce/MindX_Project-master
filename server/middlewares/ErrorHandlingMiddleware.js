const ApiError = require('../error/ApiError');

module.exports = function (err, req, res, next) {
    if (req.path !== '/api/user/auth') {
        console.error('[ERROR HANDLER]', {
            date: new Date().toISOString(),
            path: req.path,
            method: req.method,
            error: err.message || err.toString(),
            statusCode: err.status || 500,
            isApiError: err instanceof ApiError,
            user: req.user?.id || 'Не авторизован'
        })
    }
    if (err instanceof ApiError) {
        return res.status(err.status).json({ error: err.message })
    }
    return res.status(500).json({ error: "Непредвиденная ошибка!" })
}
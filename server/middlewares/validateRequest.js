const ApiError = require('../error/ApiError');

const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            convert: true,  // Применяет значения по умолчанию и преобразования
            stripUnknown: true // Удаляет неизвестные поля
        });

        if (error) {
            return next(ApiError.badRequest(error.message))
        }

        req.body = value; // Обновляем тело запроса (только валидные поля)
        next();
    };
};

module.exports = validateRequest;

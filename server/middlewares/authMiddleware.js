const ApiError = require('../error/ApiError');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

module.exports = function () {
  return async function (req, res, next) {
    if (req.method === 'OPTIONS') {
      next();
      return;
    }

    try {
      if (!req.headers?.authorization) {
        throw new Error('Требуется авторизация');
      }

      const [bearer, token] = req.headers.authorization.split(' ');
      if (bearer !== 'Bearer' || !token) {
        throw new Error('Неверный формат токена');
      }

      const payload = jwt.verify(token, process.env.SECRET_KEY);
      const user = await User.findByPk(payload.id, {
        attributes: ['id', 'username', 'roleId', 'tokenVersion'],
        include: [
          {
            model: Role,
            attributes: ['name'],
            required: false,
          },
        ],
      });

      if (!user) {
        throw new Error('Пользователь не найден');
      }

      if (Number(payload.tokenVersion) !== Number(user.tokenVersion)) {
        return next(ApiError.unauthorized('Сессия устарела. Войдите снова.'));
      }

      req.user = {
        id: user.id,
        username: user.username,
        role: user.role?.name || payload.role,
        tokenVersion: user.tokenVersion,
      };

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return next(ApiError.unauthorized('Срок действия токена истек'));
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return next(ApiError.unauthorized('Недействительный токен'));
      }

      return next(ApiError.unauthorized(error.message));
    }
  };
};

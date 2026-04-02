const ApiError = require('../error/ApiError');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const userSessionService = require('../services/userSessionService');
const parseCookies = require('../utils/parseCookies');

const AUTH_COOKIE_NAME = 'mindx_auth_token';

module.exports = function () {
  return async function (req, res, next) {
    if (req.method === 'OPTIONS') {
      next();
      return;
    }

    try {
      const cookies = parseCookies(req.headers?.cookie || '');
      const cookieToken = cookies[AUTH_COOKIE_NAME];
      const authorizationHeader = req.headers?.authorization;

      let token = cookieToken || null;

      if (!token && authorizationHeader) {
        const [bearer, bearerToken] = authorizationHeader.split(' ');
        if (bearer === 'Bearer' && bearerToken) {
          token = bearerToken;
        }
      }

      if (!token) {
        throw new Error('Требуется авторизация');
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

      if (payload.sessionId) {
        const session = await userSessionService.getActiveSession(user.id, payload.sessionId);
        if (!session) {
          return next(ApiError.unauthorized('Сессия завершена. Войдите снова.'));
        }

        await userSessionService.touchSession(payload.sessionId);
      }

      req.user = {
        id: user.id,
        username: user.username,
        role: user.role?.name || payload.role,
        tokenVersion: user.tokenVersion,
        sessionId: payload.sessionId || null,
      };

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return next(ApiError.unauthorized('Срок действия токена истёк'));
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return next(ApiError.unauthorized('Недействительный токен'));
      }

      return next(ApiError.unauthorized(error.message));
    }
  };
};

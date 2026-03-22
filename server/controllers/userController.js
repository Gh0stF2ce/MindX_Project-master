const argon2 = require('argon2');
const ApiError = require('../error/ApiError');
const { User, Role } = require('../models/index');
const validateCheck = require('../validators/isNullValidator');
const generateHashPassword = require('../utils/generateHashPassword');
const generateJwt = require('../utils/generateJwt');
const securityAuditService = require('../services/securityAuditService');

const DEFAULT_USER_ROLE_ID = 'aff50f23-2fbc-41be-ba07-c1c69c5e388c';
const GENERIC_AUTH_ERROR = 'Неверный логин или пароль';

function errorHandling(error) {
  if (error.name === 'SequelizeUniqueConstraintError') {
    error.message = 'Пользователь с таким именем уже существует!';
  }
}

class UserController {
  async createUser(req, res, next) {
    try {
      let { username, password, roleId } = req.body;
      const role = (await Role.findByPk(roleId, { attributes: ['name'] }))?.dataValues?.name;
      if (!role) {
        roleId = DEFAULT_USER_ROLE_ID;
      }

      const hashPassword = await generateHashPassword(password);
      const user = await User.create({ username, password: hashPassword, roleId });

      await securityAuditService.log({
        req,
        userId: req.user?.id,
        username: req.user?.username,
        action: 'admin.user.create',
        targetType: 'user',
        targetId: user.id,
        details: { createdUsername: username, roleId },
      });

      return res.json({ message: 'Пользователь создан!' });
    } catch (error) {
      errorHandling(error);
      await securityAuditService.log({
        req,
        userId: req.user?.id,
        username: req.user?.username,
        action: 'admin.user.create',
        status: 'failure',
        targetType: 'user',
        details: { attemptedUsername: req.body?.username, reason: error.message },
      });
      return next(ApiError.badRequest(`Ошибка регистрации: ${error.message}`));
    }
  }

  async signup(req, res, next) {
    try {
      const { username, password } = req.body;
      const hashPassword = await generateHashPassword(password);
      const user = await User.create({ username, password: hashPassword });
      const token = generateJwt(user.id, user.username, 'USER', user.tokenVersion);

      await securityAuditService.log({
        req,
        userId: user.id,
        username: user.username,
        action: 'auth.signup',
        targetType: 'user',
        targetId: user.id,
      });

      return res.json({ token });
    } catch (error) {
      errorHandling(error);
      await securityAuditService.log({
        req,
        username: req.body?.username,
        action: 'auth.signup',
        status: 'failure',
        targetType: 'user',
        details: { reason: error.message },
      });
      return next(ApiError.badRequest('Не удалось выполнить регистрацию.'));
    }
  }

  async signin(req, res, next) {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({
        where: { username },
        include: [
          {
            model: Role,
            attributes: ['name'],
            required: false,
          },
        ],
      });

      if (!user) {
        await securityAuditService.log({
          req,
          username,
          action: 'auth.signin',
          status: 'failure',
          targetType: 'user',
          details: { reason: 'user_not_found' },
        });
        return next(ApiError.unauthorized(GENERIC_AUTH_ERROR));
      }

      const comparePassword = await argon2.verify(user.password, password);
      if (!comparePassword) {
        await securityAuditService.log({
          req,
          userId: user.id,
          username: user.username,
          action: 'auth.signin',
          status: 'failure',
          targetType: 'user',
          targetId: user.id,
          details: { reason: 'invalid_password' },
        });
        return next(ApiError.unauthorized(GENERIC_AUTH_ERROR));
      }

      const role = user.role?.name || 'USER';
      const token = generateJwt(user.id, user.username, role, user.tokenVersion);

      await securityAuditService.log({
        req,
        userId: user.id,
        username: user.username,
        action: 'auth.signin',
        targetType: 'user',
        targetId: user.id,
      });

      return res.json({ token });
    } catch (error) {
      await securityAuditService.log({
        req,
        username: req.body?.username,
        action: 'auth.signin',
        status: 'failure',
        targetType: 'user',
        details: { reason: error.message },
      });
      return next(ApiError.unauthorized(GENERIC_AUTH_ERROR));
    }
  }

  async check(req, res, next) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: ['id', 'username', 'roleId', 'tokenVersion'],
        rejectOnEmpty: true,
      });
      const role = await Role.findByPk(user.roleId, {
        attributes: ['name'],
        rejectOnEmpty: true,
      });

      const token = generateJwt(user.id, user.username, role.name, user.tokenVersion);
      res.json({ token });
    } catch {
      return next(ApiError.unauthorized('Токен устарел'));
    }
  }

  async logoutAll(req, res, next) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: ['id', 'username', 'roleId', 'tokenVersion'],
        rejectOnEmpty: true,
      });

      const nextVersion = Number(user.tokenVersion) + 1;
      await user.update({ tokenVersion: nextVersion });

      await securityAuditService.log({
        req,
        userId: user.id,
        username: user.username,
        action: 'auth.logout_all',
        targetType: 'user',
        targetId: user.id,
        details: { nextTokenVersion: nextVersion },
      });

      return res.json({ message: 'Все активные сессии завершены.' });
    } catch (error) {
      return next(ApiError.badRequest(`Ошибка завершения сессий: ${error.message}`));
    }
  }

  async logoutAllUsers(req, res, next) {
    try {
      await User.increment('tokenVersion', {
        by: 1,
        where: {},
      });

      await securityAuditService.log({
        req,
        userId: req.user?.id,
        username: req.user?.username,
        action: 'admin.user.logout_all_sessions',
        targetType: 'user',
        details: { scope: 'all_users' },
      });

      return res.json({ message: 'Все сессии пользователей завершены.' });
    } catch (error) {
      await securityAuditService.log({
        req,
        userId: req.user?.id,
        username: req.user?.username,
        action: 'admin.user.logout_all_sessions',
        status: 'failure',
        targetType: 'user',
        details: { reason: error.message, scope: 'all_users' },
      });
      return next(ApiError.badRequest(`Ошибка завершения всех сессий: ${error.message}`));
    }
  }

  async getAll(req, res, next) {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password', 'roleId'] },
        include: [
          {
            model: Role,
            required: false,
          },
        ],
      });
      res.json(users);
    } catch (error) {
      return next(ApiError.badRequest(`Ошибка получения: ${error.message}`));
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      validateCheck(!id, 'Не задан id пользователя');
      if (id === req.user.id) {
        throw new Error('Нельзя удалить самого себя!');
      }

      const deletedUser = await User.findByPk(id, { attributes: ['id', 'username'] });
      const isDelete = await User.destroy({
        where: {
          id,
        },
      });

      validateCheck(!isDelete, 'Пользователь не найден');

      await securityAuditService.log({
        req,
        userId: req.user?.id,
        username: req.user?.username,
        action: 'admin.user.delete',
        targetType: 'user',
        targetId: id,
        details: { deletedUsername: deletedUser?.username || null },
      });

      res.json({ message: 'Пользователь удален' });
    } catch (error) {
      await securityAuditService.log({
        req,
        userId: req.user?.id,
        username: req.user?.username,
        action: 'admin.user.delete',
        status: 'failure',
        targetType: 'user',
        targetId: req.params?.id,
        details: { reason: error.message },
      });
      return next(ApiError.badRequest(`Ошибка удаления: ${error.message}`));
    }
  }

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      validateCheck(!id, 'Не задан id пользователя');
      const { username, password, roleId } = req.body;

      const user = await User.findByPk(id, {
        attributes: ['id', 'username', 'password', 'roleId', 'tokenVersion'],
      });
      validateCheck(!user, 'Пользователь не найден');

      const hashPassword = password && (await generateHashPassword(password));
      const shouldRotateToken =
        Boolean(hashPassword) || (roleId && roleId !== user.roleId) || (username && username !== user.username);

      const payload = {
        username,
        ...(hashPassword && { password: hashPassword }),
        roleId,
        ...(shouldRotateToken && { tokenVersion: Number(user.tokenVersion) + 1 }),
      };

      const isUpdate = await User.update(payload, {
        where: {
          id,
        },
      });

      validateCheck(!isUpdate[0], 'Пользователь не найден');

      await securityAuditService.log({
        req,
        userId: req.user?.id,
        username: req.user?.username,
        action: 'admin.user.update',
        targetType: 'user',
        targetId: id,
        details: {
          usernameChanged: Boolean(username && username !== user.username),
          passwordChanged: Boolean(hashPassword),
          roleChanged: Boolean(roleId && roleId !== user.roleId),
          tokenRotated: shouldRotateToken,
        },
      });

      res.json({ message: 'Данные пользователя обновлены' });
    } catch (error) {
      errorHandling(error);
      await securityAuditService.log({
        req,
        userId: req.user?.id,
        username: req.user?.username,
        action: 'admin.user.update',
        status: 'failure',
        targetType: 'user',
        targetId: req.params?.id,
        details: { reason: error.message },
      });
      return next(ApiError.badRequest(`Ошибка обновления: ${error.message}`));
    }
  }

  async update(req, res, next) {
    try {
      const id = req.user.id;
      const { username, password } = req.body;
      const user = await User.findByPk(id, {
        attributes: ['id', 'username', 'roleId', 'tokenVersion'],
        include: [
          {
            model: Role,
            attributes: ['name'],
            required: false,
          },
        ],
      });
      validateCheck(!user, 'Пользователь не найден');

      const hashPassword = password && (await generateHashPassword(password));
      const shouldRotateToken = Boolean(hashPassword) || Boolean(username && username !== user.username);
      const nextTokenVersion = shouldRotateToken ? Number(user.tokenVersion) + 1 : user.tokenVersion;

      const isUpdate = await User.update(
        {
          ...(username && { username }),
          ...(hashPassword && { password: hashPassword }),
          ...(shouldRotateToken && { tokenVersion: nextTokenVersion }),
        },
        {
          where: {
            id,
          },
        }
      );

      validateCheck(!isUpdate[0], 'Пользователь не найден');
      const nextUsername = username || user.username;
      const token = generateJwt(id, nextUsername, user.role?.name || req.user.role, nextTokenVersion);

      await securityAuditService.log({
        req,
        userId: id,
        username: nextUsername,
        action: 'user.profile.update',
        targetType: 'user',
        targetId: id,
        details: {
          usernameChanged: Boolean(username && username !== user.username),
          passwordChanged: Boolean(hashPassword),
          tokenRotated: shouldRotateToken,
        },
      });

      res.json({ message: 'Данные пользователя обновлены', token });
    } catch (error) {
      errorHandling(error);
      await securityAuditService.log({
        req,
        userId: req.user?.id,
        username: req.user?.username,
        action: 'user.profile.update',
        status: 'failure',
        targetType: 'user',
        targetId: req.user?.id,
        details: { reason: error.message },
      });
      return next(ApiError.badRequest(`Ошибка обновления: ${error.message}`));
    }
  }
}

module.exports = new UserController();

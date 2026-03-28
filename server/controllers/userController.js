const argon2 = require('argon2');
const { Op } = require('sequelize');
const ApiError = require('../error/ApiError');
const { User, Role, AuthCode, SecurityEvent } = require('../models/index');
const validateCheck = require('../validators/isNullValidator');
const generateHashPassword = require('../utils/generateHashPassword');
const generateJwt = require('../utils/generateJwt');
const securityAuditService = require('../services/securityAuditService');
const authCodeService = require('../services/authCodeService');
const trustedDeviceService = require('../services/trustedDeviceService');
const emailService = require('../services/emailService');
const accountProtectionService = require('../services/accountProtectionService');
const suspiciousActivityService = require('../services/suspiciousActivityService');

const DEFAULT_USER_ROLE_ID = 'aff50f23-2fbc-41be-ba07-c1c69c5e388c';
const GENERIC_AUTH_ERROR = 'Неверный логин/email или пароль';

function errorHandling(error) {
  if (error.name === 'SequelizeUniqueConstraintError') {
    error.message = 'Пользователь с таким логином или email уже существует!';
  }
}

class UserController {
  constructor() {
    this.createUser = this.createUser.bind(this);
    this.signup = this.signup.bind(this);
    this.verifyEmail = this.verifyEmail.bind(this);
    this.resendVerification = this.resendVerification.bind(this);
    this.signin = this.signin.bind(this);
    this.verifyTwoFactor = this.verifyTwoFactor.bind(this);
    this.check = this.check.bind(this);
    this.getProfile = this.getProfile.bind(this);
    this.logoutAll = this.logoutAll.bind(this);
    this.logoutAllUsers = this.logoutAllUsers.bind(this);
    this.getAll = this.getAll.bind(this);
    this.delete = this.delete.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.update = this.update.bind(this);
  }

  buildUserDto(user) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
      role: user.role?.name || null,
    };
  }

  issueAuthToken(user) {
    return generateJwt(user.id, user.username, user.role?.name || 'USER', user.tokenVersion);
  }

  getRequestIp(req) {
    return securityAuditService.getRequestIp(req);
  }

  async notifyAboutNewDevice(req, user) {
    const knownSignin = await SecurityEvent.findOne({
      where: {
        userId: user.id,
        action: {
          [Op.in]: ['auth.signin', 'auth.signin.2fa_success'],
        },
        status: 'success',
        userAgent: req?.headers?.['user-agent'] || null,
        ipAddress: this.getRequestIp(req),
      },
    });

    if (knownSignin) {
      return;
    }

    await emailService.sendSecurityNotification({
      to: user.email,
      subject: 'Новый вход в аккаунт',
      title: 'Обнаружен вход с нового устройства',
      lines: [
        `Аккаунт: ${user.username}`,
        `IP: ${this.getRequestIp(req) || 'не определён'}`,
        `Время: ${new Date().toLocaleString('ru-RU')}`,
        'Если это были не вы, смените пароль и завершите все активные сессии.',
      ],
    });
  }

  async createUser(req, res, next) {
    try {
      let { username, email, password, roleId, isTwoFactorEnabled = false, isEmailVerified = true } = req.body;
      const role = (await Role.findByPk(roleId, { attributes: ['name'] }))?.dataValues?.name;
      if (!role) {
        roleId = DEFAULT_USER_ROLE_ID;
      }

      const hashPassword = await generateHashPassword(password);
      const user = await User.create({
        username,
        email,
        password: hashPassword,
        roleId,
        isTwoFactorEnabled,
        isEmailVerified,
        lastPasswordChangedAt: new Date(),
      });

      await securityAuditService.log({
        req,
        userId: req.user?.id,
        username: req.user?.username,
        action: 'admin.user.create',
        targetType: 'user',
        targetId: user.id,
        details: { createdUsername: username, email, roleId, isTwoFactorEnabled, isEmailVerified },
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
        details: { attemptedUsername: req.body?.username, attemptedEmail: req.body?.email, reason: error.message },
      });
      return next(ApiError.badRequest(`Ошибка создания пользователя: ${error.message}`));
    }
  }

  async signup(req, res, next) {
    try {
      const { username, email, password } = req.body;
      const hashPassword = await generateHashPassword(password);
      const user = await User.create({
        username,
        email,
        password: hashPassword,
        isEmailVerified: false,
        lastPasswordChangedAt: new Date(),
      });

      await authCodeService.createEmailVerificationCode(user);

      await securityAuditService.log({
        req,
        userId: user.id,
        username: user.username,
        action: 'auth.signup',
        targetType: 'user',
        targetId: user.id,
        details: { email: user.email },
      });

      return res.json({
        message: 'Код подтверждения отправлен на почту.',
        requiresEmailVerification: true,
        email: user.email,
      });
    } catch (error) {
      errorHandling(error);
      await securityAuditService.log({
        req,
        username: req.body?.username,
        action: 'auth.signup',
        status: 'failure',
        targetType: 'user',
        details: { email: req.body?.email, reason: error.message },
      });
      return next(ApiError.badRequest('Не удалось выполнить регистрацию.'));
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const { email, code } = req.body;
      const user = await User.findOne({
        where: { email },
        include: [{ model: Role, attributes: ['name'], required: false }],
      });

      validateCheck(!user, '???????????? ?? ??????.');

      if (user.isEmailVerified) {
        const token = this.issueAuthToken(user);
        return res.json({
          message: '????? ??? ????????????.',
          token,
        });
      }

      const normalizedCode = String(code || '').replace(/\s+/g, '');
      const isValid = await authCodeService.consumeCode({
        userId: user.id,
        purpose: 'email_verification',
        code: normalizedCode,
      });
      validateCheck(!isValid, '???????? ??? ???????????? ???.');

      user.isEmailVerified = true;
      await user.save();

      const token = this.issueAuthToken(user);

      await securityAuditService.log({
        req,
        userId: user.id,
        username: user.username,
        action: 'auth.verify_email',
        targetType: 'user',
        targetId: user.id,
        details: { email: user.email },
      });

      return res.json({
        message: '????? ????????????.',
        token,
      });
    } catch (error) {
      await securityAuditService.log({
        req,
        action: 'auth.verify_email',
        status: 'failure',
        targetType: 'user',
        details: { email: req.body?.email, reason: error.message },
      });
      return next(ApiError.badRequest(error.message));
    }
  }

  async resendVerification(req, res, next) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ where: { email } });
      validateCheck(!user, 'Пользователь не найден.');
      validateCheck(user.isEmailVerified, 'Почта уже подтверждена.');

      await authCodeService.createEmailVerificationCode(user);

      await securityAuditService.log({
        req,
        userId: user.id,
        username: user.username,
        action: 'auth.resend_verification',
        targetType: 'user',
        targetId: user.id,
        details: { email: user.email },
      });

      return res.json({ message: 'Новый код отправлен на почту.' });
    } catch (error) {
      return next(ApiError.badRequest(error.message));
    }
  }

  async signin(req, res, next) {
    try {
      const { identifier, password } = req.body;
      const user = await User.findOne({
        where: {
          [Op.or]: [{ username: identifier }, { email: identifier }],
        },
        include: [{ model: Role, attributes: ['name'], required: false }],
      });

      if (!user) {
        await securityAuditService.log({
          req,
          username: identifier,
          action: 'auth.signin',
          status: 'failure',
          targetType: 'user',
          details: { reason: 'user_not_found' },
        });
        return next(ApiError.unauthorized(GENERIC_AUTH_ERROR));
      }

      accountProtectionService.assertNotLocked(user);

      const comparePassword = await argon2.verify(user.password, password);
      if (!comparePassword) {
        const failedState = await accountProtectionService.registerFailedLogin(req, user, 'invalid_password');
        await securityAuditService.log({
          req,
          userId: user.id,
          username: user.username,
          action: 'auth.signin',
          status: 'failure',
          targetType: 'user',
          targetId: user.id,
          details: {
            reason: 'invalid_password',
            failedAttempts: failedState?.failedAttempts || null,
            lockedUntil: failedState?.loginLockUntil || null,
          },
        });
        return next(ApiError.unauthorized(GENERIC_AUTH_ERROR));
      }

      await accountProtectionService.resetLoginFailures(user);

      if (!user.isEmailVerified) {
        return next(
          ApiError.forbidden(
            '????? ?? ????????????. ??????? ????????? ?????????? ??? ??? ????????? ????? ??? ?? ?????? ?????????????.'
          )
        );
      }

      const isTrusted = await trustedDeviceService.isTrusted(req, user.id);
      if (user.isTwoFactorEnabled && !isTrusted) {
        const challengeToken = await authCodeService.createTwoFactorCode(user);

        await securityAuditService.log({
          req,
          userId: user.id,
          username: user.username,
          action: 'auth.signin.challenge',
          targetType: 'user',
          targetId: user.id,
          details: { viaTrustedDevice: false },
        });

        return res.json({
          requiresTwoFactor: true,
          challengeToken,
          email: user.email,
          message: '??? ????????????? ????????? ?? ?????.',
        });
      }

      await this.notifyAboutNewDevice(req, user);

      const token = this.issueAuthToken(user);

      await securityAuditService.log({
        req,
        userId: user.id,
        username: user.username,
        action: 'auth.signin',
        targetType: 'user',
        targetId: user.id,
        details: { viaTrustedDevice: isTrusted },
      });

      return res.json({ token });
    } catch (error) {
      await securityAuditService.log({
        req,
        username: req.body?.identifier,
        action: 'auth.signin',
        status: 'failure',
        targetType: 'user',
        details: { reason: error.message },
      });
      if (error.status) {
        return next(error);
      }
      return next(ApiError.unauthorized(GENERIC_AUTH_ERROR));
    }
  }

  async verifyTwoFactor(req, res, next) {
    try {
      const { challengeToken, code, rememberDevice } = req.body;
      const codeEntryUser = await AuthCode.findOne({
        where: { challengeToken, purpose: 'two_factor', consumedAt: null },
        include: [{ model: User, include: [{ model: Role, attributes: ['name'], required: false }] }],
      });

      validateCheck(!codeEntryUser?.user, '?????? ????????????? ?? ???????.');
      accountProtectionService.assertNotLocked(codeEntryUser.user);

      const valid = await authCodeService.consumeCode({
        userId: codeEntryUser.user.id,
        purpose: 'two_factor',
        code,
        challengeToken,
      });
      if (!valid) {
        const failedState = await accountProtectionService.registerFailedLogin(req, codeEntryUser.user, 'invalid_two_factor_code');
        await securityAuditService.log({
          req,
          userId: codeEntryUser.user.id,
          username: codeEntryUser.user.username,
          action: 'auth.signin.2fa_failure',
          status: 'failure',
          targetType: 'user',
          targetId: codeEntryUser.user.id,
          details: {
            failedAttempts: failedState?.failedAttempts || null,
            lockedUntil: failedState?.loginLockUntil || null,
          },
        });
        return next(
          ApiError.badRequest(
            failedState?.shouldLock
              ? accountProtectionService.getLockMessage({ loginLockUntil: failedState.loginLockUntil })
              : '???????? ??? ???????????? ???.'
          )
        );
      }

      await accountProtectionService.resetLoginFailures(codeEntryUser.user);

      if (rememberDevice) {
        await trustedDeviceService.rememberDevice(res, codeEntryUser.user.id);
      }

      await this.notifyAboutNewDevice(req, codeEntryUser.user);

      const token = this.issueAuthToken(codeEntryUser.user);

      await securityAuditService.log({
        req,
        userId: codeEntryUser.user.id,
        username: codeEntryUser.user.username,
        action: 'auth.signin.2fa_success',
        targetType: 'user',
        targetId: codeEntryUser.user.id,
        details: { rememberDevice: Boolean(rememberDevice) },
      });

      return res.json({ token });
    } catch (error) {
      return next(ApiError.badRequest(error.message));
    }
  }

  async check(req, res, next) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: ['id', 'username', 'email', 'roleId', 'tokenVersion', 'isTwoFactorEnabled', 'isEmailVerified'],
        include: [{ model: Role, attributes: ['name'], required: false }],
        rejectOnEmpty: true,
      });

      const token = this.issueAuthToken(user);
      res.json({ token });
    } catch {
      return next(ApiError.unauthorized('Токен устарел'));
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: ['id', 'username', 'email', 'isTwoFactorEnabled', 'isEmailVerified'],
        include: [{ model: Role, attributes: ['id', 'name'], required: false }],
        rejectOnEmpty: true,
      });

      return res.json(this.buildUserDto(user));
    } catch (error) {
      return next(ApiError.badRequest(`Ошибка получения профиля: ${error.message}`));
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
      await trustedDeviceService.revokeAllForUser(res, user.id);

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
      await trustedDeviceService.revokeAll(res);

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
        include: [{ model: Role, required: false }],
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

      const deletedUser = await User.findByPk(id, { attributes: ['id', 'username', 'email'] });
      const isDelete = await User.destroy({ where: { id } });
      validateCheck(!isDelete, 'Пользователь не найден');

      await securityAuditService.log({
        req,
        userId: req.user?.id,
        username: req.user?.username,
        action: 'admin.user.delete',
        targetType: 'user',
        targetId: id,
        details: { deletedUsername: deletedUser?.username || null, email: deletedUser?.email || null },
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
      validateCheck(!id, '?? ????? id ????????????');
      const { username, email, password, roleId, isTwoFactorEnabled, isEmailVerified } = req.body;

      const user = await User.findByPk(id, {
        attributes: [
          'id',
          'username',
          'email',
          'roleId',
          'tokenVersion',
          'isTwoFactorEnabled',
          'isEmailVerified',
          'failedLoginAttempts',
          'loginLockUntil',
        ],
      });
      validateCheck(!user, '???????????? ?? ??????');

      const hashPassword = password && (await generateHashPassword(password));
      const emailChanged = Boolean(email && email !== user.email);
      const passwordChanged = Boolean(hashPassword);
      const shouldRotateToken =
        passwordChanged ||
        (roleId && roleId !== user.roleId) ||
        (username && username !== user.username) ||
        emailChanged ||
        (typeof isTwoFactorEnabled === 'boolean' && isTwoFactorEnabled !== user.isTwoFactorEnabled);

      const payload = {
        ...(username && { username }),
        ...(email && { email }),
        ...(typeof isTwoFactorEnabled === 'boolean' && { isTwoFactorEnabled }),
        ...(typeof isEmailVerified === 'boolean' && { isEmailVerified }),
        ...(passwordChanged && { password: hashPassword, lastPasswordChangedAt: new Date() }),
        ...(roleId && { roleId }),
        ...(shouldRotateToken && { tokenVersion: Number(user.tokenVersion) + 1 }),
        ...(passwordChanged && { failedLoginAttempts: 0, loginLockUntil: null }),
      };

      const isUpdate = await User.update(payload, { where: { id } });
      validateCheck(!isUpdate[0], '???????????? ?? ??????');

      const updatedUser = await User.findByPk(id, {
        include: [{ model: Role, attributes: ['name'], required: false }],
      });

      if (emailChanged) {
        await securityAuditService.log({
          req,
          userId: id,
          username: updatedUser.username,
          action: 'user.email.change',
          targetType: 'user',
          targetId: id,
          details: {
            previousEmail: user.email,
            nextEmail: updatedUser.email,
            changedByAdmin: true,
          },
        });

        await suspiciousActivityService.checkFrequentEmailChanges(req, {
          id,
          username: updatedUser.username,
        });
      }

      if (passwordChanged) {
        await emailService.sendSecurityNotification({
          to: updatedUser.email,
          subject: '?????? ???????? ???????',
          title: '? ???????? ??????? ??????',
          lines: [
            '???????: ' + updatedUser.username,
            '?????: ' + new Date().toLocaleString('ru-RU'),
            '???? ??? ???? ?? ??, ?????? ??????? ?????? ? ????????? ??? ??????.',
          ],
        });
      }

      await securityAuditService.log({
        req,
        userId: req.user?.id,
        username: req.user?.username,
        action: 'admin.user.update',
        targetType: 'user',
        targetId: id,
        details: {
          usernameChanged: Boolean(username && username !== user.username),
          emailChanged,
          passwordChanged,
          roleChanged: Boolean(roleId && roleId !== user.roleId),
          twoFactorChanged: typeof isTwoFactorEnabled === 'boolean' && isTwoFactorEnabled !== user.isTwoFactorEnabled,
          emailVerifiedChanged: typeof isEmailVerified === 'boolean' && isEmailVerified !== user.isEmailVerified,
          tokenRotated: shouldRotateToken,
        },
      });

      res.json({ message: '?????? ???????????? ?????????' });
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
      return next(ApiError.badRequest(`?????? ??????????: ${error.message}`));
    }
  }

  async update(req, res, next) {
    try {
      const id = req.user.id;
      const { username, email, password, isTwoFactorEnabled } = req.body;
      const user = await User.findByPk(id, {
        attributes: [
          'id',
          'username',
          'email',
          'roleId',
          'tokenVersion',
          'isTwoFactorEnabled',
          'isEmailVerified',
          'failedLoginAttempts',
          'loginLockUntil',
        ],
        include: [{ model: Role, attributes: ['name'], required: false }],
      });
      validateCheck(!user, '???????????? ?? ??????');

      const nextUsername = username?.trim() || user.username;
      const nextEmail = email?.trim() || user.email;
      const hashPassword = password && (await generateHashPassword(password));
      const passwordChanged = Boolean(hashPassword);
      const emailChanged = Boolean(email && nextEmail !== user.email);
      const shouldRotateToken =
        passwordChanged ||
        Boolean(username && nextUsername !== user.username) ||
        emailChanged ||
        (typeof isTwoFactorEnabled === 'boolean' && isTwoFactorEnabled !== user.isTwoFactorEnabled);
      const nextTokenVersion = shouldRotateToken ? Number(user.tokenVersion) + 1 : user.tokenVersion;

      const isUpdate = await User.update(
        {
          ...(username && { username: nextUsername }),
          ...(email && { email: nextEmail }),
          ...(emailChanged && { isEmailVerified: false }),
          ...(typeof isTwoFactorEnabled === 'boolean' && { isTwoFactorEnabled }),
          ...(passwordChanged && {
            password: hashPassword,
            lastPasswordChangedAt: new Date(),
            failedLoginAttempts: 0,
            loginLockUntil: null,
          }),
          ...(shouldRotateToken && { tokenVersion: nextTokenVersion }),
        },
        { where: { id } }
      );

      validateCheck(!isUpdate[0], '???????????? ?? ??????');

      if (emailChanged) {
        await authCodeService.createEmailVerificationCode({
          id,
          email: nextEmail,
        });

        await securityAuditService.log({
          req,
          userId: id,
          username: nextUsername,
          action: 'user.email.change',
          targetType: 'user',
          targetId: id,
          details: {
            previousEmail: user.email,
            nextEmail,
          },
        });

        await suspiciousActivityService.checkFrequentEmailChanges(req, {
          id,
          username: nextUsername,
        });
      }

      const refreshedUser = await User.findByPk(id, {
        include: [{ model: Role, attributes: ['name'], required: false }],
      });

      if (passwordChanged) {
        await emailService.sendSecurityNotification({
          to: refreshedUser.email,
          subject: '?????? ???????? ???????',
          title: '? ????? ???????? ??????? ??????',
          lines: [
            '???????: ' + refreshedUser.username,
            '?????: ' + new Date().toLocaleString('ru-RU'),
            '???? ??? ???? ?? ??, ?????? ??????? ?????? ? ????????? ??? ??????.',
          ],
        });
      }

      const token = this.issueAuthToken(refreshedUser);

      await securityAuditService.log({
        req,
        userId: id,
        username: nextUsername,
        action: 'user.profile.update',
        targetType: 'user',
        targetId: id,
        details: {
          usernameChanged: Boolean(username && nextUsername !== user.username),
          emailChanged,
          passwordChanged,
          twoFactorChanged: typeof isTwoFactorEnabled === 'boolean' && isTwoFactorEnabled !== user.isTwoFactorEnabled,
          tokenRotated: shouldRotateToken,
        },
      });

      res.json({
        message: emailChanged
          ? '??????? ????????. ??????????? ????? ????? ????? ?? ??????.'
          : '?????? ???????????? ?????????',
        token,
      });
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
      return next(ApiError.badRequest(`?????? ??????????: ${error.message}`));
    }
  }

}

module.exports = new UserController();

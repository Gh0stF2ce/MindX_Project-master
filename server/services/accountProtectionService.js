const ApiError = require('../error/ApiError');
const securityAuditService = require('./securityAuditService');

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCK_MINUTES = 15;

class AccountProtectionService {
  isLocked(user) {
    return Boolean(user?.loginLockUntil && new Date(user.loginLockUntil) > new Date());
  }

  getLockMessage(user) {
    if (!this.isLocked(user)) {
      return null;
    }

    return `Аккаунт временно заблокирован после нескольких неудачных попыток входа. Повторите после ${new Date(
      user.loginLockUntil
    ).toLocaleString('ru-RU')}.`;
  }

  assertNotLocked(user) {
    if (this.isLocked(user)) {
      throw ApiError.forbidden(this.getLockMessage(user));
    }
  }

  async registerFailedLogin(req, user, reason = 'invalid_credentials') {
    if (!user) {
      return null;
    }

    const failedAttempts = Number(user.failedLoginAttempts || 0) + 1;
    const shouldLock = failedAttempts >= MAX_FAILED_LOGIN_ATTEMPTS;
    const loginLockUntil = shouldLock ? new Date(Date.now() + LOGIN_LOCK_MINUTES * 60 * 1000) : null;

    await user.update({
      failedLoginAttempts: failedAttempts,
      loginLockUntil,
    });

    if (shouldLock) {
      await securityAuditService.log({
        req,
        userId: user.id,
        username: user.username,
        action: 'security.suspicious.login_failures',
        status: 'warning',
        targetType: 'user',
        targetId: user.id,
        details: {
          failedAttempts,
          reason,
          loginLockUntil,
        },
      });
    }

    return {
      failedAttempts,
      loginLockUntil,
      shouldLock,
    };
  }

  async resetLoginFailures(user) {
    if (!user) {
      return;
    }

    if (!user.failedLoginAttempts && !user.loginLockUntil) {
      return;
    }

    await user.update({
      failedLoginAttempts: 0,
      loginLockUntil: null,
    });
  }
}

module.exports = new AccountProtectionService();

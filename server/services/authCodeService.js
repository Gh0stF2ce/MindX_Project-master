const crypto = require('crypto');
const { Op } = require('sequelize');
const { AuthCode } = require('../models');
const hashValue = require('../utils/hashValue');
const emailService = require('./emailService');

const CODE_TTL_MINUTES = 10;

class AuthCodeService {
  generateCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  generateChallengeToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  async clearActiveCodes(userId, purpose) {
    await AuthCode.destroy({
      where: {
        userId,
        purpose,
        consumedAt: null,
      },
    });
  }

  async createEmailVerificationCode(user) {
    await this.clearActiveCodes(user.id, 'email_verification');
    const code = this.generateCode();

    await AuthCode.create({
      userId: user.id,
      purpose: 'email_verification',
      email: user.email,
      codeHash: hashValue(code),
      expiresAt: new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000),
    });

    await emailService.sendCodeEmail({
      to: user.email,
      code,
      subject: 'Подтверждение почты',
      title: 'Подтвердите почту',
    });
  }

  async createTwoFactorCode(user) {
    await this.clearActiveCodes(user.id, 'two_factor');
    const code = this.generateCode();
    const challengeToken = this.generateChallengeToken();

    await AuthCode.create({
      userId: user.id,
      purpose: 'two_factor',
      email: user.email,
      codeHash: hashValue(code),
      challengeToken,
      expiresAt: new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000),
    });

    await emailService.sendCodeEmail({
      to: user.email,
      code,
      subject: 'Код входа',
      title: 'Подтвердите вход',
    });

    return challengeToken;
  }

  async createPasswordResetCode(user) {
    await this.clearActiveCodes(user.id, 'password_reset');
    const code = this.generateCode();

    await AuthCode.create({
      userId: user.id,
      purpose: 'password_reset',
      email: user.email,
      codeHash: hashValue(code),
      expiresAt: new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000),
    });

    await emailService.sendCodeEmail({
      to: user.email,
      code,
      subject: 'Сброс пароля',
      title: 'Код для сброса пароля',
    });
  }

  async consumeCode({ userId, purpose, code, challengeToken = null }) {
    const where = {
      userId,
      purpose,
      consumedAt: null,
      expiresAt: {
        [Op.gt]: new Date(),
      },
    };

    if (challengeToken) {
      where.challengeToken = challengeToken;
    }

    const authCode = await AuthCode.findOne({
      where,
      order: [['createdAt', 'DESC']],
    });

    if (!authCode) {
      return false;
    }

    if (authCode.codeHash !== hashValue(String(code || '').replace(/\s+/g, ''))) {
      return false;
    }

    authCode.consumedAt = new Date();
    await authCode.save();
    return true;
  }
}

module.exports = new AuthCodeService();

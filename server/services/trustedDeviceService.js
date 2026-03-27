const crypto = require('crypto');
const { Op } = require('sequelize');
const { TrustedDevice } = require('../models');
const hashValue = require('../utils/hashValue');
const parseCookies = require('../utils/parseCookies');

const COOKIE_NAME = 'mindx_trusted_device';
const TRUSTED_DEVICE_DAYS = 30;

class TrustedDeviceService {
  createToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  buildCookieValue(userId, token) {
    return `${userId}:${token}`;
  }

  setTrustedDeviceCookie(res, userId, token) {
    res.cookie(COOKIE_NAME, this.buildCookieValue(userId, token), {
      httpOnly: true,
      secure: process.env.MODE === 'PROD',
      sameSite: 'lax',
      maxAge: TRUSTED_DEVICE_DAYS * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }

  clearTrustedDeviceCookie(res) {
    res.clearCookie(COOKIE_NAME, {
      path: '/',
      sameSite: 'lax',
      secure: process.env.MODE === 'PROD',
      httpOnly: true,
    });
  }

  async rememberDevice(res, userId) {
    const token = this.createToken();
    await TrustedDevice.create({
      userId,
      tokenHash: hashValue(token),
      expiresAt: new Date(Date.now() + TRUSTED_DEVICE_DAYS * 24 * 60 * 60 * 1000),
      lastUsedAt: new Date(),
    });

    this.setTrustedDeviceCookie(res, userId, token);
  }

  async isTrusted(req, userId) {
    const cookies = parseCookies(req.headers.cookie);
    const cookieValue = cookies[COOKIE_NAME];
    if (!cookieValue) {
      return false;
    }

    const [cookieUserId, token] = cookieValue.split(':');
    if (!cookieUserId || !token || cookieUserId !== userId) {
      return false;
    }

    const trustedDevice = await TrustedDevice.findOne({
      where: {
        userId,
        tokenHash: hashValue(token),
        expiresAt: {
          [Op.gt]: new Date(),
        },
      },
      order: [['createdAt', 'DESC']],
    });

    if (!trustedDevice) {
      return false;
    }

    trustedDevice.lastUsedAt = new Date();
    await trustedDevice.save();
    return true;
  }

  async revokeAllForUser(res, userId) {
    await TrustedDevice.destroy({ where: { userId } });
    this.clearTrustedDeviceCookie(res);
  }

  async revokeAll(res) {
    await TrustedDevice.destroy({ where: {} });
    this.clearTrustedDeviceCookie(res);
  }
}

module.exports = new TrustedDeviceService();

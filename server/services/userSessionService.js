const { Op } = require('sequelize');
const { UserSession } = require('../models');
const securityAuditService = require('./securityAuditService');

const SESSION_HOURS = 24;

class UserSessionService {
  getRequestIp(req) {
    return securityAuditService.getRequestIp(req);
  }

  getRequestUserAgent(req) {
    return req?.headers?.['user-agent'] || null;
  }

  async createSession(req, userId, rememberDevice = false) {
    return UserSession.create({
      userId,
      ipAddress: this.getRequestIp(req),
      userAgent: this.getRequestUserAgent(req),
      lastUsedAt: new Date(),
      expiresAt: new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000),
      rememberDevice: Boolean(rememberDevice),
    });
  }

  async getActiveSession(userId, sessionId) {
    if (!sessionId) {
      return null;
    }

    return UserSession.findOne({
      where: {
        userId,
        sessionId,
        revokedAt: null,
        expiresAt: {
          [Op.gt]: new Date(),
        },
      },
    });
  }

  async touchSession(sessionId) {
    if (!sessionId) {
      return;
    }

    await UserSession.update(
      {
        lastUsedAt: new Date(),
      },
      {
        where: {
          sessionId,
          revokedAt: null,
        },
      }
    );
  }

  async listSessions(userId, currentSessionId = null) {
    const sessions = await UserSession.findAll({
      where: {
        userId,
        revokedAt: null,
        expiresAt: {
          [Op.gt]: new Date(),
        },
      },
      order: [['lastUsedAt', 'DESC']],
    });

    return sessions.map((session) => ({
      id: session.id,
      sessionId: session.sessionId,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      lastUsedAt: session.lastUsedAt,
      expiresAt: session.expiresAt,
      rememberDevice: session.rememberDevice,
      isCurrent: currentSessionId ? session.sessionId === currentSessionId : false,
    }));
  }

  async revokeSession(userId, sessionId) {
    const [count] = await UserSession.update(
      {
        revokedAt: new Date(),
      },
      {
        where: {
          userId,
          sessionId,
          revokedAt: null,
        },
      }
    );

    return count > 0;
  }

  async revokeAllForUser(userId, exceptSessionId = null) {
    const where = {
      userId,
      revokedAt: null,
    };

    if (exceptSessionId) {
      where.sessionId = {
        [Op.ne]: exceptSessionId,
      };
    }

    await UserSession.update(
      {
        revokedAt: new Date(),
      },
      {
        where,
      }
    );
  }

  async revokeAll() {
    await UserSession.update(
      {
        revokedAt: new Date(),
      },
      {
        where: {
          revokedAt: null,
        },
      }
    );
  }
}

module.exports = new UserSessionService();

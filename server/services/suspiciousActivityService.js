const { Op } = require('sequelize');
const { SecurityEvent } = require('../models');
const securityAuditService = require('./securityAuditService');

const EMAIL_CHANGE_WINDOW_HOURS = 24;
const EMAIL_CHANGE_THRESHOLD = 3;

class SuspiciousActivityService {
  async checkFrequentEmailChanges(req, user) {
    if (!user?.id) {
      return;
    }

    const since = new Date(Date.now() - EMAIL_CHANGE_WINDOW_HOURS * 60 * 60 * 1000);
    const count = await SecurityEvent.count({
      where: {
        userId: user.id,
        action: 'user.email.change',
        createdAt: {
          [Op.gte]: since,
        },
      },
    });

    if (count >= EMAIL_CHANGE_THRESHOLD) {
      await securityAuditService.log({
        req,
        userId: user.id,
        username: user.username,
        action: 'security.suspicious.email_change_frequency',
        status: 'warning',
        targetType: 'user',
        targetId: user.id,
        details: {
          changesInWindow: count,
          windowHours: EMAIL_CHANGE_WINDOW_HOURS,
        },
      });
    }
  }
}

module.exports = new SuspiciousActivityService();

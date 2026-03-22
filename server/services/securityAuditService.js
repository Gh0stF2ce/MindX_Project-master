const { SecurityEvent } = require('../models');

class SecurityAuditService {
  async log({
    req,
    userId = null,
    username = null,
    action,
    status = 'success',
    targetType = null,
    targetId = null,
    details = null,
  }) {
    try {
      await SecurityEvent.create({
        userId,
        username,
        action,
        status,
        targetType,
        targetId,
        ipAddress: req?.ip || req?.headers?.['x-forwarded-for'] || null,
        userAgent: req?.headers?.['user-agent'] || null,
        details: details ? JSON.stringify(details) : null,
      });
    } catch (error) {
      console.error('[SECURITY AUDIT ERROR]', error.message);
    }
  }
}

module.exports = new SecurityAuditService();

const { SecurityEvent } = require('../models');

class SecurityAuditService {
  getRequestIp(req) {
    const forwarded = req?.headers?.['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length > 0) {
      return forwarded.split(',')[0].trim();
    }

    return req?.ip || null;
  }

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
        ipAddress: this.getRequestIp(req),
        userAgent: req?.headers?.['user-agent'] || null,
        details: details ? JSON.stringify(details) : null,
      });
    } catch (error) {
      console.error('[SECURITY AUDIT ERROR]', error.message);
    }
  }
}

module.exports = new SecurityAuditService();

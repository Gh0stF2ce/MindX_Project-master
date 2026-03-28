const rateLimit = require('express-rate-limit');
const securityAuditService = require('../services/securityAuditService');

const createAuthLimiter = ({ windowMs, max, message, action }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: async (req, res) => {
      await securityAuditService.log({
        req,
        username: req.body?.identifier || req.body?.username || req.body?.email || null,
        action,
        status: 'warning',
        targetType: 'route',
        targetId: req.originalUrl,
        details: {
          method: req.method,
          source: 'auth_rate_limit',
        },
      });

      return res.status(429).json({ error: message });
    },
  });

const signinLimiter = createAuthLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Слишком много попыток входа. Повторите позже.',
  action: 'security.suspicious.mass_requests',
});

const signupLimiter = createAuthLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Слишком много попыток регистрации. Повторите позже.',
  action: 'security.suspicious.mass_requests',
});

module.exports = {
  signinLimiter,
  signupLimiter,
};

const rateLimit = require('express-rate-limit');

const createAuthLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: message },
  });

const signinLimiter = createAuthLimiter(
  15 * 60 * 1000,
  10,
  'Слишком много попыток входа. Повторите позже.'
);

const signupLimiter = createAuthLimiter(
  60 * 60 * 1000,
  5,
  'Слишком много попыток регистрации. Повторите позже.'
);

module.exports = {
  signinLimiter,
  signupLimiter,
};

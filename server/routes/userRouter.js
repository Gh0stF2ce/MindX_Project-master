const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middlewares/authMiddleware')
const validateRequest = require("../middlewares/validateRequest");
const {
  userPutSchema,
  userPostSchema,
  signinSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  verifyTwoFactorSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../schemas/userSchema");
const { signinLimiter, signupLimiter } = require('../middlewares/authRateLimiters');

router.put('/profile', authMiddleware(), validateRequest(userPutSchema), userController.update)
router.get('/profile', authMiddleware(), userController.getProfile)
router.get('/sessions', authMiddleware(), userController.getSessions)
router.delete('/sessions/:sessionId', authMiddleware(), userController.logoutSession)
router.post('/signup', signupLimiter, validateRequest(userPostSchema), userController.signup)
router.post('/signin', signinLimiter, validateRequest(signinSchema), userController.signin)
router.post('/verify-email', validateRequest(verifyEmailSchema), userController.verifyEmail)
router.post('/resend-verification', validateRequest(resendVerificationSchema), userController.resendVerification)
router.post('/forgot-password', validateRequest(forgotPasswordSchema), userController.forgotPassword)
router.post('/reset-password', validateRequest(resetPasswordSchema), userController.resetPassword)
router.post('/verify-2fa', validateRequest(verifyTwoFactorSchema), userController.verifyTwoFactor)
router.get('/auth', authMiddleware(), userController.check)
router.post('/logout', authMiddleware(), userController.logout)
router.post('/logout-all', authMiddleware(), userController.logoutAll)
router.put('/:id', authMiddleware(), validateRequest(userPutSchema), userController.update)

module.exports = router

const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middlewares/authMiddleware')
const validateRequest = require("../middlewares/validateRequest");
const { userPutSchema, userPostSchema, signinSchema } = require("../schemas/userSchema");
const { signinLimiter, signupLimiter } = require('../middlewares/authRateLimiters');

router.put('/:id', authMiddleware(), validateRequest(userPutSchema), userController.update)
router.post('/signup', signupLimiter, validateRequest(userPostSchema), userController.signup)
router.post('/signin', signinLimiter, validateRequest(signinSchema), userController.signin)
router.get('/auth', authMiddleware(), userController.check)
router.post('/logout-all', authMiddleware(), userController.logoutAll)

module.exports = router

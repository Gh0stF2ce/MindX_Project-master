const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middlewares/authMiddleware')
const validateRequest = require("../middlewares/validateRequest");
const { userPutSchema, userPostSchema } = require("../schemas/userSchema");

router.put('/:id', authMiddleware(), validateRequest(userPutSchema), userController.update)
router.post('/signup', validateRequest(userPostSchema), userController.signup)
router.post('/signin', userController.signin)
router.get('/auth', authMiddleware(), userController.check)

module.exports = router
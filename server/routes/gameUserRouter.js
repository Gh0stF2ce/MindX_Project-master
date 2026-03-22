const Router = require('express')
const router = new Router()
const userAnswerController = require('../controllers/userAnswerController')
const gameController = require('../controllers/gameController')
const mathInvadersController = require('../controllers/mathInvadersController')
const checkRoleForGameMiddleware = require('../middlewares/checkRoleForGameMiddleware')
const checkStartEndGameMiddleware = require('../middlewares/checkStartEndGameMiddleware')
const validateRequest = require("../middlewares/validateRequest");
const { userAnswerSchema } = require("../schemas/userAnswerSchema");

router.post('/:id/invaders/join', checkRoleForGameMiddleware(), checkStartEndGameMiddleware(), mathInvadersController.join)
router.post('/:id/invaders/ready', checkRoleForGameMiddleware(), checkStartEndGameMiddleware(), mathInvadersController.ready)
router.get('/:id/invaders/state', checkRoleForGameMiddleware(), checkStartEndGameMiddleware(), mathInvadersController.state)
router.post('/:id/invaders/move', checkRoleForGameMiddleware(), checkStartEndGameMiddleware(), mathInvadersController.move)
router.post('/:id/invaders/spend', checkRoleForGameMiddleware(), checkStartEndGameMiddleware(), mathInvadersController.spend)
router.post('/:id/invaders/capture', checkRoleForGameMiddleware(), checkStartEndGameMiddleware(), mathInvadersController.capture)
router.post('/:id/invaders/answer', checkRoleForGameMiddleware(), checkStartEndGameMiddleware(), mathInvadersController.answer)
router.post('/:id/invaders/timeout', checkRoleForGameMiddleware(), checkStartEndGameMiddleware(), mathInvadersController.timeout)

router.get('/:id', checkRoleForGameMiddleware(), checkStartEndGameMiddleware(), gameController.getOne)
router.post('/:id', checkRoleForGameMiddleware(), checkStartEndGameMiddleware(), validateRequest(userAnswerSchema),
    userAnswerController.create.bind(userAnswerController))

module.exports = router

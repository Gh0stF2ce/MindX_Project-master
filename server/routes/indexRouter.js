const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')
const gameUserRouter = require('./gameUserRouter')
const adminRouter = require('./adminRoutes/adminRouter')
const lobbyRouter = require('./lobbyRouter')
const ratingRouter = require('./ratingRouter')
const checkRoleMiddleware = require('../middlewares/checkRoleMiddleware')
const authMiddleware = require('../middlewares/authMiddleware')

router.use('/user', userRouter)
router.use('/lobby', authMiddleware(), lobbyRouter)
router.use('/rating', authMiddleware(), ratingRouter)
router.use('/admin', authMiddleware(), checkRoleMiddleware('ADMIN'), adminRouter)
router.use('/game', authMiddleware(), gameUserRouter)

module.exports = router
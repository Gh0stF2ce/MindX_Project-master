const Router = require('express')
const router = new Router()
const gameController = require('../controllers/gameController')

router.get('/', gameController.getAllUser.bind(gameController))

module.exports = router
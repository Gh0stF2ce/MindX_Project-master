const Router = require('express')
const router = new Router()
const ratingController = require('../controllers/ratingController')
const gameController = require('../controllers/gameController')

router.get('/', gameController.getRating.bind(gameController))
router.get('/:id', ratingController.getOne.bind(ratingController))

module.exports = router
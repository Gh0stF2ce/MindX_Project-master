const Router = require('express')
const router = new Router()
const carouselDataController = require('../../controllers/carouselDataController')
const validateRequest = require("../../middlewares/validateRequest");
const { carouselDataSchema } = require('../../schemas/carouselDataSchema')

router.put('/:id', validateRequest(carouselDataSchema), carouselDataController.update)
router.get('/:id', carouselDataController.getOne)
router.get('/', carouselDataController.getAll)

module.exports = router
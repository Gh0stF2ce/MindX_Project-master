const Router = require('express')
const router = new Router()
const invadersDataController = require('../../controllers/invadersDataController')
const validateRequest = require("../../middlewares/validateRequest");
const { invadersDataSchema } = require('../../schemas/invadersDataSchema')

router.put('/:id', validateRequest(invadersDataSchema), invadersDataController.update)
router.get('/:id', invadersDataController.getOne)
router.get('/', invadersDataController.getAll)

module.exports = router

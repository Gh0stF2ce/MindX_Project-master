const Router = require('express')
const router = new Router()
const accessGameController = require('../../controllers/accessGameController')
const validateRequest = require("../../middlewares/validateRequest");
const { accessGameSchema } = require("../../schemas/accessGameSchema");

router.delete('/:id', accessGameController.delete)
router.get('/', accessGameController.getAll)
router.post('/', validateRequest(accessGameSchema), accessGameController.create)

module.exports = router
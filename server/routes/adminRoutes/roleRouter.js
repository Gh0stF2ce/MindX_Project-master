const Router = require('express')
const router = new Router()
const roleController = require('../../controllers/roleController')
const validateRequest = require("../../middlewares/validateRequest")
const { schema } = require("../../schemas/roleAndThemeSchema")

router.delete('/:id', roleController.delete)
router.put('/:id', validateRequest(schema), roleController.update)
router.get('/', roleController.getAll)
router.post('/', validateRequest(schema), roleController.create)

module.exports = router
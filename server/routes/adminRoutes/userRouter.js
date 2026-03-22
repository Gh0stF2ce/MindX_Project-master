const Router = require('express')
const router = new Router()
const userController = require('../../controllers/userController')
const validateRequest = require("../../middlewares/validateRequest");
const { userPutSchemaForAdmin, userPostSchemaForAdmin } = require("../../schemas/userSchema");

router.delete('/:id', userController.delete)
router.put('/:id', validateRequest(userPutSchemaForAdmin), userController.updateUser)
router.get('/', userController.getAll)
router.post('/', validateRequest(userPostSchemaForAdmin), userController.createUser)

module.exports = router
const Router = require('express')
const router = new Router()
const questionController = require('../../controllers/questionController')
const validateRequest = require("../../middlewares/validateRequest");
const { questionSchema } = require('../../schemas/questionSchema')

router.delete('/:id', questionController.delete)
router.put('/:id', validateRequest(questionSchema), questionController.update)
router.get('/', questionController.getAll)
router.post('/', validateRequest(questionSchema), questionController.create)

module.exports = router
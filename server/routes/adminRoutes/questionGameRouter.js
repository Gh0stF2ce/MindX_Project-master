const Router = require('express')
const router = new Router()
const questionGameController = require('../../controllers/questionGameController')
const validateRequest = require("../../middlewares/validateRequest");
const { questionGamePostSchema, questionGamePutSchema } = require("../../schemas/questionGameSchema");

router.delete('/:id', questionGameController.delete)
router.put('/:id', validateRequest(questionGamePutSchema), questionGameController.update)
router.get('/', questionGameController.getAll)
router.post('/', validateRequest(questionGamePostSchema), questionGameController.create)

module.exports = router
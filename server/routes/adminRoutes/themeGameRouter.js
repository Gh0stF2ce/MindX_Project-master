const Router = require('express')
const router = new Router()
const themeGameController = require('../../controllers/themeGameController')
const validateRequest = require("../../middlewares/validateRequest");
const { themeGameSchema } = require("../../schemas/themeGameSchema");

router.put('/:id', validateRequest(themeGameSchema), themeGameController.update)
router.get('/', themeGameController.getAll)

module.exports = router
const Router = require('express')
const router = new Router()
const gameController = require('../../controllers/gameController')
const validateRequest = require("../../middlewares/validateRequest");
const { gameCreateSchema } = require("../../schemas/gameCreateSchema");


router.delete('/:id', gameController.delete.bind(gameController))
router.put('/:id', validateRequest(gameCreateSchema), gameController.update.bind(gameController))
router.get('/', gameController.getAllAdmin)
router.post('/', validateRequest(gameCreateSchema), gameController.create.bind(gameController))

module.exports = router
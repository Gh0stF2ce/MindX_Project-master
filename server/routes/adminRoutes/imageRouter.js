const Router = require('express')
const router = new Router()
const imageController = require('../../controllers/imageController')

router.delete('/:id', imageController.delete)
router.get('/', imageController.getAll)
router.post('/', imageController.create)

module.exports = router
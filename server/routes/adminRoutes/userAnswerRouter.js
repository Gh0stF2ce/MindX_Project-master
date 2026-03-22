const Router = require('express')
const router = new Router()
const userAnswerController = require('../../controllers/userAnswerController')

router.delete('/:id', userAnswerController.delete)
router.get('/', userAnswerController.getAll)
router.get('/download/:id', userAnswerController.download)

module.exports = router
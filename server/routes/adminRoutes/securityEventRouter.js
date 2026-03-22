const Router = require('express');
const router = new Router();
const securityEventController = require('../../controllers/securityEventController');

router.get('/', securityEventController.getAll);

module.exports = router;

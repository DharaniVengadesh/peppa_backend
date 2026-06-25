const router = require('express').Router();
const authenticate = require('../../middleware/authenticate');
const requireHousehold = require('../../middleware/requireHousehold');
const controller = require('./shopping.controller');

router.use(authenticate, requireHousehold);

router.get('/', controller.list);
router.post('/generate', controller.generate);
router.patch('/items/:id', controller.toggle);
router.delete('/items/:id', controller.remove);

module.exports = router;

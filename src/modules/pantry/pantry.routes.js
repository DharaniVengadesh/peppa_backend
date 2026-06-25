const router = require('express').Router();
const authenticate = require('../../middleware/authenticate');
const requireHousehold = require('../../middleware/requireHousehold');
const validate = require('../../middleware/validate');
const controller = require('./pantry.controller');
const { pantryItemSchema } = require('./pantry.validation');

router.use(authenticate, requireHousehold);

router.get('/', controller.list);
router.get('/insights', controller.insights);
router.get('/expiring', controller.expiring);
router.post('/items', validate(pantryItemSchema), controller.create);
router.patch('/items/:id', validate(pantryItemSchema.partial()), controller.update);
router.delete('/items/:id', controller.remove);

module.exports = router;

const router = require('express').Router();
const authenticate = require('../../middleware/authenticate');
const requireHousehold = require('../../middleware/requireHousehold');
const controller = require('./recipe.controller');

router.use(authenticate, requireHousehold);

router.get('/recommend', controller.recommend);
router.get('/:id', controller.detail);
router.post('/:id/cook', controller.cook);
router.post('/:id/rate', controller.rate);

module.exports = router;

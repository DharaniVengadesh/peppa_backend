const router = require('express').Router();
const authenticate = require('../../middleware/authenticate');
const requireHousehold = require('../../middleware/requireHousehold');
const controller = require('./nutrition.controller');

router.use(authenticate, requireHousehold);

router.get('/summary', controller.summary);
router.get('/deficiencies', controller.deficiencies);

module.exports = router;

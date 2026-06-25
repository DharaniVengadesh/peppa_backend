const router = require('express').Router();
const authenticate = require('../../middleware/authenticate');
const controller = require('./profile.controller');

router.get('/', authenticate, controller.getProfile);
router.patch('/', authenticate, controller.updateProfile);

module.exports = router;

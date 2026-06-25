const router = require('express').Router();
const authenticate = require('../../middleware/authenticate');
const controller = require('./cuisine.controller');

router.get('/', authenticate, controller.list);

module.exports = router;

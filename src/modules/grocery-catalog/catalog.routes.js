const router = require('express').Router();
const authenticate = require('../../middleware/authenticate');
const controller = require('./catalog.controller');

router.get('/', authenticate, controller.list);
router.get('/categories', authenticate, controller.listCategories);
router.get('/:id', authenticate, controller.getById);

module.exports = router;

const router = require('express').Router();
const authenticate = require('../../middleware/authenticate');
const requireHousehold = require('../../middleware/requireHousehold');
const controller = require('./chat.controller');

router.use(authenticate, requireHousehold);

router.post('/chat', controller.send);
router.get('/chat/sessions', controller.sessions);
router.get('/chat/sessions/:id/messages', controller.messages);

module.exports = router;

const router = require('express').Router();
const validate = require('../../middleware/validate');
const authenticateAdmin = require('../../middleware/authenticateAdmin');
const { authLimiter } = require('../../middleware/rateLimiter');
const controller = require('./admin-auth.controller');
const { loginSchema, refreshSchema } = require('./admin.validation');

router.post('/login', authLimiter, validate(loginSchema), controller.login);
router.post('/refresh', authLimiter, validate(refreshSchema), controller.refresh);
router.post('/logout', authenticateAdmin, controller.logout);
router.get('/profile', authenticateAdmin, controller.profile);

module.exports = router;

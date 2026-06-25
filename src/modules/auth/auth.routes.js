const router = require('express').Router();
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/authenticate');
const { authLimiter } = require('../../middleware/rateLimiter');
const controller = require('./auth.controller');
const { registerSchema, loginSchema, refreshSchema } = require('./auth.validation');

router.post('/register', authLimiter, validate(registerSchema), controller.register);
router.post('/login', authLimiter, validate(loginSchema), controller.login);
router.post('/refresh', authLimiter, validate(refreshSchema), controller.refresh);
router.post('/logout', authenticate, controller.logout);

module.exports = router;

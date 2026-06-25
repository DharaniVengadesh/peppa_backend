const authService = require('./auth.service');
const asyncHandler = require('../../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.validated.body, req);
  res.status(201).json({ success: true, data: result });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.validated.body, req);
  res.json({ success: true, data: result });
});

const refresh = asyncHandler(async (req, res) => {
  const result = await authService.refresh(req.validated.body.refresh_token, req);
  res.json({ success: true, data: result });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.body.refresh_token, req.userId, req);
  res.json({ success: true, message: 'Logged out' });
});

module.exports = { register, login, refresh, logout };

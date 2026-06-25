const adminAuthService = require('./admin-auth.service');
const asyncHandler = require('../../utils/asyncHandler');

const login = asyncHandler(async (req, res) => {
  const result = await adminAuthService.login(req.validated.body, req);
  res.json({ success: true, data: result });
});

const refresh = asyncHandler(async (req, res) => {
  const result = await adminAuthService.refresh(req.validated.body.refresh_token, req);
  res.json({ success: true, data: result });
});

const logout = asyncHandler(async (req, res) => {
  await adminAuthService.logout(req.body.refresh_token, req.adminId, req);
  res.json({ success: true, message: 'Logged out' });
});

const profile = asyncHandler(async (req, res) => {
  const admin = await adminAuthService.getProfile(req.adminId);
  res.json({ success: true, data: admin });
});

module.exports = { login, refresh, logout, profile };

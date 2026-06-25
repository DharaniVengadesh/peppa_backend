const asyncHandler = require('../../utils/asyncHandler');
const authService = require('../auth/auth.service');
const { User } = require('../../database');
const ApiError = require('../../utils/ApiError');

const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, data: authService.sanitizeUser(req.user) });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { full_name, avatar_url } = req.body;
  await req.user.update({
    ...(full_name && { full_name }),
    ...(avatar_url !== undefined && { avatar_url }),
  });
  res.json({ success: true, data: authService.sanitizeUser(req.user) });
});

module.exports = { getProfile, updateProfile };

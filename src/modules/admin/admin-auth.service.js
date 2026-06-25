const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { AdminUser, RefreshToken, Role } = require('../../database');
const ApiError = require('../../utils/ApiError');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../../utils/jwt');
const { hashToken } = require('../../utils/hashToken');
const { logActivity } = require('../../services/activityService');

const SALT_ROUNDS = 12;

const sanitizeAdmin = (admin) => ({
  id: admin.id,
  email: admin.email,
  full_name: admin.full_name,
  status: admin.status,
  role: admin.Role?.name || 'super_admin',
  last_login_at: admin.last_login_at,
  created_at: admin.created_at,
});

const issueAdminTokens = async (admin, req) => {
  const accessToken = signAccessToken({ sub: admin.id, type: 'admin' });
  const refreshToken = signRefreshToken({ sub: admin.id, type: 'admin', jti: crypto.randomUUID() });

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await RefreshToken.create({
    admin_user_id: admin.id,
    token_hash: hashToken(refreshToken),
    expires_at: expiresAt,
  });

  await admin.update({ last_login_at: new Date() });
  await logActivity({ action: 'admin.auth.login', metadata: { admin_id: admin.id }, req });

  const withRole = await AdminUser.findByPk(admin.id, { include: [{ model: Role }] });
  return { accessToken, refreshToken, admin: sanitizeAdmin(withRole) };
};

const login = async ({ email, password }, req) => {
  const admin = await AdminUser.findOne({
    where: { email: email.toLowerCase(), deleted_at: null },
    include: [{ model: Role }],
  });
  if (!admin || admin.status !== 'active') throw ApiError.unauthorized('Invalid credentials');

  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) throw ApiError.unauthorized('Invalid credentials');

  return issueAdminTokens(admin, req);
};

const refresh = async (refreshToken, req) => {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  if (payload.type !== 'admin') throw ApiError.unauthorized('Invalid refresh token');

  const stored = await RefreshToken.findOne({
    where: { token_hash: hashToken(refreshToken), revoked_at: null, admin_user_id: payload.sub },
  });

  if (!stored || stored.expires_at < new Date()) {
    throw ApiError.unauthorized('Refresh token expired or revoked');
  }

  const admin = await AdminUser.findByPk(payload.sub, { include: [{ model: Role }] });
  if (!admin || admin.status !== 'active') throw ApiError.unauthorized('Admin inactive');

  await stored.update({ revoked_at: new Date() });
  return issueAdminTokens(admin, req);
};

const logout = async (refreshToken, adminId, req) => {
  if (refreshToken) {
    await RefreshToken.update(
      { revoked_at: new Date() },
      { where: { token_hash: hashToken(refreshToken), admin_user_id: adminId } },
    );
  }
  await logActivity({ action: 'admin.auth.logout', metadata: { admin_id: adminId }, req });
};

const getProfile = async (adminId) => {
  const admin = await AdminUser.findByPk(adminId, { include: [{ model: Role }] });
  if (!admin) throw ApiError.notFound('Admin not found');
  return sanitizeAdmin(admin);
};

const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);

module.exports = { login, refresh, logout, getProfile, hashPassword, sanitizeAdmin };

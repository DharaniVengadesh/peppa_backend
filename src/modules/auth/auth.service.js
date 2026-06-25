const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const {
  User,
  RefreshToken,
  Role,
} = require('../../database');
const ApiError = require('../../utils/ApiError');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../../utils/jwt');
const { hashToken } = require('../../utils/hashToken');
const { logActivity } = require('../../services/activityService');

const SALT_ROUNDS = 12;

const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email,
  full_name: user.full_name,
  avatar_url: user.avatar_url,
  status: user.status,
  created_at: user.created_at,
});

const issueTokens = async (user, req) => {
  const accessToken = signAccessToken({ sub: user.id, type: 'user' });
  const refreshToken = signRefreshToken({ sub: user.id, type: 'user', jti: crypto.randomUUID() });

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await RefreshToken.create({
    user_id: user.id,
    token_hash: hashToken(refreshToken),
    expires_at: expiresAt,
  });

  await user.update({ last_login_at: new Date() });
  await logActivity({ userId: user.id, action: 'auth.login', req });

  return { accessToken, refreshToken, user: sanitizeUser(user) };
};

const register = async ({ email, password, full_name }, req) => {
  const existing = await User.unscoped().findOne({ where: { email: email.toLowerCase() } });
  if (existing) throw ApiError.conflict('Email already registered');

  const role = await Role.findOne({ where: { name: 'household_user' } });
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    email: email.toLowerCase(),
    password_hash,
    full_name,
    role_id: role?.id,
  });

  await logActivity({ userId: user.id, action: 'auth.register', req });
  return issueTokens(user, req);
};

const login = async ({ email, password }, req) => {
  const user = await User.unscoped().findOne({ where: { email: email.toLowerCase() } });
  if (!user || user.status !== 'active') throw ApiError.unauthorized('Invalid credentials');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw ApiError.unauthorized('Invalid credentials');

  return issueTokens(user, req);
};

const refresh = async (refreshToken, req) => {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  if (payload.type && payload.type !== 'user') {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const stored = await RefreshToken.findOne({
    where: { token_hash: hashToken(refreshToken), revoked_at: null, user_id: payload.sub },
  });

  if (!stored || stored.expires_at < new Date()) {
    throw ApiError.unauthorized('Refresh token expired or revoked');
  }

  const user = await User.findByPk(payload.sub);
  if (!user || user.status !== 'active') throw ApiError.unauthorized('User inactive');

  await stored.update({ revoked_at: new Date() });
  return issueTokens(user, req);
};

const logout = async (refreshToken, userId, req) => {
  if (refreshToken) {
    await RefreshToken.update(
      { revoked_at: new Date() },
      { where: { token_hash: hashToken(refreshToken), user_id: userId } },
    );
  }
  await logActivity({ userId, action: 'auth.logout', req });
};

module.exports = { register, login, refresh, logout, sanitizeUser };

const { verifyAccessToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const { User } = require('../database');

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token required');
    }

    const token = header.slice(7);
    const payload = verifyAccessToken(token);

    if (payload.type && payload.type !== 'user') {
      throw ApiError.unauthorized('Invalid token type');
    }

    const user = await User.findByPk(payload.sub);
    if (!user || user.status !== 'active') {
      throw ApiError.unauthorized('Invalid or inactive user');
    }

    req.user = user;
    req.userId = user.id;
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    return next(ApiError.unauthorized('Invalid or expired token'));
  }
};

module.exports = authenticate;

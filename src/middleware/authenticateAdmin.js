const { verifyAccessToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const { AdminUser } = require('../database');

const authenticateAdmin = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Admin access token required');
    }

    const token = header.slice(7);
    const payload = verifyAccessToken(token);

    if (payload.type !== 'admin') {
      throw ApiError.unauthorized('Invalid admin token');
    }

    const admin = await AdminUser.findByPk(payload.sub);
    if (!admin || admin.status !== 'active') {
      throw ApiError.unauthorized('Invalid or inactive admin');
    }

    req.admin = admin;
    req.adminId = admin.id;
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    return next(ApiError.unauthorized('Invalid or expired admin token'));
  }
};

module.exports = authenticateAdmin;

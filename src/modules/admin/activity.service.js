const { ActivityLog } = require('../../database');
const { parsePagination, paginatedResponse } = require('../../utils/pagination');

const listActivity = async (query) => {
  const { page, limit, offset } = parsePagination(query);
  const where = {};
  if (query.action) where.action = query.action;

  const { rows, count } = await ActivityLog.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });

  return paginatedResponse(rows, count, page, limit);
};

module.exports = { listActivity };

const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const paginatedResponse = (rows, count, page, limit) => ({
  data: rows,
  pagination: {
    page,
    limit,
    total: count,
    totalPages: Math.ceil(count / limit) || 1,
  },
});

module.exports = { parsePagination, paginatedResponse };

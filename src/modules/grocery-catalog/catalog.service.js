const { Op } = require('sequelize');
const { GroceryCatalog, PantryCategory } = require('../../database');
const { parsePagination, paginatedResponse } = require('../../utils/pagination');

const searchCatalog = async (query) => {
  const { page, limit, offset } = parsePagination(query);
  const where = { is_active: true, deleted_at: null };

  if (query.search) {
    where.name = { [Op.iLike]: `%${query.search}%` };
  }
  if (query.category_id) {
    where.category_id = query.category_id;
  }

  const { rows, count } = await GroceryCatalog.findAndCountAll({
    where,
    include: [{ model: PantryCategory, as: 'category' }],
    limit,
    offset,
    order: [['name', 'ASC']],
  });

  return paginatedResponse(rows, count, page, limit);
};

module.exports = { searchCatalog };

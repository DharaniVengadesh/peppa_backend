const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const { GroceryCatalog, PantryCategory } = require('../../database');
const catalogService = require('./catalog.service');

const list = asyncHandler(async (req, res) => {
  const result = await catalogService.searchCatalog(req.query);
  res.json({ success: true, ...result });
});

const getById = asyncHandler(async (req, res) => {
  const item = await GroceryCatalog.findOne({
    where: { id: req.params.id, is_active: true, deleted_at: null },
    include: [{ model: PantryCategory, as: 'category' }],
  });
  if (!item) throw ApiError.notFound('Catalog item not found');
  res.json({ success: true, data: item });
});

const listCategories = asyncHandler(async (_req, res) => {
  const categories = await PantryCategory.findAll({
    where: { is_active: true },
    order: [['sort_order', 'ASC']],
  });
  res.json({ success: true, data: categories });
});

module.exports = { list, getById, listCategories };

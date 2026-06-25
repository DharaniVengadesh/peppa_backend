const { Op } = require('sequelize');
const { GroceryCatalog, PantryCategory, CuisineType } = require('../../database');
const ApiError = require('../../utils/ApiError');
const { parsePagination, paginatedResponse } = require('../../utils/pagination');

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// --- Grocery catalog ---
const listCatalog = async (query) => {
  const { page, limit, offset } = parsePagination(query);
  const where = { deleted_at: null };
  if (query.search) where.name = { [Op.iLike]: `%${query.search}%` };
  if (query.category_id) where.category_id = query.category_id;
  if (query.is_active !== undefined) where.is_active = query.is_active === 'true';

  const { rows, count } = await GroceryCatalog.findAndCountAll({
    where,
    include: [{ model: PantryCategory, as: 'category' }],
    limit,
    offset,
    order: [['name', 'ASC']],
  });

  return paginatedResponse(rows, count, page, limit);
};

const createCatalogItem = async (body, adminId) => {
  const slug = slugify(body.name);
  const existing = await GroceryCatalog.findOne({ where: { slug } });
  if (existing) throw ApiError.conflict('Catalog item with this name already exists');

  return GroceryCatalog.create({
    ...body,
    slug,
    created_by_admin_id: adminId,
  });
};

const updateCatalogItem = async (id, body) => {
  const item = await GroceryCatalog.findByPk(id);
  if (!item) throw ApiError.notFound('Catalog item not found');

  const updates = { ...body };
  if (body.name) updates.slug = slugify(body.name);
  await item.update(updates);
  return item.reload({ include: [{ model: PantryCategory, as: 'category' }] });
};

const deleteCatalogItem = async (id) => {
  const item = await GroceryCatalog.findByPk(id);
  if (!item) throw ApiError.notFound('Catalog item not found');
  await item.update({ deleted_at: new Date(), is_active: false });
};

// --- Pantry categories ---
const listCategories = async () => {
  return PantryCategory.findAll({ order: [['sort_order', 'ASC'], ['name', 'ASC']] });
};

const createCategory = async (body) => {
  const slug = body.slug || slugify(body.name);
  return PantryCategory.create({ ...body, slug });
};

const updateCategory = async (id, body) => {
  const cat = await PantryCategory.findByPk(id);
  if (!cat) throw ApiError.notFound('Category not found');
  await cat.update(body);
  return cat;
};

// --- Cuisines ---
const listCuisines = async () => CuisineType.findAll({ order: [['name', 'ASC']] });

const createCuisine = async (body) => {
  const existing = await CuisineType.findOne({ where: { name: body.name } });
  if (existing) throw ApiError.conflict('Cuisine already exists');
  return CuisineType.create(body);
};

const updateCuisine = async (id, body) => {
  const cuisine = await CuisineType.findByPk(id);
  if (!cuisine) throw ApiError.notFound('Cuisine not found');
  await cuisine.update(body);
  return cuisine;
};

module.exports = {
  listCatalog,
  createCatalogItem,
  updateCatalogItem,
  deleteCatalogItem,
  listCategories,
  createCategory,
  updateCategory,
  listCuisines,
  createCuisine,
  updateCuisine,
};

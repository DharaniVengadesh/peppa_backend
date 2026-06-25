const dashboardService = require('./dashboard.service');
const usersService = require('./users.service');
const catalogService = require('./catalog.service');
const geminiService = require('./gemini.service');
const activityService = require('./activity.service');
const asyncHandler = require('../../utils/asyncHandler');

const stats = asyncHandler(async (_req, res) => {
  const data = await dashboardService.getStats();
  res.json({ success: true, data });
});

const listUsers = asyncHandler(async (req, res) => {
  const result = await usersService.listUsers(req.query);
  res.json({ success: true, ...result });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await usersService.updateUserStatus(req.params.id, req.validated.body.status);
  res.json({ success: true, data: user });
});

const listHouseholds = asyncHandler(async (req, res) => {
  const result = await usersService.listHouseholds(req.query);
  res.json({ success: true, ...result });
});

const getHousehold = asyncHandler(async (req, res) => {
  const data = await usersService.getHousehold(req.params.id);
  res.json({ success: true, data });
});

const updateHouseholdStatus = asyncHandler(async (req, res) => {
  const data = await usersService.updateHouseholdStatus(req.params.id, req.validated.body.status);
  res.json({ success: true, data });
});

const listCatalog = asyncHandler(async (req, res) => {
  const result = await catalogService.listCatalog(req.query);
  res.json({ success: true, ...result });
});

const createCatalogItem = asyncHandler(async (req, res) => {
  const data = await catalogService.createCatalogItem(req.validated.body, req.adminId);
  res.status(201).json({ success: true, data });
});

const updateCatalogItem = asyncHandler(async (req, res) => {
  const data = await catalogService.updateCatalogItem(req.params.id, req.validated.body);
  res.json({ success: true, data });
});

const deleteCatalogItem = asyncHandler(async (req, res) => {
  await catalogService.deleteCatalogItem(req.params.id);
  res.json({ success: true, message: 'Catalog item removed' });
});

const listCategories = asyncHandler(async (_req, res) => {
  const data = await catalogService.listCategories();
  res.json({ success: true, data });
});

const createCategory = asyncHandler(async (req, res) => {
  const data = await catalogService.createCategory(req.validated.body);
  res.status(201).json({ success: true, data });
});

const updateCategory = asyncHandler(async (req, res) => {
  const data = await catalogService.updateCategory(req.params.id, req.validated.body);
  res.json({ success: true, data });
});

const listCuisines = asyncHandler(async (_req, res) => {
  const data = await catalogService.listCuisines();
  res.json({ success: true, data });
});

const createCuisine = asyncHandler(async (req, res) => {
  const data = await catalogService.createCuisine(req.validated.body);
  res.status(201).json({ success: true, data });
});

const updateCuisine = asyncHandler(async (req, res) => {
  const data = await catalogService.updateCuisine(req.params.id, req.validated.body);
  res.json({ success: true, data });
});

const listPrompts = asyncHandler(async (_req, res) => {
  const data = await geminiService.listPrompts();
  res.json({ success: true, data });
});

const createPrompt = asyncHandler(async (req, res) => {
  const data = await geminiService.createPrompt(req.validated.body, req.adminId);
  res.status(201).json({ success: true, data });
});

const updatePrompt = asyncHandler(async (req, res) => {
  const data = await geminiService.updatePrompt(req.params.id, req.validated.body);
  res.json({ success: true, data });
});

const deletePrompt = asyncHandler(async (req, res) => {
  await geminiService.deletePrompt(req.params.id);
  res.json({ success: true, message: 'Prompt removed' });
});

const listKeywords = asyncHandler(async (_req, res) => {
  const data = await geminiService.listKeywords();
  res.json({ success: true, data });
});

const createKeyword = asyncHandler(async (req, res) => {
  const data = await geminiService.createKeyword(req.validated.body, req.adminId);
  res.status(201).json({ success: true, data });
});

const updateKeyword = asyncHandler(async (req, res) => {
  const data = await geminiService.updateKeyword(req.params.id, req.validated.body);
  res.json({ success: true, data });
});

const deleteKeyword = asyncHandler(async (req, res) => {
  await geminiService.deleteKeyword(req.params.id);
  res.json({ success: true, message: 'Keyword removed' });
});

const listUsage = asyncHandler(async (req, res) => {
  const result = await geminiService.listUsage(req.query);
  res.json({ success: true, ...result });
});

const listActivity = asyncHandler(async (req, res) => {
  const result = await activityService.listActivity(req.query);
  res.json({ success: true, ...result });
});

module.exports = {
  stats,
  listUsers,
  updateUserStatus,
  listHouseholds,
  getHousehold,
  updateHouseholdStatus,
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
  listPrompts,
  createPrompt,
  updatePrompt,
  deletePrompt,
  listKeywords,
  createKeyword,
  updateKeyword,
  deleteKeyword,
  listUsage,
  listActivity,
};

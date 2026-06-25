const asyncHandler = require('../../utils/asyncHandler');
const pantryService = require('./pantry.service');

const list = asyncHandler(async (req, res) => {
  const data = await pantryService.listPantry(req.householdId, req.query);
  res.json({ success: true, data });
});

const insights = asyncHandler(async (req, res) => {
  const data = await pantryService.getInsights(req.householdId);
  res.json({ success: true, data });
});

const expiring = asyncHandler(async (req, res) => {
  const data = await pantryService.listPantry(req.householdId, { expiring_days: 7 });
  res.json({ success: true, data: data.filter((i) => i.is_expiring_soon) });
});

const create = asyncHandler(async (req, res) => {
  const item = await pantryService.addItem(req.householdId, req.userId, req.validated.body, req);
  res.status(201).json({ success: true, data: item });
});

const update = asyncHandler(async (req, res) => {
  const item = await pantryService.updateItem(req.householdId, req.userId, req.params.id, req.validated.body, req);
  res.json({ success: true, data: item });
});

const remove = asyncHandler(async (req, res) => {
  await pantryService.deleteItem(req.householdId, req.userId, req.params.id, req);
  res.json({ success: true, message: 'Pantry item removed' });
});

module.exports = { list, insights, expiring, create, update, remove };

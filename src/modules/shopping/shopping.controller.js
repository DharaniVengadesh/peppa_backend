const asyncHandler = require('../../utils/asyncHandler');
const shoppingService = require('./shopping.service');

const list = asyncHandler(async (req, res) => {
  const data = await shoppingService.listItems(req.householdId);
  res.json({ success: true, data });
});

const generate = asyncHandler(async (req, res) => {
  const data = await shoppingService.generateList(req.householdId);
  res.json({ success: true, data });
});

const toggle = asyncHandler(async (req, res) => {
  const data = await shoppingService.toggleItem(req.householdId, req.params.id, req.body.is_checked);
  res.json({ success: true, data });
});

const remove = asyncHandler(async (req, res) => {
  await shoppingService.deleteItem(req.householdId, req.params.id);
  res.json({ success: true, message: 'Item removed' });
});

module.exports = { list, generate, toggle, remove };

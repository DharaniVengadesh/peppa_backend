const asyncHandler = require('../../utils/asyncHandler');
const nutritionService = require('./nutrition.service');

const summary = asyncHandler(async (req, res) => {
  const data = await nutritionService.getSummary(req.householdId, req.query.period || 'today');
  res.json({ success: true, data });
});

const deficiencies = asyncHandler(async (req, res) => {
  const data = await nutritionService.getDeficiencies(req.householdId);
  res.json({ success: true, data });
});

module.exports = { summary, deficiencies };

const asyncHandler = require('../../utils/asyncHandler');
const recipeService = require('./recipe.service');

const recommend = asyncHandler(async (req, res) => {
  const data = await recipeService.recommendRecipes(req.householdId, req.userId, req.query);
  res.json({ success: true, data });
});

const detail = asyncHandler(async (req, res) => {
  const data = await recipeService.getRecipe(req.params.id, req.householdId);
  res.json({ success: true, data });
});

const cook = asyncHandler(async (req, res) => {
  const data = await recipeService.cookRecipe(req.params.id, req.householdId, req.userId);
  res.json({ success: true, data });
});

const rate = asyncHandler(async (req, res) => {
  const data = await recipeService.rateRecipe(req.params.id, req.householdId, req.userId, req.validated.body);
  res.json({ success: true, data });
});

module.exports = { recommend, detail, cook, rate };

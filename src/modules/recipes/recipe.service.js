const geminiService = require('../../services/geminiService');
const ApiError = require('../../utils/ApiError');
const {
  Recipe,
  RecipeIngredient,
  RecipeRecommendation,
  RecipeRating,
  PantryItem,
  GroceryCatalog,
  HouseholdMember,
  Household,
  CuisineType,
  InventoryTransaction,
  sequelize,
} = require('../../database');

const buildRecommendationContext = async (householdId) => {
  const [pantry, members, household] = await Promise.all([
    PantryItem.findAll({
      where: { household_id: householdId, deleted_at: null },
      include: [{ model: GroceryCatalog, as: 'grocery' }],
    }),
    HouseholdMember.findAll({ where: { household_id: householdId, deleted_at: null } }),
    Household.findByPk(householdId, { include: [CuisineType] }),
  ]);

  return {
    pantry: pantry.map((p) => ({
      name: p.grocery?.name,
      quantity: p.quantity,
      unit: p.unit,
      expiry_date: p.expiry_date,
    })),
    family: members.map((m) => ({
      name: m.display_name,
      diet_type: m.diet_type,
      allergies: m.allergies,
      restrictions: m.restrictions,
      health_goals: m.health_goals,
      deficiencies: m.deficiencies,
    })),
    cuisines: household?.CuisineTypes?.map((c) => c.name) || [],
    filters: {},
  };
};

const recommendRecipes = async (householdId, userId, filters = {}) => {
  const context = await buildRecommendationContext(householdId);
  context.filters = filters;

  const prompt = `Generate 3-5 pantry-first recipe recommendations as JSON array.
Each item: { title, description, prep_time_minutes, difficulty, calories_per_serving, pantry_match_percent, reason, nutrition_highlights[], ingredients: [{ name, quantity, unit, in_pantry }] }
Use ONLY ingredients mostly available in pantry. Respect all family dietary restrictions and deficiencies.
Include disclaimer field: "Not medical advice."`;

  const { text } = await geminiService.generate({
    templateType: 'recipe_recommend',
    variables: { context, prompt },
    userId,
    householdId,
  });

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { recipes: [], raw: text };
  }

  const recipes = Array.isArray(parsed) ? parsed : parsed.recipes || [];

  const saved = [];
  for (let i = 0; i < recipes.length; i++) {
    const r = recipes[i];
    const recipe = await Recipe.create({
      title: r.title,
      description: r.description,
      prep_time_minutes: r.prep_time_minutes,
      difficulty: r.difficulty || 'medium',
      calories_per_serving: r.calories_per_serving,
      nutrition_highlights: r.nutrition_highlights,
      instructions: r.instructions || [],
      source: 'gemini',
    });

    await RecipeRecommendation.create({
      household_id: householdId,
      recipe_id: recipe.id,
      pantry_match_percent: r.pantry_match_percent,
      reason: r.reason,
      rank: i + 1,
      filters,
    });

    saved.push({ ...recipe.toJSON(), pantry_match_percent: r.pantry_match_percent, reason: r.reason, ingredients: r.ingredients });
  }

  return saved;
};

const getRecipe = async (recipeId, householdId) => {
  const recipe = await Recipe.findByPk(recipeId, {
    include: [{
      model: RecipeIngredient,
      as: 'ingredients',
      include: [{ model: GroceryCatalog, as: 'grocery' }],
    }],
  });
  if (!recipe) throw ApiError.notFound('Recipe not found');

  const pantry = await PantryItem.findAll({
    where: { household_id: householdId, deleted_at: null },
    include: [{ model: GroceryCatalog, as: 'grocery' }],
  });
  const pantryIds = new Set(pantry.map((p) => p.grocery_catalog_id));

  const recommendation = await RecipeRecommendation.findOne({
    where: { recipe_id: recipeId, household_id: householdId },
    order: [['created_at', 'DESC']],
  });

  const ingredients = (recipe.ingredients || []).map((ing) => ({
    ...ing.toJSON(),
    in_pantry: pantryIds.has(ing.grocery_catalog_id),
  }));

  return {
    ...recipe.toJSON(),
    ingredients,
    pantry_match_percent: recommendation?.pantry_match_percent,
    why_recommended: recommendation?.reason,
    disclaimer: 'Not medical advice. Consult a healthcare professional for dietary needs.',
  };
};

const cookRecipe = async (recipeId, householdId, userId) => {
  const recipe = await Recipe.findByPk(recipeId, {
    include: [{ model: RecipeIngredient, as: 'ingredients' }],
  });
  if (!recipe) throw ApiError.notFound('Recipe not found');

  return sequelize.transaction(async (t) => {
    for (const ing of recipe.ingredients || []) {
      const pantryItem = await PantryItem.findOne({
        where: { household_id: householdId, grocery_catalog_id: ing.grocery_catalog_id, deleted_at: null },
        transaction: t,
      });
      if (!pantryItem || !ing.quantity) continue;

      const newQty = Math.max(0, parseFloat(pantryItem.quantity) - parseFloat(ing.quantity));
      await pantryItem.update({ quantity: newQty }, { transaction: t });
      await InventoryTransaction.create({
        pantry_item_id: pantryItem.id,
        household_id: householdId,
        type: 'deduct',
        quantity_change: -parseFloat(ing.quantity),
        quantity_after: newQty,
        reason: `Cooked: ${recipe.title}`,
        recipe_id: recipeId,
        created_by_user_id: userId,
      }, { transaction: t });
    }
    return { message: 'Inventory updated after cooking' };
  });
};

const rateRecipe = async (recipeId, householdId, userId, { rating, feedback }) => {
  const [record] = await RecipeRating.findOrCreate({
    where: { recipe_id: recipeId, user_id: userId, household_id: householdId },
    defaults: { rating, feedback },
  });
  if (!record.isNewRecord) await record.update({ rating, feedback });
  return record;
};

module.exports = { recommendRecipes, getRecipe, cookRecipe, rateRecipe };

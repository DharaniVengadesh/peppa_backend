const router = require('express').Router();

router.use('/auth', require('../../modules/auth/auth.routes'));
router.use('/profile', require('../../modules/users/profile.routes'));
router.use('/households', require('../../modules/households/household.routes'));
router.use('/cuisines', require('../../modules/households/cuisine.routes'));
router.use('/pantry', require('../../modules/pantry/pantry.routes'));
router.use('/grocery-catalog', require('../../modules/grocery-catalog/catalog.routes'));
router.use('/recipes', require('../../modules/recipes/recipe.routes'));
router.use('/shopping-list', require('../../modules/shopping/shopping.routes'));
router.use('/nutrition', require('../../modules/nutrition/nutrition.routes'));
router.use('/ai', require('../../modules/gemini/chat.routes'));

module.exports = router;

const router = require('express').Router();
const authenticateAdmin = require('../../middleware/authenticateAdmin');
const validate = require('../../middleware/validate');
const controller = require('../../modules/admin/admin.controller');
const {
  statusSchema,
  householdStatusSchema,
  catalogItemSchema,
  updateCatalogItemSchema,
  categorySchema,
  updateCategorySchema,
  cuisineSchema,
  updateCuisineSchema,
  promptSchema,
  updatePromptSchema,
  keywordSchema,
  updateKeywordSchema,
} = require('../../modules/admin/admin.validation');

router.use('/auth', require('../../modules/admin/admin-auth.routes'));

router.use(authenticateAdmin);

router.get('/dashboard/stats', controller.stats);

router.get('/users', controller.listUsers);
router.patch('/users/:id/status', validate(statusSchema), controller.updateUserStatus);

router.get('/households', controller.listHouseholds);
router.get('/households/:id', controller.getHousehold);
router.patch('/households/:id/status', validate(householdStatusSchema), controller.updateHouseholdStatus);

router.get('/catalog', controller.listCatalog);
router.post('/catalog', validate(catalogItemSchema), controller.createCatalogItem);
router.patch('/catalog/:id', validate(updateCatalogItemSchema), controller.updateCatalogItem);
router.delete('/catalog/:id', controller.deleteCatalogItem);

router.get('/categories', controller.listCategories);
router.post('/categories', validate(categorySchema), controller.createCategory);
router.patch('/categories/:id', validate(updateCategorySchema), controller.updateCategory);

router.get('/cuisines', controller.listCuisines);
router.post('/cuisines', validate(cuisineSchema), controller.createCuisine);
router.patch('/cuisines/:id', validate(updateCuisineSchema), controller.updateCuisine);

router.get('/gemini/prompts', controller.listPrompts);
router.post('/gemini/prompts', validate(promptSchema), controller.createPrompt);
router.patch('/gemini/prompts/:id', validate(updatePromptSchema), controller.updatePrompt);
router.delete('/gemini/prompts/:id', controller.deletePrompt);

router.get('/gemini/keywords', controller.listKeywords);
router.post('/gemini/keywords', validate(keywordSchema), controller.createKeyword);
router.patch('/gemini/keywords/:id', validate(updateKeywordSchema), controller.updateKeyword);
router.delete('/gemini/keywords/:id', controller.deleteKeyword);

router.get('/gemini/usage', controller.listUsage);
router.get('/activity-logs', controller.listActivity);

module.exports = router;

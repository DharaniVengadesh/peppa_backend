const { z } = require('zod');

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

const refreshSchema = z.object({
  body: z.object({
    refresh_token: z.string().min(1),
  }),
});

const statusSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    status: z.enum(['active', 'suspended', 'deleted']),
  }),
});

const householdStatusSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    status: z.enum(['active', 'deactivated']),
  }),
});

const catalogItemSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(150),
    category_id: z.string().uuid(),
    default_unit: z.enum(['g', 'kg', 'ml', 'l', 'pcs', 'cup', 'tbsp']).optional(),
    shelf_life_days: z.number().int().positive().optional(),
    barcode: z.string().max(50).optional(),
    is_active: z.boolean().optional(),
  }),
});

const categorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    slug: z.string().min(1).max(100).optional(),
    emoji: z.string().max(10).optional(),
    sort_order: z.number().int().optional(),
    is_active: z.boolean().optional(),
  }),
});

const cuisineSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(50),
    emoji: z.string().max(10).optional(),
    is_active: z.boolean().optional(),
  }),
});

const promptSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    slug: z.string().min(1).max(100).optional(),
    template_type: z.enum(['recipe_recommend', 'recipe_detail', 'chat', 'shopping', 'nutrition']),
    system_prompt: z.string().min(1),
    user_prompt_template: z.string().min(1),
    model: z.string().max(50).optional(),
    temperature: z.number().min(0).max(2).optional(),
    max_tokens: z.number().int().positive().optional(),
    is_active: z.boolean().optional(),
  }),
});

const keywordSchema = z.object({
  body: z.object({
    keyword: z.string().min(1).max(100),
    category: z.enum(['cuisine', 'nutrition', 'diet', 'ingredient', 'health_goal', 'restriction']),
    weight: z.number().min(0).max(10).optional(),
    is_enabled: z.boolean().optional(),
  }),
});

const updateCatalogItemSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().min(1).max(150).optional(),
    category_id: z.string().uuid().optional(),
    default_unit: z.enum(['g', 'kg', 'ml', 'l', 'pcs', 'cup', 'tbsp']).optional(),
    shelf_life_days: z.number().int().positive().optional(),
    barcode: z.string().max(50).optional(),
    is_active: z.boolean().optional(),
  }),
});

const updateCategorySchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    slug: z.string().min(1).max(100).optional(),
    emoji: z.string().max(10).optional(),
    sort_order: z.number().int().optional(),
    is_active: z.boolean().optional(),
  }),
});

const updateCuisineSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().min(1).max(50).optional(),
    emoji: z.string().max(10).optional(),
    is_active: z.boolean().optional(),
  }),
});

const updatePromptSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    slug: z.string().min(1).max(100).optional(),
    template_type: z.enum(['recipe_recommend', 'recipe_detail', 'chat', 'shopping', 'nutrition']).optional(),
    system_prompt: z.string().min(1).optional(),
    user_prompt_template: z.string().min(1).optional(),
    model: z.string().max(50).optional(),
    temperature: z.number().min(0).max(2).optional(),
    max_tokens: z.number().int().positive().optional(),
    is_active: z.boolean().optional(),
  }),
});

const updateKeywordSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    keyword: z.string().min(1).max(100).optional(),
    category: z.enum(['cuisine', 'nutrition', 'diet', 'ingredient', 'health_goal', 'restriction']).optional(),
    weight: z.number().min(0).max(10).optional(),
    is_enabled: z.boolean().optional(),
  }),
});

module.exports = {
  loginSchema,
  refreshSchema,
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
};

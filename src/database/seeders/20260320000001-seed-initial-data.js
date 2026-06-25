'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const householdUserRoleId = uuidv4();
    const superAdminRoleId = uuidv4();

    await queryInterface.bulkInsert('roles', [
      { id: householdUserRoleId, name: 'household_user', description: 'Mobile app user', scope: 'household', created_at: now, updated_at: now },
      { id: superAdminRoleId, name: 'super_admin', description: 'Platform super admin', scope: 'platform', created_at: now, updated_at: now },
    ]);

    const cuisines = [
      { id: uuidv4(), name: 'South Indian', emoji: '🍛', is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), name: 'North Indian', emoji: '🫓', is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), name: 'Italian', emoji: '🍝', is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), name: 'Chinese', emoji: '🥟', is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), name: 'Mexican', emoji: '🌮', is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), name: 'Mediterranean', emoji: '🥙', is_active: true, created_at: now, updated_at: now },
    ];
    await queryInterface.bulkInsert('cuisine_types', cuisines);

    const catVeg = uuidv4();
    const catDairy = uuidv4();
    const catGrains = uuidv4();
    const catPantry = uuidv4();
    const catProtein = uuidv4();

    await queryInterface.bulkInsert('pantry_categories', [
      { id: catVeg, name: 'Vegetables', slug: 'vegetables', emoji: '🥬', sort_order: 1, is_active: true, created_at: now, updated_at: now },
      { id: catDairy, name: 'Dairy', slug: 'dairy', emoji: '🧀', sort_order: 2, is_active: true, created_at: now, updated_at: now },
      { id: catGrains, name: 'Grains', slug: 'grains', emoji: '🍚', sort_order: 3, is_active: true, created_at: now, updated_at: now },
      { id: catPantry, name: 'Pantry', slug: 'pantry', emoji: '🫙', sort_order: 4, is_active: true, created_at: now, updated_at: now },
      { id: catProtein, name: 'Protein', slug: 'protein', emoji: '🍗', sort_order: 5, is_active: true, created_at: now, updated_at: now },
    ]);

    await queryInterface.bulkInsert('grocery_catalog', [
      { id: uuidv4(), name: 'Spinach', slug: 'spinach', category_id: catVeg, default_unit: 'g', shelf_life_days: 5, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), name: 'Tomatoes', slug: 'tomatoes', category_id: catVeg, default_unit: 'pcs', shelf_life_days: 7, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), name: 'Paneer', slug: 'paneer', category_id: catDairy, default_unit: 'g', shelf_life_days: 7, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), name: 'Basmati Rice', slug: 'basmati-rice', category_id: catGrains, default_unit: 'kg', shelf_life_days: 365, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), name: 'Red Lentils', slug: 'red-lentils', category_id: catPantry, default_unit: 'g', shelf_life_days: 180, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), name: 'Whole Milk', slug: 'whole-milk', category_id: catDairy, default_unit: 'ml', shelf_life_days: 5, is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), name: 'Lemon', slug: 'lemon', category_id: catVeg, default_unit: 'pcs', shelf_life_days: 14, is_active: true, created_at: now, updated_at: now },
    ]);

    await queryInterface.bulkInsert('gemini_prompt_templates', [{
      id: uuidv4(),
      name: 'Recipe Recommendations',
      slug: 'recipe-recommend-default',
      template_type: 'recipe_recommend',
      system_prompt: 'You are Peppa, a pantry-first AI kitchen assistant for families. Suggest meals using ingredients already available. Never diagnose medical conditions. Always include a non-medical disclaimer.',
      user_prompt_template: 'Context:\n{{context}}\n\n{{prompt}}',
      model: 'gemini-2.0-flash',
      temperature: 0.7,
      max_tokens: 2048,
      is_active: true,
      version: 1,
      created_at: now,
      updated_at: now,
    }, {
      id: uuidv4(),
      name: 'AI Chef Chat',
      slug: 'chat-default',
      template_type: 'chat',
      system_prompt: 'You are Peppa AI Chef. Help users cook with pantry ingredients. Adjust recipes for dietary restrictions. Not medical advice.',
      user_prompt_template: 'Conversation:\n{{history}}\n\nUser: {{message}}',
      model: 'gemini-2.0-flash',
      temperature: 0.7,
      max_tokens: 2048,
      is_active: true,
      version: 1,
      created_at: now,
      updated_at: now,
    }]);

    await queryInterface.bulkInsert('gemini_keywords', [
      { id: uuidv4(), keyword: 'iron-rich', category: 'nutrition', weight: 1.0, is_enabled: true, created_at: now, updated_at: now },
      { id: uuidv4(), keyword: 'high-protein', category: 'nutrition', weight: 1.0, is_enabled: true, created_at: now, updated_at: now },
      { id: uuidv4(), keyword: 'vegetarian', category: 'diet', weight: 1.0, is_enabled: true, created_at: now, updated_at: now },
      { id: uuidv4(), keyword: 'expiring-soon', category: 'ingredient', weight: 1.2, is_enabled: true, created_at: now, updated_at: now },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('gemini_keywords', null, {});
    await queryInterface.bulkDelete('gemini_prompt_templates', null, {});
    await queryInterface.bulkDelete('grocery_catalog', null, {});
    await queryInterface.bulkDelete('pantry_categories', null, {});
    await queryInterface.bulkDelete('cuisine_types', null, {});
    await queryInterface.bulkDelete('roles', null, {});
  },
};

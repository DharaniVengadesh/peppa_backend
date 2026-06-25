'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('recipes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      title: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      cuisine_type_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'cuisine_types', key: 'id' },
        onDelete: 'SET NULL',
      },
      prep_time_minutes: { type: Sequelize.INTEGER, allowNull: true },
      cook_time_minutes: { type: Sequelize.INTEGER, allowNull: true },
      difficulty: {
        type: Sequelize.ENUM('easy', 'medium', 'hard'),
        allowNull: true,
      },
      servings: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 4 },
      calories_per_serving: { type: Sequelize.INTEGER, allowNull: true },
      nutrition_highlights: { type: Sequelize.JSONB, allowNull: true },
      instructions: { type: Sequelize.JSONB, allowNull: true },
      image_url: { type: Sequelize.TEXT, allowNull: true },
      source: {
        type: Sequelize.ENUM('gemini', 'admin', 'user'),
        allowNull: false,
        defaultValue: 'gemini',
      },
      gemini_request_id: { type: Sequelize.STRING(100), allowNull: true },
      is_published: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('recipe_ingredients', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      recipe_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'recipes', key: 'id' },
        onDelete: 'CASCADE',
      },
      grocery_catalog_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'grocery_catalog', key: 'id' },
        onDelete: 'RESTRICT',
      },
      quantity: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      unit: { type: Sequelize.STRING(20), allowNull: true },
      is_optional: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('recipe_recommendations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      household_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'households', key: 'id' },
        onDelete: 'CASCADE',
      },
      recipe_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'recipes', key: 'id' },
        onDelete: 'CASCADE',
      },
      pantry_match_percent: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
      reason: { type: Sequelize.TEXT, allowNull: true },
      rank: { type: Sequelize.INTEGER, allowNull: true },
      filters: { type: Sequelize.JSONB, allowNull: true },
      gemini_prompt_snapshot: { type: Sequelize.TEXT, allowNull: true },
      accepted_at: { type: Sequelize.DATE, allowNull: true },
      dismissed_at: { type: Sequelize.DATE, allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('recipe_ratings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      recipe_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'recipes', key: 'id' },
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      household_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'households', key: 'id' },
        onDelete: 'CASCADE',
      },
      rating: { type: Sequelize.INTEGER, allowNull: false },
      feedback: { type: Sequelize.TEXT, allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('shopping_list_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      household_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'households', key: 'id' },
        onDelete: 'CASCADE',
      },
      grocery_catalog_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'grocery_catalog', key: 'id' },
        onDelete: 'SET NULL',
      },
      custom_name: { type: Sequelize.STRING(150), allowNull: true },
      quantity: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      unit: { type: Sequelize.STRING(20), allowNull: true },
      reason: {
        type: Sequelize.ENUM('missing', 'low_stock', 'expiring', 'planned_meal', 'manual'),
        allowNull: false,
        defaultValue: 'manual',
      },
      recipe_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'recipes', key: 'id' },
        onDelete: 'SET NULL',
      },
      is_checked: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      checked_at: { type: Sequelize.DATE, allowNull: true },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('notifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      household_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'households', key: 'id' },
        onDelete: 'CASCADE',
      },
      type: {
        type: Sequelize.ENUM('expiry_alert', 'low_stock', 'recipe_suggestion', 'system', 'household_invite'),
        allowNull: false,
      },
      title: { type: Sequelize.STRING(255), allowNull: false },
      body: { type: Sequelize.TEXT, allowNull: true },
      data: { type: Sequelize.JSONB, allowNull: true },
      read_at: { type: Sequelize.DATE, allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('notifications');
    await queryInterface.dropTable('shopping_list_items');
    await queryInterface.dropTable('recipe_ratings');
    await queryInterface.dropTable('recipe_recommendations');
    await queryInterface.dropTable('recipe_ingredients');
    await queryInterface.dropTable('recipes');
  },
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('gemini_keywords', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      keyword: { type: Sequelize.STRING(100), allowNull: false },
      category: {
        type: Sequelize.ENUM('cuisine', 'nutrition', 'diet', 'ingredient', 'health_goal', 'restriction'),
        allowNull: false,
      },
      weight: { type: Sequelize.DECIMAL(3, 2), allowNull: false, defaultValue: 1.0 },
      is_enabled: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      metadata: { type: Sequelize.JSONB, allowNull: true },
      created_by_admin_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'admin_users', key: 'id' },
        onDelete: 'SET NULL',
      },
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

    await queryInterface.createTable('gemini_prompt_templates', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: { type: Sequelize.STRING(100), allowNull: false },
      slug: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      template_type: {
        type: Sequelize.ENUM('recipe_recommend', 'recipe_detail', 'chat', 'shopping', 'nutrition'),
        allowNull: false,
      },
      system_prompt: { type: Sequelize.TEXT, allowNull: false },
      user_prompt_template: { type: Sequelize.TEXT, allowNull: false },
      model: { type: Sequelize.STRING(50), allowNull: false, defaultValue: 'gemini-2.0-flash' },
      temperature: { type: Sequelize.DECIMAL(2, 1), allowNull: false, defaultValue: 0.7 },
      max_tokens: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 2048 },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      version: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      created_by_admin_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'admin_users', key: 'id' },
        onDelete: 'SET NULL',
      },
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

    await queryInterface.createTable('gemini_usage_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      household_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'households', key: 'id' },
        onDelete: 'SET NULL',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
      },
      template_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'gemini_prompt_templates', key: 'id' },
        onDelete: 'SET NULL',
      },
      request_type: { type: Sequelize.STRING(50), allowNull: true },
      tokens_input: { type: Sequelize.INTEGER, allowNull: true },
      tokens_output: { type: Sequelize.INTEGER, allowNull: true },
      latency_ms: { type: Sequelize.INTEGER, allowNull: true },
      status: { type: Sequelize.ENUM('success', 'error'), allowNull: false, defaultValue: 'success' },
      error_message: { type: Sequelize.TEXT, allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('ai_chat_sessions', {
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
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      title: { type: Sequelize.STRING(255), allowNull: true },
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

    await queryInterface.createTable('ai_chat_messages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      session_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'ai_chat_sessions', key: 'id' },
        onDelete: 'CASCADE',
      },
      role: { type: Sequelize.ENUM('user', 'assistant'), allowNull: false },
      content: { type: Sequelize.TEXT, allowNull: false },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('nutrition_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      household_member_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'household_members', key: 'id' },
        onDelete: 'CASCADE',
      },
      log_date: { type: Sequelize.DATEONLY, allowNull: false },
      calories: { type: Sequelize.INTEGER, allowNull: true },
      protein_g: { type: Sequelize.DECIMAL(8, 2), allowNull: true },
      carbs_g: { type: Sequelize.DECIMAL(8, 2), allowNull: true },
      fats_g: { type: Sequelize.DECIMAL(8, 2), allowNull: true },
      micronutrients: { type: Sequelize.JSONB, allowNull: true },
      source: { type: Sequelize.ENUM('recipe', 'manual'), allowNull: false, defaultValue: 'manual' },
      recipe_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'recipes', key: 'id' },
        onDelete: 'SET NULL',
      },
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

    await queryInterface.createTable('activity_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
      },
      household_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'households', key: 'id' },
        onDelete: 'SET NULL',
      },
      action: { type: Sequelize.STRING(100), allowNull: false },
      entity_type: { type: Sequelize.STRING(50), allowNull: true },
      entity_id: { type: Sequelize.UUID, allowNull: true },
      metadata: { type: Sequelize.JSONB, allowNull: true },
      ip_address: { type: Sequelize.INET, allowNull: true },
      user_agent: { type: Sequelize.TEXT, allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      actor_type: { type: Sequelize.ENUM('user', 'admin'), allowNull: false },
      actor_id: { type: Sequelize.UUID, allowNull: false },
      action: { type: Sequelize.STRING(100), allowNull: false },
      entity_type: { type: Sequelize.STRING(50), allowNull: true },
      entity_id: { type: Sequelize.UUID, allowNull: true },
      old_values: { type: Sequelize.JSONB, allowNull: true },
      new_values: { type: Sequelize.JSONB, allowNull: true },
      ip_address: { type: Sequelize.INET, allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('analytics_snapshots', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      snapshot_date: { type: Sequelize.DATEONLY, allowNull: false },
      metric_type: { type: Sequelize.STRING(50), allowNull: false },
      metric_value: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
      dimensions: { type: Sequelize.JSONB, allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('system_settings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      key: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      value: { type: Sequelize.JSONB, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      updated_by_admin_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'admin_users', key: 'id' },
        onDelete: 'SET NULL',
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('system_settings');
    await queryInterface.dropTable('analytics_snapshots');
    await queryInterface.dropTable('audit_logs');
    await queryInterface.dropTable('activity_logs');
    await queryInterface.dropTable('nutrition_logs');
    await queryInterface.dropTable('ai_chat_messages');
    await queryInterface.dropTable('ai_chat_sessions');
    await queryInterface.dropTable('gemini_usage_logs');
    await queryInterface.dropTable('gemini_prompt_templates');
    await queryInterface.dropTable('gemini_keywords');
  },
};

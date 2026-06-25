'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pantry_categories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      emoji: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      sort_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    await queryInterface.createTable('grocery_catalog', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true,
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'pantry_categories', key: 'id' },
        onDelete: 'SET NULL',
      },
      default_unit: {
        type: Sequelize.ENUM('g', 'kg', 'ml', 'l', 'pcs', 'cup', 'tbsp'),
        allowNull: false,
        defaultValue: 'g',
      },
      barcode: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true,
      },
      shelf_life_days: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      nutrition_per_100g: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      image_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_by_admin_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'admin_users', key: 'id' },
        onDelete: 'SET NULL',
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
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

    await queryInterface.addIndex('grocery_catalog', ['name']);
    await queryInterface.addIndex('grocery_catalog', ['category_id']);

    await queryInterface.createTable('pantry_items', {
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
        allowNull: false,
        references: { model: 'grocery_catalog', key: 'id' },
        onDelete: 'RESTRICT',
      },
      quantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      unit: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      location: {
        type: Sequelize.ENUM('pantry', 'refrigerator', 'freezer', 'counter'),
        allowNull: false,
        defaultValue: 'pantry',
      },
      expiry_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      purchase_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      low_stock_threshold: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      added_by_user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
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

    await queryInterface.addIndex('pantry_items', ['household_id', 'expiry_date']);
    await queryInterface.addIndex('pantry_items', ['household_id', 'grocery_catalog_id']);

    await queryInterface.createTable('inventory_transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      pantry_item_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'pantry_items', key: 'id' },
        onDelete: 'CASCADE',
      },
      household_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'households', key: 'id' },
        onDelete: 'CASCADE',
      },
      type: {
        type: Sequelize.ENUM('add', 'deduct', 'adjust', 'expired', 'waste'),
        allowNull: false,
      },
      quantity_change: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      quantity_after: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      reason: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      recipe_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      created_by_user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('inventory_transactions');
    await queryInterface.dropTable('pantry_items');
    await queryInterface.dropTable('grocery_catalog');
    await queryInterface.dropTable('pantry_categories');
  },
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('households', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      owner_user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'RESTRICT',
      },
      invite_code: {
        type: Sequelize.STRING(12),
        allowNull: true,
        unique: true,
      },
      status: {
        type: Sequelize.ENUM('active', 'deactivated'),
        allowNull: false,
        defaultValue: 'active',
      },
      timezone: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'Asia/Kolkata',
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

    await queryInterface.createTable('household_invites', {
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
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      token: {
        type: Sequelize.STRING(64),
        allowNull: false,
        unique: true,
      },
      invited_by_user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      accepted_at: {
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

    await queryInterface.addIndex('household_invites', ['email']);
    await queryInterface.addIndex('household_invites', ['token']);

    await queryInterface.createTable('household_members', {
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
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
      },
      display_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      relationship: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      age: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      is_admin: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      diet_type: {
        type: Sequelize.ENUM('vegetarian', 'vegan', 'omnivore', 'pescatarian'),
        allowNull: true,
      },
      allergies: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: '[]',
      },
      restrictions: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: '[]',
      },
      health_goals: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: '[]',
      },
      deficiencies: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: '[]',
      },
      bmi: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      calorie_target: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      protein_target_g: {
        type: Sequelize.INTEGER,
        allowNull: true,
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

    await queryInterface.addIndex('household_members', ['household_id']);
    await queryInterface.addIndex('household_members', ['user_id']);

    await queryInterface.createTable('cuisine_types', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      emoji: {
        type: Sequelize.STRING(10),
        allowNull: true,
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

    await queryInterface.createTable('household_cuisines', {
      household_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'households', key: 'id' },
        onDelete: 'CASCADE',
      },
      cuisine_type_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'cuisine_types', key: 'id' },
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addConstraint('household_cuisines', {
      fields: ['household_id', 'cuisine_type_id'],
      type: 'primary key',
      name: 'household_cuisines_pkey',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('household_cuisines');
    await queryInterface.dropTable('cuisine_types');
    await queryInterface.dropTable('household_members');
    await queryInterface.dropTable('household_invites');
    await queryInterface.dropTable('households');
  },
};

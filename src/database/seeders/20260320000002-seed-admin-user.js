'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [roles] = await queryInterface.sequelize.query(
      "SELECT id FROM roles WHERE name = 'super_admin' LIMIT 1",
    );
    const roleId = roles[0]?.id;
    if (!roleId) return;

    const [existing] = await queryInterface.sequelize.query(
      "SELECT id FROM admin_users WHERE email = 'admin@peppa.app' LIMIT 1",
    );
    if (existing.length) return;

    const now = new Date();
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin123!', 12);

    await queryInterface.bulkInsert('admin_users', [{
      id: uuidv4(),
      email: process.env.ADMIN_EMAIL || 'admin@peppa.app',
      password_hash: passwordHash,
      full_name: 'Peppa Super Admin',
      role_id: roleId,
      status: 'active',
      created_at: now,
      updated_at: now,
    }]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('admin_users', { email: 'admin@peppa.app' }, {});
  },
};

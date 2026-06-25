const { ActivityLog } = require('../database');

const logActivity = async ({ userId, householdId, action, entityType, entityId, metadata, req }) => {
  try {
    await ActivityLog.create({
      user_id: userId,
      household_id: householdId || null,
      action,
      entity_type: entityType || null,
      entity_id: entityId || null,
      metadata: metadata || null,
      ip_address: req?.ip || null,
      user_agent: req?.get('user-agent') || null,
    });
  } catch (err) {
    console.error('Activity log failed:', err.message);
  }
};

module.exports = { logActivity };

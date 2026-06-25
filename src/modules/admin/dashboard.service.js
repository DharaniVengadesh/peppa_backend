const { Op, fn, col, literal } = require('sequelize');
const {
  User,
  Household,
  HouseholdMember,
  PantryItem,
  Recipe,
  GroceryCatalog,
  GeminiUsageLog,
  AiChatSession,
  ActivityLog,
} = require('../../database');

const getStats = async () => {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000);

  const [
    totalUsers,
    activeUsers,
    totalHouseholds,
    totalPantryItems,
    totalRecipes,
    geminiToday,
    geminiWeek,
    chatSessions,
    recentUsers,
  ] = await Promise.all([
    User.count({ where: { deleted_at: null } }),
    User.count({ where: { status: 'active', deleted_at: null } }),
    Household.count({ where: { deleted_at: null, status: 'active' } }),
    PantryItem.count({ where: { deleted_at: null } }),
    Recipe.count({ where: { deleted_at: null } }),
    GeminiUsageLog.count({
      where: { created_at: { [Op.gte]: new Date(`${today}T00:00:00`) } },
    }),
    GeminiUsageLog.count({ where: { created_at: { [Op.gte]: weekAgo } } }),
    AiChatSession.count(),
    User.findAll({
      where: { deleted_at: null },
      attributes: ['id', 'email', 'full_name', 'status', 'created_at', 'last_login_at'],
      order: [['created_at', 'DESC']],
      limit: 5,
    }),
  ]);

  const geminiErrors = await GeminiUsageLog.count({
    where: { status: 'error', created_at: { [Op.gte]: weekAgo } },
  });

  return {
    totals: {
      users: totalUsers,
      active_users: activeUsers,
      households: totalHouseholds,
      pantry_items: totalPantryItems,
      recipes: totalRecipes,
      chat_sessions: chatSessions,
    },
    gemini: {
      requests_today: geminiToday,
      requests_week: geminiWeek,
      errors_week: geminiErrors,
    },
    recent_users: recentUsers,
  };
};

module.exports = { getStats };

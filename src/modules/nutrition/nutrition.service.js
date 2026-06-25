const { Sequelize } = require('sequelize');
const { NutritionLog, HouseholdMember } = require('../../database');

const getSummary = async (householdId, period = 'today') => {
  const members = await HouseholdMember.findAll({ where: { household_id: householdId, deleted_at: null } });
  const memberIds = members.map((m) => m.id);

  const where = { household_member_id: memberIds };
  const today = new Date().toISOString().slice(0, 10);

  if (period === 'today') {
    where.log_date = today;
  } else if (period === 'week') {
    where.log_date = { [Sequelize.Op.gte]: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10) };
  }

  const logs = await NutritionLog.findAll({ where });

  const totals = logs.reduce(
    (acc, log) => ({
      calories: acc.calories + (log.calories || 0),
      protein_g: acc.protein_g + parseFloat(log.protein_g || 0),
      carbs_g: acc.carbs_g + parseFloat(log.carbs_g || 0),
      fats_g: acc.fats_g + parseFloat(log.fats_g || 0),
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fats_g: 0 },
  );

  return {
    period,
    totals,
    calorie_target: members.reduce((s, m) => s + (m.calorie_target || 0), 0) || 2100,
    disclaimer: 'Not medical advice.',
  };
};

const getDeficiencies = async (householdId) => {
  const members = await HouseholdMember.findAll({ where: { household_id: householdId, deleted_at: null } });
  return members.flatMap((m) =>
    (m.deficiencies || []).map((d) => ({
      member: m.display_name,
      ...d,
    })),
  );
};

module.exports = { getSummary, getDeficiencies };

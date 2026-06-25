const ApiError = require('../utils/ApiError');
const { HouseholdMember, Household } = require('../database');

const requireHousehold = async (req, res, next) => {
  try {
    const householdId = req.params.householdId || req.body.household_id || req.query.household_id;

    let membership;
    if (householdId) {
      membership = await HouseholdMember.findOne({
        where: { user_id: req.userId, household_id: householdId, deleted_at: null },
      });
      if (!membership) throw ApiError.forbidden('Not a member of this household');
      req.household = await Household.findByPk(householdId);
    } else {
      membership = await HouseholdMember.findOne({
        where: { user_id: req.userId, deleted_at: null },
        order: [['created_at', 'ASC']],
      });
      if (!membership) throw ApiError.notFound('No household found. Create or join one first.');
      req.household = await Household.findByPk(membership.household_id);
    }

    req.membership = membership;
    req.householdId = req.household.id;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = requireHousehold;

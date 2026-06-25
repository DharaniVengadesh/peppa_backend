const { Op } = require('sequelize');
const { User, Household, HouseholdMember } = require('../../database');
const ApiError = require('../../utils/ApiError');
const { parsePagination, paginatedResponse } = require('../../utils/pagination');

const listUsers = async (query) => {
  const { page, limit, offset } = parsePagination(query);
  const where = { deleted_at: null };

  if (query.search) {
    where[Op.or] = [
      { email: { [Op.iLike]: `%${query.search}%` } },
      { full_name: { [Op.iLike]: `%${query.search}%` } },
    ];
  }
  if (query.status) where.status = query.status;

  const { rows, count } = await User.unscoped().findAndCountAll({
    where,
    attributes: ['id', 'email', 'full_name', 'status', 'last_login_at', 'created_at'],
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });

  return paginatedResponse(rows, count, page, limit);
};

const updateUserStatus = async (id, status) => {
  const user = await User.unscoped().findByPk(id);
  if (!user) throw ApiError.notFound('User not found');

  const updates = { status };
  if (status === 'deleted') updates.deleted_at = new Date();
  await user.update(updates);
  return user;
};

const listHouseholds = async (query) => {
  const { page, limit, offset } = parsePagination(query);
  const where = { deleted_at: null };
  if (query.status) where.status = query.status;
  if (query.search) where.name = { [Op.iLike]: `%${query.search}%` };

  const { rows, count } = await Household.findAndCountAll({
    where,
    include: [
      { model: User, as: 'owner', attributes: ['id', 'email', 'full_name'] },
      { model: HouseholdMember, attributes: ['id'], where: { deleted_at: null }, required: false },
    ],
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });

  const data = rows.map((h) => ({
    id: h.id,
    name: h.name,
    status: h.status,
    invite_code: h.invite_code,
    timezone: h.timezone,
    owner: h.owner,
    member_count: h.HouseholdMembers?.length || 0,
    created_at: h.created_at,
  }));

  return paginatedResponse(data, count, page, limit);
};

const getHousehold = async (id) => {
  const household = await Household.findByPk(id, {
    include: [
      { model: User, as: 'owner', attributes: ['id', 'email', 'full_name'] },
      {
        model: HouseholdMember,
        where: { deleted_at: null },
        required: false,
      },
    ],
  });
  if (!household) throw ApiError.notFound('Household not found');
  return household;
};

const updateHouseholdStatus = async (id, status) => {
  const household = await Household.findByPk(id);
  if (!household) throw ApiError.notFound('Household not found');
  await household.update({ status });
  return household;
};

module.exports = {
  listUsers,
  updateUserStatus,
  listHouseholds,
  getHousehold,
  updateHouseholdStatus,
};

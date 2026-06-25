const crypto = require('crypto');
const config = require('../../config');
const ApiError = require('../../utils/ApiError');
const {
  Household,
  HouseholdMember,
  HouseholdInvite,
  CuisineType,
  User,
  sequelize,
} = require('../../database');
const { sendHouseholdInviteEmail } = require('../../services/emailService');
const { logActivity } = require('../../services/activityService');

const generateInviteCode = () => crypto.randomBytes(6).toString('hex').slice(0, 12);

const createHousehold = async (userId, { name }, req) => {
  const existing = await HouseholdMember.findOne({ where: { user_id: userId, deleted_at: null } });
  if (existing) throw ApiError.conflict('User already belongs to a household');

  return sequelize.transaction(async (t) => {
    const household = await Household.create({
      name,
      owner_user_id: userId,
      invite_code: generateInviteCode(),
    }, { transaction: t });

    const user = await User.findByPk(userId, { transaction: t });
    await HouseholdMember.create({
      household_id: household.id,
      user_id: userId,
      display_name: user.full_name,
      relationship: 'owner',
      is_admin: true,
      diet_type: 'omnivore',
    }, { transaction: t });

    await logActivity({ userId, householdId: household.id, action: 'household.create', entityType: 'household', entityId: household.id, req });
    return household;
  });
};

const getCurrentHousehold = async (householdId) => {
  const household = await Household.findByPk(householdId, {
    include: [
      { model: CuisineType, through: { attributes: [] } },
      { model: HouseholdMember, where: { deleted_at: null }, required: false },
    ],
  });
  if (!household) throw ApiError.notFound('Household not found');
  return household;
};

const sendInvite = async (householdId, userId, email, req) => {
  const membership = await HouseholdMember.findOne({
    where: { household_id: householdId, user_id: userId, is_admin: true, deleted_at: null },
  });
  if (!membership) throw ApiError.forbidden('Only household admins can invite');

  const count = await HouseholdMember.count({ where: { household_id: householdId, deleted_at: null } });
  if (count >= config.household.maxMembers) throw ApiError.tooMany('Household member limit reached (6)');

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const invite = await HouseholdInvite.create({
    household_id: householdId,
    email: email.toLowerCase(),
    token,
    invited_by_user_id: userId,
    expires_at: expiresAt,
  });

  const household = await Household.findByPk(householdId);
  const inviter = await User.findByPk(userId);

  await sendHouseholdInviteEmail({
    to: email,
    inviterName: inviter.full_name,
    householdName: household.name,
    inviteToken: token,
  });

  await logActivity({ userId, householdId, action: 'household.invite_sent', metadata: { email }, req });
  return { invite_id: invite.id, email: invite.email, expires_at: invite.expires_at };
};

const acceptInvite = async (token, userId, req) => {
  const invite = await HouseholdInvite.findOne({ where: { token } });
  if (!invite) throw ApiError.notFound('Invite not found');
  if (invite.accepted_at) throw ApiError.conflict('Invite already accepted');
  if (invite.expires_at < new Date()) throw ApiError.badRequest('Invite expired');

  const user = await User.findByPk(userId);
  if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
    throw ApiError.forbidden('Invite email does not match your account');
  }

  const existing = await HouseholdMember.findOne({ where: { user_id: userId, deleted_at: null } });
  if (existing) throw ApiError.conflict('Already in a household');

  const count = await HouseholdMember.count({ where: { household_id: invite.household_id, deleted_at: null } });
  if (count >= config.household.maxMembers) throw ApiError.tooMany('Household is full');

  return sequelize.transaction(async (t) => {
    await HouseholdMember.create({
      household_id: invite.household_id,
      user_id: userId,
      display_name: user.full_name,
      relationship: 'member',
      is_admin: false,
    }, { transaction: t });

    await invite.update({ accepted_at: new Date() }, { transaction: t });
    await logActivity({ userId, householdId: invite.household_id, action: 'household.invite_accepted', req });
    return getCurrentHousehold(invite.household_id);
  });
};

const joinByCode = async (userId, inviteCode, req) => {
  const household = await Household.findOne({ where: { invite_code: inviteCode, status: 'active', deleted_at: null } });
  if (!household) throw ApiError.notFound('Invalid invite code');

  const existing = await HouseholdMember.findOne({ where: { user_id: userId, deleted_at: null } });
  if (existing) throw ApiError.conflict('Already in a household');

  const count = await HouseholdMember.count({ where: { household_id: household.id, deleted_at: null } });
  if (count >= config.household.maxMembers) throw ApiError.tooMany('Household is full');

  const user = await User.findByPk(userId);
  await HouseholdMember.create({
    household_id: household.id,
    user_id: userId,
    display_name: user.full_name,
    relationship: 'member',
  });

  await logActivity({ userId, householdId: household.id, action: 'household.join_code', req });
  return household;
};

const updateCuisines = async (householdId, cuisineIds) => {
  const household = await Household.findByPk(householdId);
  if (!household) throw ApiError.notFound('Household not found');
  const cuisines = await CuisineType.findAll({ where: { id: cuisineIds, is_active: true } });
  await household.setCuisineTypes(cuisines);
  return getCurrentHousehold(householdId);
};

module.exports = {
  createHousehold,
  getCurrentHousehold,
  sendInvite,
  acceptInvite,
  joinByCode,
  updateCuisines,
};

const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const config = require('../../config');
const householdService = require('./household.service');
const { HouseholdMember } = require('../../database');
const { logActivity } = require('../../services/activityService');

const create = asyncHandler(async (req, res) => {
  const household = await householdService.createHousehold(req.userId, req.validated.body, req);
  res.status(201).json({ success: true, data: household });
});

const current = asyncHandler(async (req, res) => {
  const household = await householdService.getCurrentHousehold(req.householdId);
  res.json({ success: true, data: household });
});

const invite = asyncHandler(async (req, res) => {
  const result = await householdService.sendInvite(req.householdId, req.userId, req.validated.body.email, req);
  res.status(201).json({ success: true, data: result });
});

const acceptInvite = asyncHandler(async (req, res) => {
  const household = await householdService.acceptInvite(req.params.token, req.userId, req);
  res.json({ success: true, data: household });
});

const join = asyncHandler(async (req, res) => {
  const household = await householdService.joinByCode(req.userId, req.validated.body.invite_code, req);
  res.json({ success: true, data: household });
});

const setCuisines = asyncHandler(async (req, res) => {
  const household = await householdService.updateCuisines(req.householdId, req.validated.body.cuisine_ids);
  res.json({ success: true, data: household });
});

const listMembers = asyncHandler(async (req, res) => {
  const members = await HouseholdMember.findAll({
    where: { household_id: req.householdId, deleted_at: null },
  });
  res.json({ success: true, data: members });
});

const addMember = asyncHandler(async (req, res) => {
  const count = await HouseholdMember.count({ where: { household_id: req.householdId, deleted_at: null } });
  if (count >= config.household.maxMembers) throw ApiError.tooMany('Maximum 6 family members');

  const member = await HouseholdMember.create({
    household_id: req.householdId,
    ...req.validated.body,
  });
  await logActivity({ userId: req.userId, householdId: req.householdId, action: 'member.create', entityId: member.id, req });
  res.status(201).json({ success: true, data: member });
});

const updateMember = asyncHandler(async (req, res) => {
  const member = await HouseholdMember.findOne({
    where: { id: req.params.id, household_id: req.householdId, deleted_at: null },
  });
  if (!member) throw ApiError.notFound('Member not found');
  await member.update(req.validated.body);
  res.json({ success: true, data: member });
});

const deleteMember = asyncHandler(async (req, res) => {
  const member = await HouseholdMember.findOne({
    where: { id: req.params.id, household_id: req.householdId, deleted_at: null },
  });
  if (!member) throw ApiError.notFound('Member not found');
  if (member.user_id === req.userId) throw ApiError.badRequest('Cannot remove yourself');
  await member.update({ deleted_at: new Date() });
  res.json({ success: true, message: 'Member removed' });
});

module.exports = {
  create,
  current,
  invite,
  acceptInvite,
  join,
  setCuisines,
  listMembers,
  addMember,
  updateMember,
  deleteMember,
};

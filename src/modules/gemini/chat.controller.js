const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const chatService = require('./chat.service');

const send = asyncHandler(async (req, res) => {
  const data = await chatService.chat(req.householdId, req.userId, req.body);
  res.json({ success: true, data });
});

const sessions = asyncHandler(async (req, res) => {
  const data = await chatService.getSessions(req.userId, req.householdId);
  res.json({ success: true, data });
});

const messages = asyncHandler(async (req, res) => {
  const data = await chatService.getMessages(req.params.id, req.userId);
  if (!data) throw ApiError.notFound('Session not found');
  res.json({ success: true, data });
});

module.exports = { send, sessions, messages };

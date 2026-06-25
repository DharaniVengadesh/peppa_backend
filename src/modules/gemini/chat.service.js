const geminiService = require('../../services/geminiService');
const { AiChatSession, AiChatMessage } = require('../../database');

const chat = async (householdId, userId, { message, session_id }) => {
  let session;
  if (session_id) {
    session = await AiChatSession.findOne({ where: { id: session_id, user_id: userId, household_id: householdId } });
  }
  if (!session) {
    session = await AiChatSession.create({ household_id: householdId, user_id: userId, title: message.slice(0, 50) });
  }

  await AiChatMessage.create({ session_id: session.id, role: 'user', content: message });

  const history = await AiChatMessage.findAll({
    where: { session_id: session.id },
    order: [['created_at', 'ASC']],
    limit: 20,
  });

  const { text } = await geminiService.generate({
    templateType: 'chat',
    variables: {
      message,
      history: history.map((m) => ({ role: m.role, content: m.content })),
    },
    userId,
    householdId,
  });

  const reply = text.includes('Not medical advice') ? text : `${text}\n\n_Not medical advice. Consult a healthcare professional._`;

  await AiChatMessage.create({ session_id: session.id, role: 'assistant', content: reply });

  return { session_id: session.id, reply };
};

const getSessions = (userId, householdId) =>
  AiChatSession.findAll({ where: { user_id: userId, household_id: householdId }, order: [['updated_at', 'DESC']] });

const getMessages = async (sessionId, userId) => {
  const session = await AiChatSession.findOne({ where: { id: sessionId, user_id: userId } });
  if (!session) return null;
  return AiChatMessage.findAll({ where: { session_id: sessionId }, order: [['created_at', 'ASC']] });
};

module.exports = { chat, getSessions, getMessages };

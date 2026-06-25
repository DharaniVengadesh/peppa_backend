const { Op } = require('sequelize');
const { GeminiPromptTemplate, GeminiKeyword, GeminiUsageLog } = require('../../database');
const ApiError = require('../../utils/ApiError');
const { parsePagination, paginatedResponse } = require('../../utils/pagination');

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const listPrompts = async () =>
  GeminiPromptTemplate.findAll({
    where: { deleted_at: null },
    order: [['template_type', 'ASC'], ['name', 'ASC']],
  });

const createPrompt = async (body, adminId) => {
  const slug = body.slug || slugify(body.name);
  return GeminiPromptTemplate.create({
    ...body,
    slug,
    created_by_admin_id: adminId,
    version: 1,
  });
};

const updatePrompt = async (id, body) => {
  const prompt = await GeminiPromptTemplate.findByPk(id);
  if (!prompt) throw ApiError.notFound('Prompt not found');
  const updates = { ...body };
  if (body.name && !body.slug) updates.slug = slugify(body.name);
  if (body.system_prompt || body.user_prompt_template) {
    updates.version = (prompt.version || 1) + 1;
  }
  await prompt.update(updates);
  return prompt;
};

const deletePrompt = async (id) => {
  const prompt = await GeminiPromptTemplate.findByPk(id);
  if (!prompt) throw ApiError.notFound('Prompt not found');
  await prompt.update({ deleted_at: new Date(), is_active: false });
};

const listKeywords = async () =>
  GeminiKeyword.findAll({
    where: { deleted_at: null },
    order: [['category', 'ASC'], ['keyword', 'ASC']],
  });

const createKeyword = async (body, adminId) =>
  GeminiKeyword.create({ ...body, created_by_admin_id: adminId });

const updateKeyword = async (id, body) => {
  const kw = await GeminiKeyword.findByPk(id);
  if (!kw) throw ApiError.notFound('Keyword not found');
  await kw.update(body);
  return kw;
};

const deleteKeyword = async (id) => {
  const kw = await GeminiKeyword.findByPk(id);
  if (!kw) throw ApiError.notFound('Keyword not found');
  await kw.update({ deleted_at: new Date(), is_enabled: false });
};

const listUsage = async (query) => {
  const { page, limit, offset } = parsePagination(query);
  const where = {};
  if (query.status) where.status = query.status;

  const { rows, count } = await GeminiUsageLog.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });

  return paginatedResponse(rows, count, page, limit);
};

module.exports = {
  listPrompts,
  createPrompt,
  updatePrompt,
  deletePrompt,
  listKeywords,
  createKeyword,
  updateKeyword,
  deleteKeyword,
  listUsage,
};

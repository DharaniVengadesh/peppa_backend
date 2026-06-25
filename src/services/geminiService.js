const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');
const { GeminiPromptTemplate, GeminiKeyword, GeminiUsageLog } = require('../database');

let genAI;

const getClient = () => {
  if (!genAI && config.gemini.apiKey) {
    genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  }
  return genAI;
};

const renderTemplate = (template, variables) => {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), serialized);
  });
  return result;
};

const getActiveTemplate = async (templateType) => {
  const template = await GeminiPromptTemplate.findOne({
    where: { template_type: templateType, is_active: true, deleted_at: null },
    order: [['version', 'DESC']],
  });

  if (!template) {
    return {
      system_prompt: 'You are Peppa, an AI kitchen assistant. Suggest meals using pantry ingredients only. Never provide medical diagnosis. Include disclaimer that guidance is not medical advice.',
      user_prompt_template: '{{context}}',
      model: config.gemini.model,
      temperature: 0.7,
      max_tokens: 2048,
    };
  }

  return template;
};

const getEnabledKeywords = async () => {
  const keywords = await GeminiKeyword.findAll({
    where: { is_enabled: true, deleted_at: null },
  });
  return keywords.map((k) => k.keyword);
};

const generate = async ({ templateType, variables, userId, householdId }) => {
  const start = Date.now();
  const template = await getActiveTemplate(templateType);
  const keywords = await getEnabledKeywords();

  const systemPrompt = renderTemplate(template.system_prompt, { ...variables, keywords });
  const userPrompt = renderTemplate(template.user_prompt_template, { ...variables, keywords });

  const client = getClient();
  if (!client) {
    return {
      text: JSON.stringify({
        disclaimer: 'Not medical advice. Consult a healthcare professional for dietary needs.',
        recipes: [],
        message: 'Gemini API key not configured. Set GEMINI_API_KEY in .env',
      }),
      stubbed: true,
    };
  }

  try {
    const model = client.getGenerativeModel({
      model: template.model || config.gemini.model,
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: parseFloat(template.temperature) || 0.7,
        maxOutputTokens: template.max_tokens || 2048,
        responseMimeType: templateType === 'recipe_recommend' ? 'application/json' : 'text/plain',
      },
    });

    const text = result.response.text();
    const latency = Date.now() - start;

    await GeminiUsageLog.create({
      household_id: householdId,
      user_id: userId,
      template_id: template.id || null,
      request_type: templateType,
      latency_ms: latency,
      status: 'success',
    });

    return { text, latency };
  } catch (err) {
    await GeminiUsageLog.create({
      household_id: householdId,
      user_id: userId,
      template_id: template.id || null,
      request_type: templateType,
      latency_ms: Date.now() - start,
      status: 'error',
      error_message: err.message,
    });
    throw err;
  }
};

module.exports = { generate, getActiveTemplate, getEnabledKeywords, renderTemplate };

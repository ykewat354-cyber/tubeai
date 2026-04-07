/**
 * OpenAI configuration and content generation
 * Uses centralized config for API key and model selection
 */

const OpenAI = require("openai");
const config = require("../config");

const openai = new OpenAI({ apiKey: config.openai.apiKey });

/**
 * Generate YouTube content using OpenAI
 * @param {string} prompt - User's topic description
 * @param {object} options
 * @param {string} options.model - OpenAI model to use
 * @param {string} options.format - Output format
 * @returns {Promise<object>} Generated content
 */
async function generateContent(prompt, options = {}) {
  const model = options.model || config.openai.defaultModel.free;
  const format = options.format || "all";

  const systemPrompts = {
    ideas: "Generate compelling YouTube video ideas based on the user's request.",
    titles: "Generate catchy, click-worthy YouTube titles optimized for CTR.",
    script: "Write a complete YouTube video script with hook, body, and call-to-action.",
    all: "Generate YouTube video ideas, titles, and scripts. Return everything structured.",
  };

  const systemPrompt = `You are an expert YouTube content strategist and scriptwriter. ${systemPrompts[format] || systemPrompts.all}\n\nRespond in JSON format with clear, actionable output.`;

  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    temperature: 0.8,
    max_tokens: format === "script" ? 4000 : 1500,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch {
    return { raw: content };
  }
}

module.exports = { generateContent };

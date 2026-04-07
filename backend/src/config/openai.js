const OpenAI = require("openai");

// Validate API key exists
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate YouTube content using OpenAI
 * @param {string} prompt - User request description
 * @param {object} options - Generation options
 * @param {string} options.model - OpenAI model to use
 * @param {object} options.format - Output format (titles, ideas, script)
 * @returns {Promise<object>} - Generated content
 */
async function generateContent(prompt, options = {}) {
  const model = options.model || "gpt-4o-mini";
  const format = options.format || "all";

  // Build system prompt based on requested format
  let systemPrompt = "You are an expert YouTube content strategist and scriptwriter. ";

  if (format === "ideas") {
    systemPrompt += "Generate compelling YouTube video ideas based on the user's request.";
  } else if (format === "titles") {
    systemPrompt += "Generate catchy, click-worthy YouTube titles optimized for CTR.";
  } else if (format === "script") {
    systemPrompt += "Write a complete YouTube video script with hook, body, and call-to-action.";
  } else {
    systemPrompt += "Generate YouTube video ideas, titles, and scripts. Return everything structured.";
  }

  systemPrompt += "\n\nRespond in JSON format with clear, actionable output.";

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
    // If JSON parsing fails, return raw content
    return { raw: content };
  }
}

module.exports = { generateContent };

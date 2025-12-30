const ApiKey = require("@/models/ai/ai-apiKey");
const GeminiModel = require("@/models/ai/gemini-model");
const pplKey = require("@/models/ai/perplexity-apikey");
const PerplexityModel = require("@/models/ai/perplexity-model");


/**
 * Returns the currently active AI provider config
 * @returns { provider, modelName, apiKey }
 */
const getActiveAIConfig = async () => {
  // 1️⃣ Try Gemini first
  const geminiModel = await GeminiModel.findOne().sort({ createdAt: -1 });
  const geminiApiKey = await ApiKey.findOne().sort({ createdAt: -1 });

  if (geminiModel && geminiApiKey && geminiModel.status === true) {
    return {
      provider: "gemini",
      modelName: geminiModel.modelName,
      apiKey: geminiApiKey.apiKey,
    };
  }

  // 2️⃣ Fallback to Perplexity
  const pplModel = await PerplexityModel.findOne({ status: true }).sort({
    createdAt: -1,
  });
  const pplApiKey = await pplKey.findOne().sort({ createdAt: -1 });

  if (pplModel && pplApiKey) {
    return {
      provider: "perplexity",
      modelName: pplModel.modelName,
      apiKey: pplApiKey.apiKey,
    };
  }

  throw new Error("No active AI provider configured");
};

module.exports = getActiveAIConfig;

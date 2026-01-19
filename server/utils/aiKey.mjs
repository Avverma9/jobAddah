import ApiKey from "../models/ai/ai-apiKey.mjs";
import GeminiModel from "../models/ai/gemini-model.mjs";
import pplKey from "../models/ai/perplexity-apikey.mjs";
import PerplexityModel from "../models/ai/perplexity-model.mjs";

const getActiveAIConfig = async () => {
  const geminiModel = await GeminiModel.findOne().sort({ createdAt: -1 });
  const geminiApiKey = await ApiKey.findOne().sort({ createdAt: -1 });

  if (geminiModel && geminiApiKey && geminiModel.status === true) {
    return {
      provider: "gemini",
      modelName: geminiModel.modelName,
      apiKey: geminiApiKey.apiKey,
    };
  }

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

export default getActiveAIConfig;

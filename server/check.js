const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.GEMINI_API_KEY;

async function findMyModels() {
  if (!API_KEY) {
    console.error("❌ API Key is missing in .env file");
    return;
  }

  console.log("📡 Asking Google Servers directly...");
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

  try {
    const response = await axios.get(url);
    
    if (!response.data || !response.data.models) {
      console.log("⚠️ Connection success, but no models found inside response.");
      return;
    }

    const models = response.data.models;
    console.log("\n✅ SUCCESSFULLY CONNECTED! Here are the available models for your Key:\n");

    // Filter sirf generateContent wale models
    const usableModels = models.filter(m => m.supportedGenerationMethods.includes("generateContent"));

    if (usableModels.length === 0) {
      console.log("❌ No models available for 'Content Generation' (Maybe only Embedding models available?)");
    }

    const modelData = usableModels.map(model => ({
        "Model Name": model.name.replace("models/", ""),
        "Version": model.version,
        "Supported Methods": model.supportedGenerationMethods.join(', ')
    }));

    console.table(modelData);

    console.log("\n📋 Suggestion: Pick a 'Model Name' from the table above and use it in your code (e.g., in `index.js` or `ai.js`).");

  } catch (error) {
    console.error("\n❌ REQUEST FAILED.");
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Reason: ${JSON.stringify(error.response.data.error.message, null, 2)}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
    console.log("\n💡 Possible Causes:");
    console.log("   1. API Key GALAT hai.");
    console.log("   2. 'Generative Language API' enable nahi hai Google Cloud Console mein.");
    console.log("   3. Billing account required ho sakta hai (Check Project in Cloud Console).");
  }
}

findMyModels();
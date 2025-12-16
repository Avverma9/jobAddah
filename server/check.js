const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.GEMINI_API_KEY;

async function findMyModels() {
  if (!API_KEY) {
    console.error("❌ API Key is missing in .env file");
    return;
  }

  
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

  try {
    const response = await axios.get(url);
    
    if (!response.data || !response.data.models) {
      return;
    }

    const models = response.data.models;

    // Filter sirf generateContent wale models
    const usableModels = models.filter(m => m.supportedGenerationMethods.includes("generateContent"));

    if (usableModels.length === 0) {
    }

    const modelData = usableModels.map(model => ({
        "Model Name": model.name.replace("models/", ""),
        "Version": model.version,
        "Supported Methods": model.supportedGenerationMethods.join(', ')
    }));


  } catch (error) {
    console.error("\n❌ REQUEST FAILED.");
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Reason: ${JSON.stringify(error.response.data.error.message, null, 2)}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
  }
}

findMyModels();
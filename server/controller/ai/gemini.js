const ApiKey = require("@/models/ai/ai-apiKey");
const fs = require('fs');
const path = require('path');
const GeminiModel = require("@/models/ai/gemini-model");


const setModel = async (req, res) => {
  try {
    const modelName = req.body.modelName;

    if (!modelName) {
      return res.status(400).json({ success: false, message: "modelName is required" });
    }

    // Upsert in one go (cleanest way)
    const modelRecord = await GeminiModel.findOneAndUpdate(
      {},
      { modelName },
      { new: true, upsert: true }
    );

    return res.json({
      success: true,
      message: "Model updated successfully",
      model: modelRecord
    });

  } catch (err) {
    console.error("Error setting Gemini model:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

const getModel = async (req, res) => {
  try {
    const modelRecord = await GeminiModel.findOne({});

    return res.json({
      success: true,
      modelName: modelRecord ? modelRecord.modelName : null
    });

  } catch (err) {
    console.error("Error getting Gemini model:", err);
    
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

const setApiKey = async (req, res) => {
  try {
    const apiKey = req.body.apiKey;

    if (!apiKey) {
      return res.status(400).json({ success: false, message: "apiKey is required" });
    }
    const apiKeyRecord = await ApiKey.findOneAndUpdate(
      {},
      { apiKey },
      { new: true, upsert: true }
    );

    // Also persist to .env so process.env picks it up on restart
    try {
      const envPath = path.resolve(process.cwd(), '.env');
      let envContents = '';
      if (fs.existsSync(envPath)) {
        envContents = fs.readFileSync(envPath, 'utf8');
      }

      const keyLine = `GEMINI_API_KEY=${apiKey}`;
      const re = /^GEMINI_API_KEY=.*$/m;
      if (re.test(envContents)) {
        envContents = envContents.replace(re, keyLine);
      } else {
        if (envContents.length && !envContents.endsWith('\n')) envContents += '\n';
        envContents += keyLine + '\n';
      }

      fs.writeFileSync(envPath, envContents, 'utf8');
      // update current process env so subsequent calls in same run use it
      process.env.GEMINI_API_KEY = apiKey;
    } catch (envErr) {
      console.warn('Could not write .env file:', envErr.message);
    }

    return res.json({
      success: true,
      message: "API key updated successfully",
      apiKey: apiKeyRecord
    });

  } catch (err) {
    console.error("Error setting API key:", err);
  }
};

const getApiKey = async (req, res) => {
  try {
    // Prefer environment variable if present
    if (process.env.GEMINI_API_KEY) {
      return res.json({ success: true, apiKey: process.env.GEMINI_API_KEY });
    }

    const apiKeyRecord = await ApiKey.findOne({});
    return res.json({
      success: true,
      apiKey: apiKeyRecord ? apiKeyRecord.apiKey : null
    });

  } catch (err) {
    console.error("Error getting API key:", err);
  }
};



module.exports = {
getModel,
setModel,
getApiKey,
setApiKey
};
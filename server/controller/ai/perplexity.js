const pplKey = require("@/models/ai/perplexity-apikey");
const path = require('path');
const fs = require('fs');
const PerplexityModel = require('@/models/ai/perplexity-model');

const testModelAvailability = async (apiKey, modelName) => {
  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: "user",
            content: "Test",
          },
        ],
        max_tokens: 10,
      }),
    });

    if (response.ok) {
      console.log(`✅ Model '${modelName}' is available`);
      return true;
    } else {
      const error = await response.json();
      console.log(`❌ Model '${modelName}' error:`, error.error?.message);
      return false;
    }
  } catch (error) {
    console.error(`Error testing model '${modelName}':`, error.message);
    return false;
  }
};

// Optional: test model availability in background (non-blocking)
;(async () => {
  try {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) return; // nothing to test
    const modelsToTest = ["sonar", "sonar-pro", "r1-1776"];
    for (const model of modelsToTest) {
      // await each test sequentially to avoid spamming the API
      // but do not block module loading as this runs asynchronously
      // and any errors are logged
      // eslint-disable-next-line no-await-in-loop
      await testModelAvailability(apiKey, model);
    }
  } catch (e) {
    console.warn('Perplexity model availability check failed:', e.message);
  }
})();

const setPplApiKey = async (req, res) => {
  try {
    const apiKey = req.body.apiKey;

    if (!apiKey) {
      return res
        .status(400)
        .json({ success: false, message: "apiKey is required" });
    }
    const apiKeyRecord = await pplKey.findOneAndUpdate(
      {},
      { apiKey },
      { new: true, upsert: true }
    );

    // Also persist to .env so process.env picks it up on restart
    try {
      const envPath = path.resolve(process.cwd(), ".env");
      let envContents = "";
      if (fs.existsSync(envPath)) {
        envContents = fs.readFileSync(envPath, "utf8");
      }

      const keyLine = `PERPLEXITY_API_KEY=${apiKey}`;
      const re = /^PERPLEXITY_API_KEY=.*$/m;
      if (re.test(envContents)) {
        envContents = envContents.replace(re, keyLine);
      } else {
        if (envContents.length && !envContents.endsWith("\n"))
          envContents += "\n";
        envContents += keyLine + "\n";
      }

      fs.writeFileSync(envPath, envContents, "utf8");
      // update current process env so subsequent calls in same run use it
      process.env.PERPLEXITY_API_KEY = apiKey;
    } catch (envErr) {
      console.warn("Could not write .env file:", envErr.message);
    }

    return res.json({
      success: true,
      message: "API key updated successfully",
      apiKey: apiKeyRecord,
    });
  } catch (err) {
    console.error("Error setting API key:", err);
  }
};

const getPplApiKey = async (req, res) => {
  try {
    // Prefer environment variable if present

    const apiKeyRecord = await pplKey.findOne({});
    return res.json({
      success: true,
      apiKey: apiKeyRecord ? apiKeyRecord.apiKey : null,
    });
  } catch (err) {
    console.error("Error getting API key:", err);
  }
};

const setModelName = async (req, res) => {
  try {
    const modelName = req.body.modelName;

    if (!modelName) {
      return res
        .status(400)
        .json({ success: false, message: "modelName is required" });
    }

    const modelRecord = await PerplexityModel.findOneAndUpdate(
      {},
      { modelName },
      { new: true, upsert: true }
    );

    return res.json({
      success: true,
      message: "Model updated successfully",
      model: modelRecord,
    });
  } catch (err) {
    console.error("Error setting Perplexity model:", err);
  }
};

const getModelName = async (req, res) => {
  try {
    const modelRecord = await PerplexityModel.findOne({});

    if (!modelRecord) {
      return res.json({
        success: true,
        modelName: null,
        status: true,
        _id: null,
      });
    }

    return res.json({
      success: true,
      modelName: modelRecord.modelName,
      status: modelRecord.status,   // 🔥 VERY IMPORTANT
      _id: modelRecord._id,
    });

  } catch (err) {
    console.error("Error getting Perplexity model:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const changeStatus = async (req, res) => {
  try {
    const { modelName, status } = req.body;

    // 🔒 Hard validation
    if (!modelName || typeof status !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "modelName and boolean status are required",
      });
    }

    const modelRecord = await PerplexityModel.findOneAndUpdate(
      { modelName: modelName.trim().toLowerCase() },
      { $set: { status } },
      {
        new: true,
        runValidators: true,
        strict: true,
      }
    );

    if (!modelRecord) {
      return res.status(404).json({
        success: false,
        message: "Model not found",
      });
    }

    return res.json({
      success: true,
      message: "Model status updated successfully",
      model: modelRecord,
    });
  } catch (err) {
    console.error("Error changing Perplexity model status:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};


module.exports = {
  setPplApiKey,
  getPplApiKey,
  testModelAvailability,
  setModelName,
  getModelName,
  changeStatus,
};

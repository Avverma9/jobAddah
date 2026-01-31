import PerplexityModel from "../../models/ai/perplexity-model.mjs";
import fs from "fs";
import path from "path";
import pplKey from "../../models/ai/perplexity-apikey.mjs";

const checkModelAvailability = async (apiKey, modelName) => {
  try {
    const response = await fetch(
      "https://api.perplexity.ai/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: "user", content: "Test" }],
          max_tokens: 10,
        }),
      }
    );

    if (response.ok) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
};

const testModelAvailability = async (req, res) => {
  try {
    const { apiKey, modelName } = req.body;
    if (!apiKey || !modelName) {
      return res.status(400).json({
        success: false,
        message: "apiKey and modelName are required",
      });
    }

    const ok = await checkModelAvailability(apiKey, modelName);
    return res.json({ success: true, available: ok });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

(async () => {
  try {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) return;

    const modelsToTest = ["sonar", "sonar-pro", "r1-1776"];
    for (const model of modelsToTest) {
      await checkModelAvailability(apiKey, model);
    }
  } catch {}
})();

const setPplApiKey = async (req, res) => {
  try {
    const { apiKey, status = "ACTIVE", label = "", priority = 0 } = req.body;

    if (!apiKey) {
      return res
        .status(400)
        .json({ success: false, message: "apiKey is required" });
    }

    const apiKeyRecord = await pplKey.findOneAndUpdate(
      { apiKey },
      {
        $set: { status, label, priority, provider: "perplexity" },
        $setOnInsert: {},
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

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
      process.env.PERPLEXITY_API_KEY = apiKey;
    } catch {}

    const keys = await pplKey.find({ provider: "perplexity" }).sort({
      status: -1,
      priority: -1,
      updatedAt: -1,
    });

    return res.json({
      success: true,
      message: "API key saved",
      apiKey: apiKeyRecord,
      keys,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

const getPplApiKey = async (req, res) => {
  try {
    const keys = await pplKey.find({ provider: "perplexity" }).sort({
      status: -1,
      priority: -1,
      updatedAt: -1,
    });

    return res.json({
      success: true,
      keys,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

const setModelName = async (req, res) => {
  try {
    const { modelName, status = true, priority = 0 } = req.body;

    if (!modelName) {
      return res
        .status(400)
        .json({ success: false, message: "modelName is required" });
    }

    const modelRecord = await PerplexityModel.findOneAndUpdate(
      { modelName: modelName.trim().toLowerCase() },
      { $set: { status: Boolean(status), priority } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({
      success: true,
      message: "Model saved",
      model: modelRecord,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

const getModelName = async (req, res) => {
  try {
    const models = await PerplexityModel.find().sort({
      priority: -1,
      updatedAt: -1,
    });

    return res.json({
      success: true,
      models,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

const changeStatus = async (req, res) => {
  try {
    const { modelName, status } = req.body;

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
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

export {
  setPplApiKey,
  getPplApiKey,
  testModelAvailability,
  setModelName,
  getModelName,
  changeStatus,
};

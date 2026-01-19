import fs from "fs";
import path from "path";
import ApiKey from "../../models/ai/ai-apiKey.mjs";
import GeminiModel from "../../models/ai/gemini-model.mjs";

const changeStatus = async (req, res) => {
  try {
    const { modelName, status } = req.body;

    if (!modelName || typeof status !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "modelName and boolean status are required",
      });
    }

    const modelRecord = await GeminiModel.findOneAndUpdate(
      { modelName: modelName.trim() },
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
        message: "Model not found in database",
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

const setModel = async (req, res) => {
  try {
    const { modelName } = req.body;

    if (!modelName) {
      return res
        .status(400)
        .json({ success: false, message: "modelName is required" });
    }

    const modelRecord = await GeminiModel.findOneAndUpdate(
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
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getModel = async (req, res) => {
  try {
    const modelRecord = await GeminiModel.findOne({});

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
      status: modelRecord.status,
      _id: modelRecord._id,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const setApiKey = async (req, res) => {
  try {
    const { apiKey } = req.body;

    if (!apiKey) {
      return res
        .status(400)
        .json({ success: false, message: "apiKey is required" });
    }

    const apiKeyRecord = await ApiKey.findOneAndUpdate(
      {},
      { apiKey },
      { new: true, upsert: true }
    );

    try {
      const envPath = path.resolve(process.cwd(), ".env");
      let envContents = "";

      if (fs.existsSync(envPath)) {
        envContents = fs.readFileSync(envPath, "utf8");
      }

      const keyLine = `GEMINI_API_KEY=${apiKey}`;
      const re = /^GEMINI_API_KEY=.*$/m;

      if (re.test(envContents)) {
        envContents = envContents.replace(re, keyLine);
      } else {
        if (envContents.length && !envContents.endsWith("\n"))
          envContents += "\n";
        envContents += keyLine + "\n";
      }

      fs.writeFileSync(envPath, envContents, "utf8");
      process.env.GEMINI_API_KEY = apiKey;
    } catch {}

    return res.json({
      success: true,
      message: "API key updated successfully",
      apiKey: apiKeyRecord,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getApiKey = async (req, res) => {
  try {
    if (process.env.GEMINI_API_KEY) {
      return res.json({
        success: true,
        apiKey: process.env.GEMINI_API_KEY,
      });
    }

    const apiKeyRecord = await ApiKey.findOne({});

    return res.json({
      success: true,
      apiKey: apiKeyRecord ? apiKeyRecord.apiKey : null,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export {
  getModel,
  setModel,
  getApiKey,
  setApiKey,
  changeStatus,
};

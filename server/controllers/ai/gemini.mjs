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
    const { modelName, status = true, priority = 0 } = req.body;

    if (!modelName) {
      return res
        .status(400)
        .json({ success: false, message: "modelName is required" });
    }

    const modelRecord = await GeminiModel.findOneAndUpdate(
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

const getModel = async (req, res) => {
  try {
    const models = await GeminiModel.find().sort({ priority: -1, updatedAt: -1 });

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

const setApiKey = async (req, res) => {
  try {
    const { apiKey, status = "ACTIVE", label = "", priority = 0 } = req.body;

    if (!apiKey) {
      return res
        .status(400)
        .json({ success: false, message: "apiKey is required" });
    }

    const apiKeyRecord = await ApiKey.findOneAndUpdate(
      { apiKey },
      {
        $set: { status, label, priority, provider: "gemini" },
        $setOnInsert: {},
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const keys = await ApiKey.find({ provider: "gemini" }).sort({
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

const getApiKey = async (req, res) => {
  try {
    const keys = await ApiKey.find({ provider: "gemini" }).sort({
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

export {
  getModel,
  setModel,
  getApiKey,
  setApiKey,
  changeStatus,
};

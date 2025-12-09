const mongoose = require("mongoose");

const geminiModelSchema = new mongoose.Schema({
  modelName: { type: String, required: true },
});

const GeminiModel = mongoose.model("GeminiModel", geminiModelSchema);

module.exports = GeminiModel;

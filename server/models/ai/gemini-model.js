const mongoose = require("mongoose");

const geminiModelSchema = new mongoose.Schema({
  modelName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
});

geminiModelSchema.index({ modelName: 1 }, { unique: true });

const GeminiModel = mongoose.model("GeminiModel", geminiModelSchema);

module.exports = GeminiModel;

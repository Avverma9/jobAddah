const mongoose = require("mongoose");

const perplexityModelSchema = new mongoose.Schema({
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

// 🔥 Ensure index actually exists
perplexityModelSchema.index({ modelName: 1 }, { unique: true });

const PerplexityModel = mongoose.model(
  "PerplexityModel",
  perplexityModelSchema
);

module.exports = PerplexityModel;

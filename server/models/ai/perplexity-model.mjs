import mongoose from "mongoose";

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
  priority: {
    type: Number,
    default: 0,
    index: true,
  },
  lastUsedAt: { type: Date },
}, { timestamps: true });

perplexityModelSchema.index({ modelName: 1 }, { unique: true });

const PerplexityModel = mongoose.model(
  "PerplexityModel",
  perplexityModelSchema
);

export default PerplexityModel;

import mongoose from "mongoose";

const pplSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ["perplexity"],
      default: "perplexity",
      index: true,
    },
    apiKey: { type: String, required: true },
    status: {
      type: String,
      enum: ["ACTIVE", "DISABLED", "INACTIVE"],
      default: "ACTIVE",
      index: true,
    },
    label: { type: String, default: "" },
    priority: { type: Number, default: 0, index: true },
    successCount: { type: Number, default: 0 },
    failCount: { type: Number, default: 0 },
    lastUsedAt: { type: Date },
    lastFailedAt: { type: Date },
    lastError: { type: String },
  },
  { timestamps: true }
);

pplSchema.index({ provider: 1, apiKey: 1 }, { unique: true });

const pplKey = mongoose.model("ppl", pplSchema);

export default pplKey;

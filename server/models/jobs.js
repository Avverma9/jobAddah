const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    postName: { type: String, index: true },
    originalUrl: { type: String, index: true },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    strict: false,
    minimize: false,
    timestamps: true,
  }
);

jobSchema.pre("save", function (next) {
  const allowed = ["postName", "originalUrl", "_id", "createdAt", "updatedAt", "__v", "data"];
  for (const key of Object.keys(this._doc)) {
    if (!allowed.includes(key)) {
      this.data[key] = this._doc[key];
      delete this._doc[key];
    }
  }
  next();
});

module.exports = mongoose.model("Job", jobSchema);

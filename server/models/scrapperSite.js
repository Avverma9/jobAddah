const mongoose = require("mongoose");

const siteSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

const Site = mongoose.model("Site", siteSchema);

module.exports = Site;

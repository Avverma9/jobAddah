// models/jobs.js

const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    postName: String,
    shortInfo: String,
    category: String,
    postDate: Date,
    updateDate: Date,
    importantDates: [Object],
    applicationFee: [Object],
    ageLimit: Object,
    vacancyDetails: [Object],
    importantLinks: [Object],
    originalUrl: String,
  },
  {
    strict: false, // accept ANY new fields
    timestamps: true, // auto add createdAt + updatedAt
  }
);

module.exports = mongoose.model("Job", jobSchema);

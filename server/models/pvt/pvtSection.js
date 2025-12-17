const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
  {},
  {
    strict: false, // <-- yeh magic line, ab schema kuch bhi allow karega
    timestamps: true,
  }
);

const PvtSection = mongoose.model('PvtSection', sectionSchema);

module.exports = PvtSection;

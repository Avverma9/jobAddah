import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema(
  {},
  {
    strict: false, // <-- yeh magic line, ab schema kuch bhi allow karega
    timestamps: true,
  }
);

const PvtSection = mongoose.model('PvtSection', sectionSchema);

export default PvtSection;

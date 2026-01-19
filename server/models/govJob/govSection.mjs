import mongoose from "mongoose";
const sectionSchema = new mongoose.Schema(
  {},
  {
    strict: false, // <-- yeh magic line, ab schema kuch bhi allow karega
    timestamps: true,
  }
);

const Section = mongoose.model('Section', sectionSchema);

export default Section;

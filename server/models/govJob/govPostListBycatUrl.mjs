import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    link: { type: String, required: true, index: true },
  },
  { _id: false, timestamps: true }
);

const postListSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, unique: true, index: true },
    jobs: { type: [jobSchema], default: [] },
  },
  { timestamps: true }
);

const govPostList = mongoose.model("postList", postListSchema);

export default govPostList;
 


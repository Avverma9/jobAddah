import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    link: { type: String, required: true, index: true },
    canonicalLink: { type: String, index: true },
    publishDate: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false, timestamps: false }
);

const postListSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, unique: true, index: true },
    section: { type: String, index: true },
    categoryName: { type: String, default: "" },
    lastScraped: { type: Date },
    jobs: { type: [jobSchema], default: [] },
  },
  { timestamps: true }
);

const govPostList = mongoose.model("postList", postListSchema);

export default govPostList;
 

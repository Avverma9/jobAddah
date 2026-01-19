import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    fav: { type: Boolean, default: false },
  },
  {
    strict: false,
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);

export default Post;

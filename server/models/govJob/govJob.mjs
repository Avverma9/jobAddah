import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    fav: { type: Boolean, default: false },

    // Canonical identity fields
    canonicalUrl: { type: String, unique: true, index: true }, // https://domain.com/path
    path: { type: String, index: true }, // /path
    sourceUrlFull: { type: String }, // original url with query if any

    // Dedupe across mirrors
    contentSignature: { type: String, unique: true, sparse: true, index: true },

    // Page change tracking
    pageHash: { type: String, index: true },

    // Soft dedupe helpers
    semanticSignature: { type: String, index: true },
  },
  {
    strict: false,
    timestamps: true,
  }
);

// Optional extra indexes (depends on your use-case)
// postSchema.index({ path: 1 }); // not unique if multiple domains supported

const Post = mongoose.model("Post", postSchema);

export default Post;

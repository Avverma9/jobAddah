import mongoose from "mongoose";

const recruitmentContentSchema = new mongoose.Schema(
  {
    originalSummary: String,
    whoShouldApply: [String],
    keyHighlights: [String],
    applicationSteps: [String],
    selectionProcessSummary: String,
    documentsChecklist: [String],
    feeSummary: String,
    importantNotes: [String],
    faq: [
      {
        q: String,
        a: String,
      },
    ],
    updateSummary: String,
    keyChanges: [String],
    actionItems: [String],
  },
  { _id: false, strict: false }
);

const recruitmentSchema = new mongoose.Schema(
  {
    content: recruitmentContentSchema,
  },
  { _id: false, strict: false }
);

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

    // Partial schema to document and validate content block (other fields remain flexible)
    recruitment: { type: recruitmentSchema, default: undefined },
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

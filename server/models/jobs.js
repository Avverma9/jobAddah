const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    fav: { type: Boolean, default: false },
  },
  {
    strict: false, // <-- yeh magic line, ab schema kuch bhi allow karega
    timestamps: true,
  }
);

const Post = mongoose.model('Post', postSchema);

module.exports = Post;

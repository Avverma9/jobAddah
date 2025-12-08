const mongoose = require('mongoose');

const postListSchema = new mongoose.Schema(
  {},
  {
    strict: false, // <-- yeh magic line, ab schema kuch bhi allow karega
    timestamps: true,
  }
);

const postList = mongoose.model('postList', postListSchema);

module.exports = postList;

const mongoose = require("mongoose");
const ppl = new mongoose.Schema({
  apiKey: String,
});
const pplKey = mongoose.model("ppl", ppl);
module.exports = pplKey;
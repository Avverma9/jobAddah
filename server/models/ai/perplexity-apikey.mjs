import mongoose from "mongoose";

const pplSchema = new mongoose.Schema({
  apiKey: String,
});

const pplKey = mongoose.model("ppl", pplSchema);

export default pplKey;

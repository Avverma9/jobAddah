import mongoose from "mongoose";

const apiKeySchema = new mongoose.Schema({
  apiKey: String,
});

const ApiKey = mongoose.model("ApiKey", apiKeySchema);

export default ApiKey;

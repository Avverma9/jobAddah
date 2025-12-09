const mongoose = require("mongoose");
const aiapikey = new mongoose.Schema({
  apiKey: String,
});
const ApiKey = mongoose.model("ApiKey", aiapikey);
module.exports = ApiKey;

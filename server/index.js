// Polyfill Web APIs for Node.js
if (!globalThis.File) {
  const { File } = require('undici');
  globalThis.File = File;
}

require("dotenv").config();
// register module-alias so paths like require('@/models/...') work at runtime
require('module-alias/register');
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connectDB } = require("./config/db");
const router = require("./routes/index");

const app = express();

connectDB();


app.use(cors({ origin: "*", credentials: false }));
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));


app.use("/api/v1",router );

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server connected on port ${PORT}`);
});

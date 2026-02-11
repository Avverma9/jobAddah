import "dotenv/config";
// import "module-alias/register.js"; // Temporarily disabled for ESM compatibility
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import notifyMailerRouter, { transporter } from "./nodemailer/notify_mailer.mjs";
import { connectDB } from "./config/db.mjs";
import router from "./routes/index.mjs";
import {
  initCategoryCron,
  syncCategoriesAndJobs,
} from "./utils/runAutomatic.mjs";

import pkg from "undici";
const { File } = pkg;

if (!globalThis.File) {
  globalThis.File = File;
}

const app = express();

await connectDB();

app.use(cors({ origin: "*", credentials: false }));
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));

initCategoryCron();

// verify mailer transporter on startup
const verifyMailer = async () => {
  if (!transporter || typeof transporter.verify !== "function") {
    console.warn("Mailer: transporter is not available or verify() not supported");
    return;
  }
  try {
    await transporter.verify();
    console.log("Mailer: transporter verified successfully");
  } catch (err) {
    console.error("Mailer: transporter verification failed:", err.message || err);
  }
};

verifyMailer();

app.use("/api/v1", router);
// expose mailer routes both at /mailer and under the API prefix
app.use("/mailer", notifyMailerRouter);
app.use("/api/v1", notifyMailerRouter);
app.use("/test-cron", syncCategoriesAndJobs);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server connected on port ${PORT}`);
});

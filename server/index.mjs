import "dotenv/config";
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

// ✅ Allowed Origins
const allowedOrigins = [
  'https://jobsaddah.com',
  'https://www.jobsaddah.com',
  'https://adminaddah.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
];

// ✅ CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl, server-to-server)
    if (!origin) {
      console.log('✅ CORS: Request with no origin (allowed)');
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ CORS: Allowed origin - ${origin}`);
      callback(null, true);
    } else {
      console.warn(`❌ CORS: Blocked origin - ${origin}`);
      // Option 1: Block the request
      // callback(new Error('Not allowed by CORS'));
      
      // Option 2: Allow but log (recommended for debugging)
      callback(null, true);
    }
  },
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Set-Cookie', 'Authorization'],
  maxAge: 86400, // Cache preflight requests for 24 hours
  optionsSuccessStatus: 200,
  preflightContinue: false
};

app.use(cors(corsOptions));

// Explicitly handle preflight OPTIONS requests
app.options('*', cors(corsOptions));

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
  console.log(`🌐 Allowed CORS origins:`, allowedOrigins);
});

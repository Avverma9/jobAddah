import nodemailer from "nodemailer";
import express from "express";
import Subscriber from "../models/subscriber.mjs";
const router = express.Router();

const EMAIL_USER = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : "";
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD
  ? process.env.EMAIL_PASSWORD.trim()
  : process.env.GOOGLE_APP_PASSWORD
  ? process.env.GOOGLE_APP_PASSWORD.replace(/\s+/g, "")
  : "";
const EMAIL_FROM = process.env.EMAIL_FROM
  ? process.env.EMAIL_FROM.trim()
  : EMAIL_USER;
const SMTP_HOST = process.env.SMTP_HOST ? process.env.SMTP_HOST.trim() : "smtp.hostinger.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE = String(process.env.SMTP_SECURE || "true").toLowerCase() === "true";

const parseRecipients = (raw) =>
  String(raw || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

const NOTIFY_RECIPIENTS = parseRecipients(process.env.NOTIFY_TO);

const mergeUniqueRecipients = (...groups) => {
  const seen = new Set();
  const out = [];

  groups.flat().forEach((email) => {
    const value = String(email || "").trim().toLowerCase();
    if (!value || seen.has(value)) return;
    seen.add(value);
    out.push(value);
  });

  return out;
};

export const transporter = nodemailer.createTransport({
  // Gmail config kept here for quick rollback:
  // service: "gmail",
  // auth: {
  //   user: EMAIL_USER,
  //   pass: EMAIL_PASSWORD, // 16-char app password (no spaces)
  // },
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

export const mailerFrom = EMAIL_FROM;
let isTransportVerified = false;

const ensureMailerReady = async () => {
  if (!EMAIL_USER) throw new Error("EMAIL_USER is missing");
  if (!EMAIL_PASSWORD) throw new Error("EMAIL_PASSWORD is missing");

  if (!isTransportVerified) {
    await transporter.verify();
    isTransportVerified = true;
  }
};

export async function sendNewPostsEmail({ newJobs }) {
  if (!Array.isArray(newJobs) || newJobs.length === 0) {
    return { skipped: true, reason: "No new jobs to mail" };
  }
  await ensureMailerReady();

  const activeSubscribers = await Subscriber.find({ status: "active" })
    .select("email -_id")
    .lean();

  const subscriberEmails = activeSubscribers
    .map((s) => String(s?.email || "").trim().toLowerCase())
    .filter(Boolean);

  const recipients = mergeUniqueRecipients(subscriberEmails, NOTIFY_RECIPIENTS);
  if (!recipients.length) {
    throw new Error("No recipients found (subscribers and NOTIFY_TO are empty)");
  }

  const subject = `New Govt Job Posts (${newJobs.length})`;
  const text = newJobs.map((j, i) => `${i + 1}. ${j.title}\n${j.link}`).join("\n\n");

  return transporter.sendMail({
    from: EMAIL_FROM,
    to: recipients.join(","),
    subject,
    text,
  });
}

export async function sendSubscriberWelcomeEmail({ name, email }) {
  if (!email) throw new Error("Subscriber email is required");
  if (!EMAIL_USER || !EMAIL_PASSWORD) {
    throw new Error("Mailer is not configured");
  }
  if (!isTransportVerified) {
    await transporter.verify();
    isTransportVerified = true;
  }

  const safeName = name && String(name).trim() ? String(name).trim() : "there";
  const subject = "Welcome to JobAddah updates";
  const text =
    `Hi ${safeName},\n\n` +
    "Thanks for subscribing to JobAddah updates. " +
    "We will email you whenever a new post is published.\n\n" +
    "You can unsubscribe anytime by contacting support.\n";

  return transporter.sendMail({
    from: EMAIL_FROM,
    to: email,
    subject,
    text,
  });
}

router.post("/new-message", async (req, res) => {
  const { name, email, message } = req.body;
  try {
    await ensureMailerReady();
    if (!NOTIFY_RECIPIENTS.length) {
      throw new Error("NOTIFY_TO is missing");
    }
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: NOTIFY_RECIPIENTS.join(","),
      subject: `New Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });
    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending message" });
  }
});

export default router;

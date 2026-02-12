import nodemailer from "nodemailer";
import express from "express";
const router = express.Router();

const EMAIL_USER = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : "";
const GOOGLE_APP_PASSWORD = process.env.GOOGLE_APP_PASSWORD
  ? process.env.GOOGLE_APP_PASSWORD.replace(/\s+/g, "")
  : "";
const EMAIL_FROM = process.env.EMAIL_FROM
  ? process.env.EMAIL_FROM.trim()
  : EMAIL_USER;

const parseRecipients = (raw) =>
  String(raw || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

const NOTIFY_RECIPIENTS = parseRecipients(process.env.NOTIFY_TO);

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: GOOGLE_APP_PASSWORD, // 16-char app password (no spaces)
  },
});

export const mailerFrom = EMAIL_USER;
let isTransportVerified = false;

const ensureMailerReady = async () => {
  if (!EMAIL_USER) throw new Error("EMAIL_USER is missing");
  if (!GOOGLE_APP_PASSWORD) throw new Error("GOOGLE_APP_PASSWORD is missing");
  if (!NOTIFY_RECIPIENTS.length) throw new Error("NOTIFY_TO is missing");

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

  const subject = `New Govt Job Posts (${newJobs.length})`;
  const text = newJobs.map((j, i) => `${i + 1}. ${j.title}\n${j.link}`).join("\n\n");

  return transporter.sendMail({
    from: EMAIL_FROM,
    to: NOTIFY_RECIPIENTS.join(","),
    subject,
    text,
  });
}

export async function sendSubscriberWelcomeEmail({ name, email }) {
  if (!email) throw new Error("Subscriber email is required");
  if (!EMAIL_USER || !GOOGLE_APP_PASSWORD) {
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

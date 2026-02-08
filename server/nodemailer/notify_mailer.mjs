import nodemailer from "nodemailer";
import express from "express";
const router = express.Router();

const EMAIL_USER = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : "";
const GOOGLE_APP_PASSWORD = process.env.GOOGLE_APP_PASSWORD
  ? process.env.GOOGLE_APP_PASSWORD.replace(/\s+/g, "")
  : "";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: GOOGLE_APP_PASSWORD, // 16-char app password (no spaces)
  },
});

export const mailerFrom = EMAIL_USER;

export async function sendNewPostsEmail({ categoryUrl, newJobs }) {
  const subject = `New Govt Job Posts (${newJobs.length})`;
  const text =
    `Category: ${categoryUrl}\n\n` +
    newJobs.map((j, i) => `${i + 1}. ${j.title}\n${j.link}`).join("\n\n");

  return transporter.sendMail({
    from: EMAIL_USER || process.env.EMAIL_USER,
    to: process.env.NOTIFY_TO, // comma separated allowed
    subject,
    text,
  });
}

export async function sendSubscriberWelcomeEmail({ name, email }) {
  if (!email) throw new Error("Subscriber email is required");
  const safeName = name && String(name).trim() ? String(name).trim() : "there";
  const subject = "Welcome to JobAddah updates";
  const text =
    `Hi ${safeName},\n\n` +
    "Thanks for subscribing to JobAddah updates. " +
    "We will email you whenever a new post is published.\n\n" +
    "You can unsubscribe anytime by contacting support.\n";

  return transporter.sendMail({
    from: EMAIL_USER || process.env.EMAIL_USER,
    to: email,
    subject,
    text,
  });
}

router.post("/new-message", async (req, res) => {
  const { name, email, message } = req.body;
  try {
    await transporter.sendMail({
      from: EMAIL_USER || process.env.EMAIL_USER,
      to: process.env.NOTIFY_TO, // comma separated allowed
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

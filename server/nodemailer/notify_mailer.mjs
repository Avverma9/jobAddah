import nodemailer from "nodemailer";
import express from "express";
const router = express.Router();

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.GOOGLE_APP_PASSWORD, // 16-char app password
  },
});

export async function sendNewPostsEmail({ categoryUrl, newJobs }) {
  const subject = `New Govt Job Posts (${newJobs.length})`;
  const text =
    `Category: ${categoryUrl}\n\n` +
    newJobs.map((j, i) => `${i + 1}. ${j.title}\n${j.link}`).join("\n\n");

  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.NOTIFY_TO, // comma separated allowed
    subject,
    text,
  });
}


router.post("/new-message", async (req, res) => {
  const { name, email, message } = req.body;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
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
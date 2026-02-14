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
const PUBLIC_SITE_URL = (process.env.NEXTJS_APP_URL || "https://jobsaddah.com").replace(/\/+$/, "");

const parseRecipients = (raw) =>
  String(raw || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

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

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const resolvePublicLink = (rawUrl) => {
  const value = String(rawUrl || "").trim();
  if (!value) return "";

  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return `${PUBLIC_SITE_URL}${value}`;

  try {
    return new URL(value, `${PUBLIC_SITE_URL}/`).toString();
  } catch {
    return `${PUBLIC_SITE_URL}/${value.replace(/^\/+/, "")}`;
  }
};

const detectUpdateType = ({ categoryName, categoryUrl, jobs = [] }) => {
  const bag = [
    categoryName,
    categoryUrl,
    ...jobs.map((j) => j?.title),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/\badmit\b|\bcard\b/.test(bag)) return "Admit Card";
  if (/\bresult\b|\bmerit\b|\bscore\b/.test(bag)) return "Result";
  return "Job";
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

export async function sendNewPostsEmail({ newJobs, categoryName = "", categoryUrl = "" }) {
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

  const updateType = detectUpdateType({ categoryName, categoryUrl, jobs: newJobs });
  const safeCategoryName = String(categoryName || "").trim() || "General";
  const resolvedCategoryUrl = resolvePublicLink(categoryUrl);
  const subject = `${updateType} Update: ${safeCategoryName} (${newJobs.length})`;

  const textHeader = [
    `Update Type: ${updateType}`,
    `Category: ${safeCategoryName}`,
    resolvedCategoryUrl ? `Category URL: ${resolvedCategoryUrl}` : "",
    "",
    `Total New Posts: ${newJobs.length}`,
    "",
  ]
    .filter(Boolean)
    .join("\n");

  const textList = newJobs
    .map((j, i) => {
      const title = String(j?.title || "Untitled").trim();
      const link = resolvePublicLink(j?.sourceLink || j?.canonicalLink || j?.link);
      return `${i + 1}. ${title}\n${link}`;
    })
    .join("\n\n");

  const htmlList = newJobs
    .map((j) => {
      const title = escapeHtml(String(j?.title || "Untitled").trim());
      const link = resolvePublicLink(j?.sourceLink || j?.canonicalLink || j?.link);
      const safeLink = escapeHtml(link);
      return `<li style="margin:0 0 10px;"><a href="${safeLink}" target="_blank" rel="noopener noreferrer">${title}</a></li>`;
    })
    .join("");

const html = `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; padding: 20px; color: #333333;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #e0e0e0;">
      
      <div style="background-color: #0056b3; padding: 20px; text-align: center;">
        <h2 style="margin: 0; color: #ffffff; font-size: 20px; letter-spacing: 0.5px;">Jobsaddah Update</h2>
      </div>

      <div style="padding: 24px;">
        
        <div style="background-color: #f8f9fa; border-left: 4px solid #0056b3; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
          <p style="margin: 0 0 8px; font-size: 14px;">
            <strong style="color: #555;">Type:</strong> <span style="color: #111; font-weight: 600;">${escapeHtml(updateType)}</span>
          </p>
          <p style="margin: 0 0 8px; font-size: 14px;">
            <strong style="color: #555;">Category:</strong> <span style="color: #111; font-weight: 600;">${escapeHtml(safeCategoryName)}</span>
          </p>
          
          ${resolvedCategoryUrl ? `
          <p style="margin: 0 0 8px; font-size: 14px;">
            <strong style="color: #555;">Link:</strong> 
            <a href="${escapeHtml(resolvedCategoryUrl)}" style="color: #0056b3; text-decoration: none; font-weight: bold;">View Category &rarr;</a>
          </p>` : ""}
          
          <p style="margin: 0; font-size: 14px;">
            <strong style="color: #555;">New Posts:</strong> <span style="background-color: #e2e6ea; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: bold;">${newJobs.length}</span>
          </p>
        </div>

        <div style="border-top: 1px solid #eee; padding-top: 15px;">
          <h3 style="margin: 0 0 15px; font-size: 16px; color: #444;">Latest Listings</h3>
          <ol style="padding-left: 20px; margin: 0; color: #444; line-height: 1.6;">
            ${htmlList}
          </ol>
        </div>

      </div>
      
      <div style="background-color: #fafafa; padding: 15px; text-align: center; border-top: 1px solid #eaeaea; font-size: 12px; color: #888;">
        &copy; Jobsaddah Automated Alert
      </div>
    </div>
  </div>
`;

  return transporter.sendMail({
    from: EMAIL_FROM,
    to: recipients.join(","),
    subject,
    text: `${textHeader}${textList}`,
    html,
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

router.post("/send-email", async (req, res) => {
  try {
    await ensureMailerReady();

    const { to, subject, text, html, from } = req.body || {};
    const recipients = Array.isArray(to) ? to : parseRecipients(to);

    if (!recipients.length) {
      return res.status(400).json({ success: false, message: "'to' is required" });
    }

    const invalidRecipients = recipients.filter((email) => !isValidEmail(email));
    if (invalidRecipients.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipient email(s)",
        invalidRecipients,
      });
    }

    if (!subject || !String(subject).trim()) {
      return res.status(400).json({ success: false, message: "'subject' is required" });
    }

    if (!text && !html) {
      return res.status(400).json({
        success: false,
        message: "Either 'text' or 'html' is required",
      });
    }

    if (from && !isValidEmail(from)) {
      return res.status(400).json({ success: false, message: "Invalid 'from' email" });
    }

    const info = await transporter.sendMail({
      from: from || EMAIL_FROM,
      to: recipients.join(","),
      subject: String(subject).trim(),
      text: text ? String(text) : undefined,
      html: html ? String(html) : undefined,
    });

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
      messageId: info?.messageId,
      accepted: info?.accepted || [],
      rejected: info?.rejected || [],
    });
  } catch (error) {
    console.error("Send email API failed:", error?.message || error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Error sending email",
    });
  }
});

export default router;

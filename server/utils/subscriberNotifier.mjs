import Subscriber from "../models/subscriber.mjs";
import { transporter } from "../nodemailer/notify_mailer.mjs";

const stripToPath = (url) => {
  if (!url) return "";
  try {
    // Add protocol if missing so URL parser works
    const maybeUrl = url.startsWith("http") ? url : `https://${url.replace(/^\/+/, "")}`;
    const parsed = new URL(maybeUrl);
    const path = parsed.pathname || "/";
    const search = parsed.search || "";
    return path.startsWith("/") ? `${path}${search}` : `/${path}${search}`;
  } catch {
    // fallback: ensure leading slash
    const clean = url.split("#")[0].trim();
    return clean.startsWith("/") ? clean : `/${clean}`;
  }
};

const buildPostLink = (post) => {
  const raw =
    post?.url || post?.sourceUrl || post?.canonicalUrl || post?.path || "";
  const path = stripToPath(raw);
  return path ? `https://jobsaddah.com${path}` : "";
};

const composeEmailText = (post) => {
  const lines = [
    "A new post has just been published on JobAddah.",
    "",
    `Title: ${post?.postTitle || post?.slug || "New post"}`,
    post?.organization ? `Organization: ${post.organization}` : null,
    post?.postType ? `Type: ${post.postType}` : null,
    buildPostLink(post) ? `Link: ${buildPostLink(post)}` : null,
    "",
    "You are receiving this because you subscribed for updates.",
    
  ].filter(Boolean);

  return lines.join("\n");
};

export const notifySubscribersAboutPost = async (post) => {
  if (!post) return { sent: 0, reason: "No post payload" };
  if (!transporter || typeof transporter.sendMail !== "function") {
    return { sent: 0, reason: "Mailer not configured" };
  }

  const subscribers = await Subscriber.find({ status: "active" }).lean();
  if (!subscribers.length) return { sent: 0, reason: "No active subscribers" };

  const recipients = subscribers
    .map((s) => s.email)
    .filter(Boolean)
    .join(", ");

  const subject = `New post: ${post.postTitle || post.slug || "JobAddah update"}`;

  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    bcc: recipients,
    subject,
    text: composeEmailText(post),
  });

  await Subscriber.updateMany(
    { _id: { $in: subscribers.map((s) => s._id) } },
    { $set: { lastNotifiedAt: new Date() } }
  );

  return { sent: subscribers.length, messageId: info?.messageId };
};

import Subscriber from "../models/subscriber.mjs";
import Post from "../models/govJob/govJob.mjs";
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
  return path ? `https://jobsaddah.com/post${path}` : "";
};

const escapeRegex = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getPostTitle = (post) =>
  post?.recruitment?.title || post?.postTitle || post?.title || post?.slug || "";

const getPostOrg = (post) =>
  post?.recruitment?.organization?.name || post?.organization || "";

const buildDedupeFilter = (post) => {
  if (!post) return null;
  const or = [];

  if (post.canonicalUrl) or.push({ canonicalUrl: post.canonicalUrl });
  if (post.contentSignature) or.push({ contentSignature: post.contentSignature });
  if (post.path) or.push({ path: post.path });
  if (post.url) or.push({ url: post.url });
  if (post.sourceUrlFull) or.push({ sourceUrlFull: post.sourceUrlFull });
  if (post.sourceUrl) or.push({ sourceUrl: post.sourceUrl });

  const title = getPostTitle(post);
  if (title) {
    const titleRe = new RegExp(`^${escapeRegex(title)}$`, "i");
    const titleOr = [
      { "recruitment.title": titleRe },
      { postTitle: titleRe },
      { title: titleRe },
    ];

    const org = getPostOrg(post);
    if (org) {
      const orgRe = new RegExp(`^${escapeRegex(org)}$`, "i");
      or.push({
        $and: [
          { $or: titleOr },
          {
            $or: [
              { "recruitment.organization.name": orgRe },
              { organization: orgRe },
            ],
          },
        ],
      });
    } else {
      or.push({ $or: titleOr });
    }
  }

  if (!or.length) return null;
  return or.length === 1 ? or[0] : { $or: or };
};

const acquireNotifyLock = async (postId) =>
  Post.findOneAndUpdate(
    {
      _id: postId,
      notifiedAt: { $exists: false },
      notifyingAt: { $exists: false },
    },
    { $set: { notifyingAt: new Date() } },
    { new: true }
  ).lean();

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

  const current = post?._id
    ? await Post.findById(post._id).lean()
    : null;
  if (!current) return { sent: 0, reason: "Post not found" };
  if (current.notifiedAt) return { sent: 0, reason: "Already notified" };

  const dedupeFilter = buildDedupeFilter(current);
  if (dedupeFilter) {
    const dup = await Post.findOne({
      _id: { $ne: current._id },
      ...dedupeFilter,
    })
      .select({ _id: 1 })
      .lean();
    if (dup) return { sent: 0, reason: "Duplicate post" };
  }

  const locked = await acquireNotifyLock(current._id);
  if (!locked) return { sent: 0, reason: "Notify lock unavailable" };

  const subscribers = await Subscriber.find({ status: "active" }).lean();
  if (!subscribers.length) return { sent: 0, reason: "No active subscribers" };

  const recipients = subscribers
    .map((s) => s.email)
    .filter(Boolean)
    .join(", ");

  const from = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : "";
  if (!from) return { sent: 0, reason: "EMAIL_USER missing" };

  const subject = `New post: ${post.postTitle || post.slug || "JobAddah update"}`;

  try {
    const info = await transporter.sendMail({
      from,
      to: from,
      bcc: recipients,
      subject,
      text: composeEmailText(current),
    });

    await Subscriber.updateMany(
      { _id: { $in: subscribers.map((s) => s._id) } },
      { $set: { lastNotifiedAt: new Date() } }
    );

    await Post.updateOne(
      { _id: current._id },
      { $set: { notifiedAt: new Date() }, $unset: { notifyingAt: "" } }
    );

    return { sent: subscribers.length, messageId: info?.messageId };
  } catch (err) {
    await Post.updateOne({ _id: current._id }, { $unset: { notifyingAt: "" } });
    throw err;
  }
};

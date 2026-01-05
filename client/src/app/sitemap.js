import connect from "@/lib/mongodb";
import Post from "@/lib/models/gov/job";
import { buildJobHref } from "@/lib/job-url";

const STATIC_ROUTES = [
  { path: "/", changeFrequency: "hourly", priority: 1 },
  { path: "/view-all", changeFrequency: "hourly", priority: 0.9 },
  { path: "/fav-jobs", changeFrequency: "daily", priority: 0.85 },
  { path: "/private-jobs", changeFrequency: "daily", priority: 0.85 },
  { path: "/remider", changeFrequency: "daily", priority: 0.8 },
  { path: "/image-tool", changeFrequency: "weekly", priority: 0.75 },
  { path: "/pdf-tool", changeFrequency: "weekly", priority: 0.75 },
  { path: "/resume-maker", changeFrequency: "weekly", priority: 0.7 },
  { path: "/typing-test", changeFrequency: "weekly", priority: 0.7 },
  { path: "/quiz-and-earn", changeFrequency: "weekly", priority: 0.65 },
  { path: "/mobile", changeFrequency: "weekly", priority: 0.6 },
  { path: "/welcome", changeFrequency: "monthly", priority: 0.55 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
  { path: "/policy", changeFrequency: "yearly", priority: 0.4 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.4 },
  { path: "/login", changeFrequency: "monthly", priority: 0.3 },
  { path: "/register", changeFrequency: "monthly", priority: 0.3 },
];

const toIsoString = (value) => {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
};

export default async function sitemap() {
  const envUrl =
    process.env.SITE_ORIGIN ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://jobsaddah.com";
  const baseUrl = envUrl.replace(/\/$/, "");

  const seenUrls = new Set();

  const staticEntries = STATIC_ROUTES.map((route) => {
    const path = route.path === "/" ? "" : route.path;
    const url = `${baseUrl}${path}`;
    seenUrls.add(url);
    return {
      url,
      lastModified: toIsoString(),
      changeFrequency: route.changeFrequency || "weekly",
      priority: route.priority ?? 0.5,
    };
  });

  let postEntries = [];
  try {
    await connect();

    // Fetch posts. Limit to 10k to prevent timeouts/memory issues during build
    // In a real large scale app, generateSitemaps (plural) would be used.
    const allPosts = await Post.find({}, "url updatedAt createdAt")
      .sort({ createdAt: -1 })
      .limit(10000)
      .lean();

    postEntries = allPosts
      .map((post) => {
        const href = buildJobHref(post.url || "");
        if (!href || href === "#") {
          return null;
        }
        const url = `${baseUrl}${href}`;
        if (seenUrls.has(url)) {
          return null;
        }
        seenUrls.add(url);
        return {
          url,
          lastModified: toIsoString(post.updatedAt || post.createdAt),
          changeFrequency: "weekly",
          priority: 0.6,
        };
      })
      .filter(Boolean);
  } catch (error) {
    console.error("Sitemap generation error:", error);
  }

  return [...staticEntries, ...postEntries];
}

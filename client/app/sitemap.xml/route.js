import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import GovPostList from "@/lib/models/joblist";
import { getCleanPostUrl } from "@/lib/job-url";
import { blogPosts } from "@/lib/blog-posts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://jobsaddah.com").replace(/\/$/, "");
const STATIC_ROUTES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/about", priority: "0.7", changefreq: "weekly" },
  { path: "/contact", priority: "0.6", changefreq: "weekly" },
  { path: "/policy", priority: "0.4", changefreq: "monthly" },
  { path: "/terms", priority: "0.4", changefreq: "monthly" },
  { path: "/view-all", priority: "0.6", changefreq: "weekly" },
  { path: "/post", priority: "0.8", changefreq: "daily" },
  { path: "/tools/image", priority: "0.4", changefreq: "monthly" },
  { path: "/tools/resume", priority: "0.4", changefreq: "monthly" },
  { path: "/tools/typing", priority: "0.4", changefreq: "monthly" },
  { path: "/mock-test", priority: "0.5", changefreq: "weekly" },
  { path: "/guides/why-jobsaddah", priority: "0.3", changefreq: "monthly" },
  { path: "/guides", priority: "0.4", changefreq: "weekly" },
  { path: "/guides/interview-tips", priority: "0.3", changefreq: "monthly" },
  { path: "/guides/salary-info", priority: "0.3", changefreq: "monthly" },
  { path: "/guides/notification-reading", priority: "0.3", changefreq: "monthly" },
  { path: "/blog", priority: "0.4", changefreq: "weekly" },
];
const BLOG_ROUTES = blogPosts.map((post) => ({
  path: `/blog/${post.slug}`,
  priority: "0.4",
  changefreq: "weekly",
}));
const BLOCKED_TITLES = new Set(["Privacy Policy", "Sarkari Result"]);
const MIN_INDEXABLE_JOBS = 3;

const escapeXml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const buildUrlEntry = ({ loc, lastmod, changefreq, priority }) => `
  <url>
    <loc>${escapeXml(loc)}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
    ${changefreq ? `<changefreq>${changefreq}</changefreq>` : ""}
    ${priority ? `<priority>${priority}</priority>` : ""}
  </url>`;

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const normalizePath = (rawUrl) => {
  if (!rawUrl) return null;
  const cleanPath = getCleanPostUrl(rawUrl);
  if (!cleanPath || cleanPath === "#" || cleanPath === "/post") return null;
  if (!cleanPath.startsWith("/post/")) return null;
  return cleanPath;
};

const collectIndexablePaths = (post) => {
  const found = new Set();
  if (!post || !Array.isArray(post.jobs)) return found;

  post.jobs.forEach((job) => {
    if (!job) return;
    const title = (job.title || "").trim();
    if (!title || BLOCKED_TITLES.has(title)) return;

    const candidate = normalizePath(job.link || job.url || post.url || post.link);
    if (!candidate) return;

    found.add(candidate);
  });

  return found;
};

export async function GET() {
  try {
    let posts = [];
    try {
      await connectDB();
      posts = await GovPostList.find({})
        .select("jobs updatedAt createdAt")
        .lean();
    } catch (dbError) {
      console.error("Sitemap DB fetch failed, serving static routes only.", dbError);
      posts = [];
    }

    const urlMap = new Map();

    posts.forEach((post) => {
      const lastmod = formatDate(post.updatedAt) || formatDate(post.createdAt);
      const candidatePaths = collectIndexablePaths(post);

      if (candidatePaths.size < MIN_INDEXABLE_JOBS) return;

      candidatePaths.forEach((path) => {
        const loc = `${SITE_URL}${path}`;
        const existing = urlMap.get(loc);
        if (!existing || (lastmod && (!existing.lastmod || lastmod > existing.lastmod))) {
          urlMap.set(loc, {
            loc,
            lastmod,
            changefreq: "weekly",
            priority: "0.6",
          });
        }
      });
    });

    const now = new Date().toISOString();
    const entries = [
      ...STATIC_ROUTES.map((page) => ({
        loc: `${SITE_URL}${page.path}`,
        changefreq: page.changefreq,
        priority: page.priority,
        lastmod: now,
      })),
      ...BLOG_ROUTES.map((page) => ({
        loc: `${SITE_URL}${page.path}`,
        changefreq: page.changefreq,
        priority: page.priority,
        lastmod: now,
      })),
      ...Array.from(urlMap.values()),
    ];

    const cleanEntries = entries.filter(
      (entry) =>
        entry &&
        typeof entry.loc === "string" &&
        entry.loc.startsWith(SITE_URL) &&
        !entry.loc.includes("undefined"),
    );

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${cleanEntries
      .map(buildUrlEntry)
      .join("")}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Unable to build sitemap", error);
    return new NextResponse("", { status: 500 });
  }
}

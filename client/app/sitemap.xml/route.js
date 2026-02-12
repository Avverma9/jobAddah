import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import Post from "@/lib/models/job";
import { getCleanPostUrl } from "@/lib/job-url";
import { blogPosts } from "@/lib/blog-posts";
import { buildRecruitmentQualityDetail } from "@/lib/recruitment-quality-input";
import { isIndexableRecruitmentPage } from "@/lib/recruitment-quality";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_SITE_URL = "https://jobsaddah.com";
const resolveSiteUrl = () => {
  const raw = String(process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).trim();
  try {
    const parsed = new URL(raw);
    return parsed.origin.replace(/\/$/, "");
  } catch {
    return DEFAULT_SITE_URL;
  }
};

const SITE_URL = resolveSiteUrl();
const SITEMAP_CACHE_CONTROL = "public, max-age=3600, stale-while-revalidate=86400";
const STATIC_ROUTES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/about", priority: "0.7", changefreq: "weekly" },
  { path: "/contact", priority: "0.6", changefreq: "weekly" },
  { path: "/editorial-policy", priority: "0.5", changefreq: "monthly" },
  { path: "/privacy-policy", priority: "0.4", changefreq: "monthly" },
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
const BLOCKED_POST_PATHS = new Set([
  "/post/about-us",
  "/post/privacy-policy",
  "/post/admit-card",
]);
const BLOCKED_TITLES = new Set(["Privacy Policy", "Sarkari Result"]);
const GENERIC_TITLE_PATTERN =
  /^(sarkari result|latest jobs?|job alert|jobs?|results?|notification)$/i;

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

const hasUsefulTitle = (title) => {
  const cleaned = String(title || "").trim();
  if (!cleaned) return false;
  if (cleaned.length < 12) return false;
  if (BLOCKED_TITLES.has(cleaned)) return false;
  if (GENERIC_TITLE_PATTERN.test(cleaned)) return false;
  return true;
};

const normalizePath = (rawUrl) => {
  if (!rawUrl) return null;
  const cleanPath = getCleanPostUrl(String(rawUrl).trim());
  if (!cleanPath || cleanPath === "#" || cleanPath === "/post") return null;
  if (!cleanPath.startsWith("/post/")) return null;
  return cleanPath.replace(/\/+$/, "");
};

const buildIndexablePostEntry = (doc) => {
  if (!doc) return null;
  const detail = buildRecruitmentQualityDetail(doc);
  if (!isIndexableRecruitmentPage(detail)) return null;
  if (!hasUsefulTitle(detail.title)) return null;

  const candidatePath = normalizePath(doc.url || doc.link || doc.sourceUrl || detail.sourceUrl);
  if (!candidatePath) return null;
  if (BLOCKED_POST_PATHS.has(candidatePath.toLowerCase())) return null;

  return {
    loc: `${SITE_URL}${candidatePath}`,
    lastmod: formatDate(doc.updatedAt) || formatDate(doc.createdAt),
    changefreq: "weekly",
    priority: "0.6",
  };
};

const buildBaseEntries = (timestamp) => [
  ...STATIC_ROUTES.map((page) => ({
    loc: `${SITE_URL}${page.path}`,
    changefreq: page.changefreq,
    priority: page.priority,
    lastmod: timestamp,
  })),
  ...BLOG_ROUTES.map((page) => ({
    loc: `${SITE_URL}${page.path}`,
    changefreq: page.changefreq,
    priority: page.priority,
    lastmod: timestamp,
  })),
];

const buildSitemapXml = (entries) => {
  const cleanEntries = entries.filter(
    (entry) =>
      entry &&
      typeof entry.loc === "string" &&
      entry.loc.startsWith(SITE_URL) &&
      !entry.loc.includes("undefined"),
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${cleanEntries
    .map(buildUrlEntry)
    .join("")}
</urlset>`;
};

const createResponse = (xml, fallback = false) =>
  new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": SITEMAP_CACHE_CONTROL,
      ...(fallback ? { "X-Sitemap-Fallback": "1" } : {}),
    },
  });

export async function GET() {
  const timestamp = new Date().toISOString();
  const baseEntries = buildBaseEntries(timestamp);

  try {
    let posts = [];
    try {
      await connectDB();
      posts = await Post.find({})
        .sort({ updatedAt: -1 })
        .select("url link sourceUrl recruitment updatedAt createdAt")
        .lean();
    } catch (dbError) {
      console.error("Sitemap DB fetch failed, serving static routes only.", dbError);
      posts = [];
    }

    const urlMap = new Map();

    posts.forEach((post) => {
      const entry = buildIndexablePostEntry(post);
      if (!entry) return;
      const existing = urlMap.get(entry.loc);
      if (
        !existing ||
        (entry.lastmod && (!existing.lastmod || entry.lastmod > existing.lastmod))
      ) {
        urlMap.set(entry.loc, entry);
      }
    });

    const sitemap = buildSitemapXml([...baseEntries, ...Array.from(urlMap.values())]);
    return createResponse(sitemap);
  } catch (error) {
    console.error("Unable to build sitemap", error);
    const fallbackSitemap = buildSitemapXml(baseEntries);
    return createResponse(fallbackSitemap, true);
  }
}

export function HEAD() {
  return new NextResponse(null, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": SITEMAP_CACHE_CONTROL,
    },
  });
}

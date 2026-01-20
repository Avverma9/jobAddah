import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import GovPostList from "@/lib/models/joblist";
import { getCleanPostUrl } from "@/lib/job-url";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://jobsaddah.com").replace(/\/$/, "");
const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/about", priority: "0.8", changefreq: "weekly" },
  { path: "/contact", priority: "0.8", changefreq: "weekly" },
  { path: "/trending-jobs", priority: "0.7", changefreq: "weekly" },
  { path: "/view-all", priority: "0.7", changefreq: "weekly" },
];
const BLOCKED_TITLES = new Set(["Privacy Policy", "Sarkari Result"]);

const escapeXml = (value) =>
  value
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

export async function GET() {
  try {
    await connectDB();
    const posts = await GovPostList.find({}).lean();
    const urlMap = new Map();

    posts.forEach((post) => {
      const postDate = formatDate(post.updatedAt) || formatDate(post.createdAt);
      (post.jobs || []).forEach((job) => {
        if (!job || !job.link || !job.title) return;
        if (BLOCKED_TITLES.has(job.title)) return;
        const cleanPath = getCleanPostUrl(job.link);
        if (!cleanPath || cleanPath === "#") return;
        const loc = `${SITE_URL}${cleanPath}`;
        const existing = urlMap.get(loc);
        if (!existing || (postDate && (!existing.lastmod || postDate > existing.lastmod))) {
          urlMap.set(loc, {
            loc,
            lastmod: postDate,
            changefreq: "weekly",
            priority: "0.6",
          });
        }
      });
    });

    const entries = [
      ...STATIC_PAGES.map((page) => ({
        loc: `${SITE_URL}${page.path}`,
        changefreq: page.changefreq,
        priority: page.priority,
        lastmod: new Date().toISOString(),
      })),
      ...Array.from(urlMap.values()),
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries
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

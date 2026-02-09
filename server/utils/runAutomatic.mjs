import cron from "node-cron";
import axios from "axios";
import * as cheerio from "cheerio";
import pLimit from "p-limit";
import { URL } from "node:url";

import Section from "../models/govJob/govSection.mjs";
import Site from "../models/govJob/scrapperSite.mjs";
import govPostList from "../models/govJob/govPostListBycatUrl.mjs";
import Post from "../models/govJob/govJob.mjs";

import { sendNewPostsEmail } from "../nodemailer/notify_mailer.mjs";
import { clearNextJsCache } from "./clear-cache.mjs";
import { scrapeJobUrl } from "../controllers/scrapper/govScrapper.mjs";

// -------------------- HTTP (fast + safe) --------------------
const http = axios.create({
  timeout: 20000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (compatible; JobsAddahBot/1.0; +https://jobsaddah.com)",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  },
  maxRedirects: 5,
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchHtml(url, retry = 2) {
  let lastErr = null;
  for (let i = 0; i <= retry; i++) {
    try {
      const res = await http.get(url);
      return res.data;
    } catch (e) {
      lastErr = e;
      await sleep(400 * (i + 1));
    }
  }
  throw lastErr;
}

// -------------------- Helpers --------------------
const cleanText = (text) => {
  if (!text) return "";
  return String(text).replace(/\s+/g, " ").replace(/\n+/g, " ").trim();
};

const ensureProtocol = (inputUrl) => {
  if (!inputUrl) return null;
  let u = inputUrl.trim();
  if (!u.startsWith("http://") && !u.startsWith("https://")) u = "https://" + u;
  return u;
};

const normalizeHost = (host) =>
  String(host || "")
    .toLowerCase()
    .replace(/^www\./, "")
    .trim();

const canonicalizeLink = (url) => {
  if (!url) return null;
  try {
    const u = new URL(url);
    u.hash = "";
    // keep query ONLY if important identifiers exist
    const params = new URLSearchParams(u.search || "");
    const TRACKING_KEYS = new Set([
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "fbclid",
      "gclid",
      "igshid",
      "mc_cid",
      "mc_eid",
      "ref",
      "ref_src",
      "source",
    ]);
    const IMPORTANT_KEYS = new Set(["p", "post", "post_id", "id", "job", "vacancy", "pid"]);

    const keys = [...params.keys()];
    const hasImportant = keys.some((k) => IMPORTANT_KEYS.has(k.toLowerCase()));
    const hasNonTracking = keys.some((k) => !TRACKING_KEYS.has(k.toLowerCase()));

    if (!hasImportant && !hasNonTracking) {
      u.search = "";
    } else if (!hasImportant) {
      for (const k of keys) {
        if (TRACKING_KEYS.has(k.toLowerCase())) params.delete(k);
      }
      const next = params.toString();
      u.search = next ? `?${next}` : "";
    }

    let pathname = u.pathname || "/";
    pathname = pathname.replace(/\/+$/, "");
    if (!pathname) pathname = "/";
    return `${u.protocol}//${normalizeHost(u.host)}${pathname}${u.search}`;
  } catch {
    return url.split("#")[0].trim();
  }
};

// Ignore obvious junk
const IGNORE_TITLE_RE =
  /(category|categories|available now|section|home|contact|privacy|disclaimer|about|sitemap)/i;
const IGNORE_PATH_RE =
  /(\/tag\/|\/author\/|\/page\/\d+\/?$|\/search\/|\/wp-admin\/|\/feed\/?$)/i;

// ✅ post link heuristics (this is IMPORTANT)
const looksLikePostUrl = (fullUrl, baseHost) => {
  try {
    const u = new URL(fullUrl);
    const hostOk = normalizeHost(u.host) === normalizeHost(baseHost);
    if (!hostOk) return false;

    const path = (u.pathname || "").toLowerCase();

    // reject obvious non-post paths
    if (IGNORE_PATH_RE.test(path)) return false;

    // accept patterns:
    // - /2025/02/...
    // - /post/slug
    // - /jobs/slug
    // - /latest-jobs/slug
    // - ?p=123 (WP)
    if (/\/\d{4}\/\d{1,2}\//.test(path)) return true;
    if (/\/post\//.test(path)) return true;
    if (/\/job(s)?\//.test(path)) return true;
    if (/\/vacancy\//.test(path)) return true;
    if (u.search && /(^|[?&])p=\d+/.test(u.search)) return true;

    // generic slug: at least 2 segments and long enough
    const segs = path.split("/").filter(Boolean);
    if (segs.length >= 2 && segs[segs.length - 1].length >= 8) return true;

    return false;
  } catch {
    return false;
  }
};

// -------------------- Pagination discovery (better) --------------------
const discoverPaginationLinks = ($, currentUrl, baseHost) => {
  const found = new Set();
  const selectors =
    "a[rel=next], .nav-links a, .pagination a, .page-numbers a, a.next, a.older-posts, .next a";

  $(selectors).each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    try {
      const full = new URL(href, currentUrl).href;
      const u = new URL(full);

      if (normalizeHost(u.host) !== normalizeHost(baseHost)) return;

      const text = cleanText($(el).text()).toLowerCase();
      const isNextLike =
        $(el).attr("rel") === "next" ||
        /next|older|›|»/.test(text) ||
        /page\/\d+|paged=\d+/i.test(full);

      if (isNextLike) found.add(full);
    } catch {}
  });

  // ALSO detect numeric pagination links (page 2,3...)
  $("a").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const txt = cleanText($(el).text()).trim();
    if (!/^\d+$/.test(txt)) return;

    try {
      const full = new URL(href, currentUrl).href;
      const u = new URL(full);
      if (normalizeHost(u.host) !== normalizeHost(baseHost)) return;

      if (/page\/\d+\/?$/.test(u.pathname) || /[?&]paged=\d+/.test(u.search)) {
        found.add(full);
      }
    } catch {}
  });

  return [...found];
};

// -------------------- Extract jobs from a page (strict) --------------------
const extractJobsFromPage = ($, pageUrl, baseHost) => {
  // prefer article titles & entry headings
  const selectors = [
    "article h1 a",
    "article h2 a",
    "article h3 a",
    ".entry-title a",
    ".post-title a",
    ".post h2 a",
    ".post h3 a",
    "h2 a",
    "h3 a",
  ].join(",");

  const jobs = [];
  const baseCanonical = canonicalizeLink(pageUrl);

  $(selectors).each((_, el) => {
    const rawTitle = cleanText($(el).text());
    const href = $(el).attr("href");
    if (!rawTitle || rawTitle.length < 8 || !href) return;
    if (IGNORE_TITLE_RE.test(rawTitle)) return;

    try {
      const full = new URL(href, pageUrl).href;
      const canonical = canonicalizeLink(full);
      if (!canonical || canonical === baseCanonical) return;

      if (!looksLikePostUrl(full, baseHost)) return;

      jobs.push({
        title: rawTitle, // ✅ raw title (fast)
        link: full,
        canonicalLink: canonical,
      });
    } catch {}
  });

  return jobs;
};

// -------------------- Discover Categories (strong) --------------------
async function tryDiscoverFromSitemap(siteUrl) {
  try {
    const u = new URL(siteUrl);
    const sitemap = `${u.protocol}//${u.host}/sitemap.xml`;
    const xml = await fetchHtml(sitemap, 1);

    // basic extraction (no XML parser needed)
    const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
      .map((m) => m[1])
      .filter(Boolean)
      .slice(0, 2000);

    // keep category-like + main listing pages
    const cat = locs.filter((x) => /\/category\/|\/tag\/|latest|job|vacancy/i.test(x));
    const unique = [...new Map(cat.map((l) => [canonicalizeLink(l), l])).values()];

    return unique.slice(0, 50).map((link) => ({ name: "Auto", link }));
  } catch {
    return [];
  }
}

async function discoverCategoriesFromMenu(siteUrl) {
  const html = await fetchHtml(siteUrl, 1);
  const $ = cheerio.load(html);

  const menuSelectors =
    "nav a, .menu a, ul.navigation a, .nav-menu a, #primary-menu a, .header-menu a, .menubar a";

  const ignore = new Set([
    "Home",
    "Contact Us",
    "Privacy Policy",
    "Disclaimer",
    "More",
    "About Us",
    "Sitemap",
  ]);

  const baseHost = new URL(siteUrl).host;
  const categories = [];

  $(menuSelectors).each((_, el) => {
    const name = cleanText($(el).text());
    const href = $(el).attr("href");
    if (!name || !href || href === "#" || href === "/") return;
    if (ignore.has(name)) return;

    try {
      const full = new URL(href, siteUrl).href;
      const u = new URL(full);
      if (normalizeHost(u.host) !== normalizeHost(baseHost)) return;
      categories.push({ name, link: full });
    } catch {}
  });

  return [...new Map(categories.map((c) => [canonicalizeLink(c.link), c])).values()];
}

// -------------------- Fast DB exists check (bulk) --------------------
async function filterAlreadySavedPosts(jobLinks = []) {
  if (!jobLinks.length) return [];

  const canonicals = jobLinks.map((x) => canonicalizeLink(x)).filter(Boolean);

  const paths = canonicals
    .map((x) => {
      try {
        const u = new URL(x);
        const p = u.pathname.replace(/\/+$/, "") || "/";
        return p;
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  // Pull all existing in 1 query
  const existing = await Post.find({
    $or: [
      { canonicalUrl: { $in: canonicals } },
      { path: { $in: paths } },
      { url: { $in: paths } },
      { sourceUrlFull: { $in: jobLinks } },
      { sourceUrl: { $in: jobLinks } },
    ],
  })
    .select({ canonicalUrl: 1, path: 1, url: 1, sourceUrlFull: 1, sourceUrl: 1 })
    .lean();

  const existsSet = new Set();
  for (const d of existing) {
    if (d.canonicalUrl) existsSet.add(canonicalizeLink(d.canonicalUrl));
    if (d.path) existsSet.add(canonicalizeLink("https://x.com" + d.path)); // marker
    if (d.url) existsSet.add(canonicalizeLink("https://x.com" + d.url)); // marker
    if (d.sourceUrlFull) existsSet.add(canonicalizeLink(d.sourceUrlFull));
    if (d.sourceUrl) existsSet.add(canonicalizeLink(d.sourceUrl));
  }

  return jobLinks.filter((lnk) => {
    const c = canonicalizeLink(lnk);
    if (!c) return false;

    try {
      const u = new URL(c);
      const p = u.pathname.replace(/\/+$/, "") || "/";
      const pKey = canonicalizeLink("https://x.com" + p);
      return !existsSet.has(c) && !existsSet.has(pKey);
    } catch {
      return !existsSet.has(c);
    }
  });
}

// -------------------- Core category scrape --------------------
async function scrapeCategoryInternal(categoryUrl, opts = {}) {
  const doDetailScrape = opts.scrapeDetails !== false;
  const doEmail = opts.sendEmail !== false;

  const maxPages = Math.max(1, Math.min(Number(opts.maxPages || 20), 80)); // ✅ higher
  const concurrency = Math.max(1, Math.min(Number(opts.concurrency || 4), 8)); // safe

  const visited = new Set();
  const queue = [categoryUrl];
  const all = [];

  let baseHost;
  try {
    baseHost = new URL(categoryUrl).host;
  } catch {
    baseHost = null;
  }

  while (queue.length && visited.size < maxPages) {
    const url = queue.shift();
    if (!url || visited.has(url)) continue;
    visited.add(url);

    let html;
    try {
      html = await fetchHtml(url, 2);
    } catch (e) {
      console.error("Page fetch failed:", url, e?.message);
      continue;
    }

    const $ = cheerio.load(html);

    const jobs = extractJobsFromPage($, url, baseHost);
    all.push(...jobs);

    const nextLinks = discoverPaginationLinks($, url, baseHost);
    for (const n of nextLinks) {
      const c = canonicalizeLink(n);
      if (c && !visited.has(c)) queue.push(c);
    }
  }

  const uniqueJobs = [
    ...new Map(all.map((i) => [i.canonicalLink || i.link, i])).values(),
  ];

  const existing = await govPostList.findOne({ url: categoryUrl }).lean();
  const previousJobs = existing && Array.isArray(existing.jobs) ? existing.jobs : [];

  const prevMap = new Map(
    previousJobs.map((j) => [j.canonicalLink || canonicalizeLink(j.link), j]),
  );

  const now = new Date();
  const newJobs = uniqueJobs.filter((u) => !prevMap.has(u.canonicalLink || u.link));

  // merge without wiping on failure
  let mergedJobs = uniqueJobs.map((job) => {
    const key = job.canonicalLink || job.link;
    const prev = prevMap.get(key);
    if (!prev) return { ...job, createdAt: now, updatedAt: now };
    return { ...prev, ...job, updatedAt: now };
  });

  if (!uniqueJobs.length && previousJobs.length) mergedJobs = previousJobs;

  await govPostList.findOneAndUpdate(
    { url: categoryUrl },
    { $set: { url: categoryUrl, jobs: mergedJobs, lastScraped: new Date() } },
    { upsert: true, new: true },
  );

  // ✅ bulk check for truly new vs Post DB
  const candidateLinks = newJobs.map((j) => j.link);
  const dbNewLinks = await filterAlreadySavedPosts(candidateLinks);

  const dbNewJobs = newJobs.filter((j) => dbNewLinks.includes(j.link));

  console.log(
    `Category: ${categoryUrl} pages=${visited.size} extracted=${uniqueJobs.length} newList=${newJobs.length} dbNew=${dbNewJobs.length}`,
  );

  // ✅ scrape details with concurrency
  if (doDetailScrape && dbNewJobs.length) {
    const limit = pLimit(concurrency);
    await Promise.all(
      dbNewJobs.map((job) =>
        limit(async () => {
          try {
            const r = await scrapeJobUrl(job.link);
            if (!r?.success) console.error("Detail scrape failed:", job.link, r?.error);
          } catch (e) {
            console.error("Detail scrape crashed:", job.link, e?.message);
          }
          await sleep(600);
        }),
      ),
    );
  }

  // ✅ email
  if (doEmail && dbNewJobs.length) {
    try {
      const emailJobs = dbNewJobs.map((j) => ({
        ...j,
        link: j.link, // keep original
        canonicalLink: j.canonicalLink || j.link,
        sourceLink: j.link,
      }));

      await sendNewPostsEmail({
        categoryUrl,
        newJobs: emailJobs,
      });
    } catch (e) {
      console.error("Notifier error:", e?.message);
    }
  }

  return { success: true, count: mergedJobs.length, jobs: mergedJobs };
}

// -------------------- Full site sync (better category discovery) --------------------
async function syncCategoriesAndJobs(req, res) {
  const start = Date.now();

  try {
    const siteUrlDocs = await Site.find().sort({ createdAt: -1 }).lean();
    if (!siteUrlDocs?.length) throw new Error("No site URL configured");

    const targetUrl = ensureProtocol(siteUrlDocs[0].url);
    if (!targetUrl) throw new Error("Invalid site URL");

    // 1) sitemap categories
    const sitemapCats = await tryDiscoverFromSitemap(targetUrl);

    // 2) menu categories
    const menuCats = await discoverCategoriesFromMenu(targetUrl);

    // 3) stored categories
    const storedSection = await Section.findOne({ url: targetUrl }).lean();
    const storedCats = Array.isArray(storedSection?.categories) ? storedSection.categories : [];

    let uniqueCategories = [
      ...new Map([...sitemapCats, ...menuCats, ...storedCats].map((i) => [canonicalizeLink(i.link), i])).values(),
    ].filter(Boolean);

    if (!uniqueCategories.length) uniqueCategories = [{ name: "Home", link: targetUrl }];

    await Section.findOneAndUpdate(
      { url: targetUrl },
      { $set: { url: targetUrl, categories: uniqueCategories, lastSynced: new Date() } },
      { upsert: true, new: true },
    );

    let totalJobsFound = 0;
    let successCount = 0;
    let failCount = 0;

    // ✅ category concurrency
    const limit = pLimit(2); // safe
    const results = await Promise.all(
      uniqueCategories.map((cat) =>
        limit(() =>
          scrapeCategoryInternal(cat.link, {
            categoryName: cat.name,
            maxPages: 30, // tune per site
            concurrency: 5,
          }),
        ),
      ),
    );

    for (const r of results) {
      if (r?.success) {
        totalJobsFound += r.count || 0;
        successCount++;
      } else {
        failCount++;
      }
    }

    await clearNextJsCache();

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    const payload = {
      success: true,
      categories: uniqueCategories.length,
      jobs: totalJobsFound,
      successCount,
      failCount,
      duration,
    };

    if (res) return res.json(payload);
    return payload;
  } catch (e) {
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    const payload = { success: false, error: e.message, duration };
    if (res) return res.status(500).json(payload);
    return payload;
  }
}

// -------------------- Single category API --------------------
async function scrapeCategory(req, res) {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "Category URL is required" });

    const result = await scrapeCategoryInternal(url, { maxPages: 30, concurrency: 5 });
    if (result.success) return res.json(result);
    return res.status(500).json(result);
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
}

// -------------------- CRON --------------------
function initCategoryCron() {
  cron.schedule(
    "*/5 * * * *", // ✅ every 5 minutes (1 minute too aggressive)
    async () => {
      const startedAt = new Date();
      console.log(`Cron: syncCategoriesAndJobs started at ${startedAt.toISOString()}`);
      try {
        const result = await syncCategoriesAndJobs();
        const finishedAt = new Date();
        if (result?.success) {
          console.log(
            `Cron: finished ${finishedAt.toISOString()} categories=${result.categories} jobs=${result.jobs} duration=${result.duration}s`,
          );
        } else {
          console.error(
            `Cron: failure ${finishedAt.toISOString()} error=${result?.error} duration=${result?.duration}s`,
          );
        }
      } catch (err) {
        console.error("Cron error:", err?.message || err);
      }
    },
    { scheduled: true, timezone: "Asia/Kolkata" },
  );

  console.log("Cron: category sync scheduled (every 5 minutes, Asia/Kolkata)");
}

export { initCategoryCron, syncCategoriesAndJobs, scrapeCategory, scrapeCategoryInternal };

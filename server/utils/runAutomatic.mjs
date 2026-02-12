import cron from "node-cron";
import axios from "axios";
import { URL } from "node:url";

import Section from "../models/govJob/govSection.mjs";
import Site from "../models/govJob/scrapperSite.mjs";
import govPostList from "../models/govJob/govPostListBycatUrl.mjs";

import { sendNewPostsEmail } from "../nodemailer/notify_mailer.mjs";
import { clearNextJsCache } from "./clear-cache.mjs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

const stripDomainAndReplace = (inputUrl) => {
  if (!inputUrl) return inputUrl;
  try {
    const parsed = new URL(inputUrl);
    let path = parsed.pathname || "/";
    path = path.replace(/\/+$/, "");
    return path || "/";
  } catch {
    return inputUrl;
  }
};

const normalizeTitleKey = (title) => {
  if (!title) return "";
  return cleanText(title)
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const buildJobKey = (job) => {
  if (!job) return "";
  const linkKey =
    job.canonicalLink ||
    (job.link ? canonicalizeLink(job.link) : null) ||
    job.link ||
    "";
  const titleKey = normalizeTitleKey(job.title);
  return `${linkKey}::${titleKey}`;
};

const INTERNAL_API_BASE = (
  process.env.INTERNAL_API_BASE_URL ||
  `http://127.0.0.1:${process.env.PORT || 5000}`
).replace(/\/+$/, "");

const SCRAPE_CATEGORY_API_PATH = "/api/v1/scrapper/scrape-category";

const buildInternalApiUrl = (path) =>
  `${INTERNAL_API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

const normalizeCategoryForSection = (rawCategory, siteUrl) => {
  const linkValue =
    typeof rawCategory === "string" ? rawCategory : rawCategory?.link;
  if (!linkValue) return null;

  try {
    const full = new URL(linkValue, siteUrl).href;
    const parsed = new URL(full);
    if (normalizeHost(parsed.host) !== normalizeHost(new URL(siteUrl).host)) {
      return null;
    }

    const canonical = canonicalizeLink(full);
    if (!canonical) return null;

    const safeName = cleanText(
      typeof rawCategory === "string" ? "" : rawCategory?.name
    );

    return {
      name: safeName || "Auto",
      link: canonical,
    };
  } catch {
    return null;
  }
};

const loadAndCleanupSiteSection = async (siteUrl) => {
  const siteHost = normalizeHost(new URL(siteUrl).host);
  const allSections = await Section.find()
    .sort({ updatedAt: -1, createdAt: -1 })
    .lean();

  const siteSections = allSections.filter((doc) => {
    try {
      const sectionUrl = ensureProtocol(String(doc?.url || ""));
      if (!sectionUrl) return false;
      return normalizeHost(new URL(sectionUrl).host) === siteHost;
    } catch {
      return false;
    }
  });

  if (!siteSections.length) {
    return {
      categories: [],
      removedDuplicateSections: 0,
      sectionId: null,
    };
  }

  const primary = siteSections[0];
  const duplicateIds = siteSections
    .slice(1)
    .map((d) => d?._id)
    .filter(Boolean);

  const categoriesMap = new Map();
  siteSections.forEach((doc) => {
    const categories = Array.isArray(doc?.categories) ? doc.categories : [];
    categories.forEach((category) => {
      const normalized = normalizeCategoryForSection(category, siteUrl);
      if (!normalized) return;
      const key = canonicalizeLink(normalized.link);
      if (!key) return;

      const existing = categoriesMap.get(key);
      if (!existing) {
        categoriesMap.set(key, normalized);
      } else if (existing.name === "Auto" && normalized.name !== "Auto") {
        categoriesMap.set(key, normalized);
      }
    });
  });

  const mergedCategories = [...categoriesMap.values()];

  await Section.updateOne(
    { _id: primary._id },
    {
      $set: {
        url: siteUrl,
        categories: mergedCategories,
        lastSynced: new Date(),
      },
    }
  );

  if (duplicateIds.length) {
    await Section.deleteMany({ _id: { $in: duplicateIds } });
  }

  return {
    categories: mergedCategories,
    removedDuplicateSections: duplicateIds.length,
    sectionId: String(primary._id),
  };
};

const callScrapeCategoryApi = async ({ categoryUrl, categoryName = "", maxPages = 3 }) => {
  const endpoint = buildInternalApiUrl(SCRAPE_CATEGORY_API_PATH);
  try {
    const response = await axios.post(
      endpoint,
      {
        url: categoryUrl,
        name: categoryName,
        maxPages,
      },
      {
        timeout: Number(process.env.SCRAPE_CATEGORY_TIMEOUT_MS || 180000),
      }
    );
    return response.data;
  } catch (error) {
    const details = error?.response?.data?.error || error?.message || "Unknown error";
    throw new Error(`scrape-category API failed for ${categoryUrl}: ${details}`);
  }
};

const sectionFromCategoryUrl = (categoryUrl) => {
  try {
    const parsed = new URL(categoryUrl);
    let path = parsed.pathname || "/";
    path = path.replace(/\/+$/, "");
    return path || "/";
  } catch {
    return "/";
  }
};

const normalizeJobForPostList = (job) => {
  if (!job || typeof job !== "object") return null;
  const title = cleanText(job.title);
  const link = cleanText(job.link);
  if (!title || !link) return null;

  const canonicalLink = canonicalizeLink(job.canonicalLink || link);
  if (!canonicalLink) return null;

  return {
    title,
    link,
    canonicalLink,
    createdAt: job.createdAt ? new Date(job.createdAt) : new Date(),
    updatedAt: new Date(),
  };
};

const persistGovPostList = async ({ categoryUrl, categoryName = "", apiResult }) => {
  const safeCategoryUrl = canonicalizeLink(categoryUrl) || categoryUrl;
  const incomingJobsRaw = Array.isArray(apiResult?.jobs)
    ? apiResult.jobs
    : Array.isArray(apiResult?.newJobs)
      ? apiResult.newJobs
      : [];

  const incomingJobs = incomingJobsRaw
    .map((job) => normalizeJobForPostList(job))
    .filter(Boolean);

  const existing = await govPostList.findOne({ url: safeCategoryUrl }).lean();
  const isNewPostList = !existing;
  const existingJobs = Array.isArray(existing?.jobs) ? existing.jobs : [];
  const existingMap = new Map(
    existingJobs
      .map((job) => normalizeJobForPostList(job))
      .filter(Boolean)
      .map((job) => [buildJobKey(job), job])
  );

  incomingJobs.forEach((job) => {
    const key = buildJobKey(job);
    const prev = existingMap.get(key);
    existingMap.set(key, {
      ...job,
      createdAt: prev?.createdAt || job.createdAt || new Date(),
      updatedAt: new Date(),
    });
  });

  const mergedJobs = [...existingMap.values()];

  const saved = await govPostList.findOneAndUpdate(
    { url: safeCategoryUrl },
    {
      $set: {
        url: safeCategoryUrl,
        section: sectionFromCategoryUrl(safeCategoryUrl),
        categoryName: cleanText(categoryName) || safeCategoryUrl,
        jobs: mergedJobs,
        lastScraped: new Date(),
      },
    },
    { upsert: true, new: true, runValidators: true }
  );

  return { saved, isNewPostList };
};

// -------------------- Core category scrape --------------------
async function scrapeCategoryInternal(categoryUrl, opts = {}) {
  if (!categoryUrl) {
    return { success: false, error: "Category URL is required" };
  }

  const doEmail = opts.sendEmail !== false;
  const categoryName = cleanText(opts.categoryName || "");
  const maxPages = Math.max(1, Math.min(Number(opts.maxPages || 3), 20));

  const apiResult = await callScrapeCategoryApi({
    categoryUrl,
    categoryName,
    maxPages,
  });

  if (!apiResult?.success) {
    return {
      success: false,
      error: apiResult?.error || "scrape-category API returned failure",
    };
  }

  const newJobs = Array.isArray(apiResult.newJobs) ? apiResult.newJobs : [];
  const { saved: savedDoc, isNewPostList } = await persistGovPostList({
    categoryUrl,
    categoryName,
    apiResult,
  });

  if (doEmail && newJobs.length) {
    try {
      const emailJobs = newJobs.map((j) => ({
        ...j,
        link: stripDomainAndReplace(j.link),
        canonicalLink: stripDomainAndReplace(j.canonicalLink || j.link),
        sourceLink: j.link,
      }));

      await sendNewPostsEmail({
        newJobs: emailJobs,
      });
    } catch (e) {
      console.error("Notifier error:", e?.message);
    }
  }

  return {
    success: true,
    categoryUrl,
    categoryName,
    isNewPostList,
    count: savedDoc?.jobs?.length || apiResult?.count || 0,
    totalInDB: savedDoc?.jobs?.length || apiResult?.totalInDB || 0,
    newJobsCount: apiResult?.newJobsCount || newJobs.length,
    jobs: apiResult?.jobs || [],
    newJobs,
    mode: apiResult?.mode,
    speed: apiResult?.speed,
  };
}
// -------------------- Full site sync (better category discovery) --------------------
async function syncCategoriesAndJobs(req, res) {
  const start = Date.now();

  try {
    const siteDoc = await Site.findOne().sort({ createdAt: -1 }).lean();
    if (!siteDoc?.url) throw new Error("No site URL configured");

    const targetUrl = ensureProtocol(siteDoc.url);
    if (!targetUrl) throw new Error("Invalid site URL");

    const sectionInfo = await loadAndCleanupSiteSection(targetUrl);
    const categories = Array.isArray(sectionInfo.categories)
      ? sectionInfo.categories
      : [];

    if (!categories.length) {
      throw new Error(
        "No categories found in Section. Run /api/v1/scrapper/get-categories first."
      );
    }

    const maxPages = Math.max(1, Math.min(Number(process.env.CATEGORY_MAX_PAGES || 3), 20));
    const delayMs = Math.max(100, Math.min(Number(process.env.CATEGORY_STEP_DELAY_MS || 500), 5000));

    let totalNewJobs = 0;
    let totalNewPostLists = 0;
    let totalJobsInDb = 0;
    let successCount = 0;
    let failCount = 0;
    const failures = [];

    const results = [];
    for (const cat of categories) {
      const result = await scrapeCategoryInternal(cat.link, {
        categoryName: cat.name,
        maxPages,
        sendEmail: true,
      });
      results.push(result);
      await sleep(delayMs);
    }

    results.forEach((result, idx) => {
      if (result?.success) {
        successCount += 1;
        totalNewJobs += Number(result.newJobsCount || 0);
        if (result.isNewPostList) totalNewPostLists += 1;
        totalJobsInDb += Number(result.totalInDB || 0);
      } else {
        failCount += 1;
        failures.push({
          category: categories[idx]?.link,
          error: result?.error || "Unknown error",
        });
      }
    });

    const shouldClearCache = totalNewJobs > 0 || totalNewPostLists > 0;
    let cacheCleared = false;
    if (shouldClearCache) {
      const cacheResult = await clearNextJsCache();
      cacheCleared = Boolean(cacheResult?.success);
    }

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    const payload = {
      success: true,
      site: targetUrl,
      categories: categories.length,
      removedDuplicateSections: sectionInfo.removedDuplicateSections || 0,
      newJobs: totalNewJobs,
      newPostLists: totalNewPostLists,
      jobsInDb: totalJobsInDb,
      cacheCleared,
      successCount,
      failCount,
      failures,
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
    const { url, name, maxPages } = req.body;
    if (!url) return res.status(400).json({ error: "Category URL is required" });

    const result = await scrapeCategoryInternal(url, {
      categoryName: name,
      maxPages: Number(maxPages) || 3,
      sendEmail: req.body?.sendEmail !== false,
    });
    if (result.success) return res.json(result);
    return res.status(500).json(result);
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
}

// -------------------- CRON --------------------
function initCategoryCron() {
  cron.schedule(
    "0 */2 * * *",
    async () => {
      const startedAt = new Date();
      console.log(`Cron: syncCategoriesAndJobs started at ${startedAt.toISOString()}`);
      try {
        const result = await syncCategoriesAndJobs();
        const finishedAt = new Date();
        if (result?.success) {
          console.log(
            `Cron: finished ${finishedAt.toISOString()} categories=${result.categories} newJobs=${result.newJobs} jobsInDb=${result.jobsInDb} duration=${result.duration}s`,
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

  console.log("Cron: category sync scheduled (every 2 hours, Asia/Kolkata)");
}

export { initCategoryCron, syncCategoriesAndJobs, scrapeCategory, scrapeCategoryInternal };

import cron from "node-cron";
import axios from "axios";
import * as cheerio from "cheerio";
import { URL } from "node:url";
import Section from "../models/govJob/govSection.mjs";
import Site from "../models/govJob/scrapperSite.mjs";
import govPostList from "../models/govJob/govPostListBycatUrl.mjs";
import { sendNewPostsEmail } from "../nodemailer/notify_mailer.mjs";
import { clearNextJsCache } from "./clear-cache.mjs";
import rephraseTitle from "./rephraser.js";

const cleanText = (text) => {
  if (!text) return "";
  return String(text).replace(/\s+/g, " ").replace(/\n+/g, " ").trim();
};

const canonicalizeLink = (url) => {
  if (!url) return null;
  try {
    const u = new URL(url);
    u.hash = "";
    u.search = "";
    let pathname = u.pathname || "/";
    if (pathname.length > 1 && pathname.endsWith("/")) pathname = pathname.slice(0, -1);
    return `${u.origin}${pathname}`;
  } catch {
    return url.split("#")[0].split("?")[0].trim();
  }
};

const ensureProtocol = (inputUrl) => {
  if (!inputUrl) return null;
  let clean = inputUrl.trim();
  if (!clean.startsWith("http://") && !clean.startsWith("https://")) clean = "https://" + clean;
  return clean;
};

const rewriteToJobsAddahDomain = (inputUrl) => {
  if (!inputUrl) return inputUrl;
  try {
    const u = new URL(inputUrl);
    u.hash = "";
    u.search = "";
    u.protocol = "https:";
    u.hostname = "jobsaddah.com";
    return u.toString();
  } catch {
    return inputUrl;
  }
};

const scrapeCategoryInternal = async (categoryUrl) => {
  try {
    const response = await axios.get(categoryUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const postSelectors =
      ".post-link, .entry-title a, .post h2 a, ul li a, table tr td a, .content a";

    let jobs = [];

    $(postSelectors).each((_, el) => {
      const title = rephraseTitle($(el).text());
      const link = $(el).attr("href");
      if (title && title.length > 10 && link) {
        try {
          const fullLink = new URL(link, categoryUrl).href;
          const canonicalLink = canonicalizeLink(fullLink);
          jobs.push({ title, link: fullLink, canonicalLink });
        } catch {}
      }
    });

    const ignoreTitleRe =
      /(category|categories|available now|section|home|contact|privacy|disclaimer|about)/i;

    jobs = jobs.filter((j) => {
      if (!j || !j.link || !j.title) return false;
      if (ignoreTitleRe.test(j.title)) return false;
      if (canonicalizeLink(j.link) === canonicalizeLink(categoryUrl)) return false;
      return true;
    });

    const uniqueJobs = [
      ...new Map(jobs.map((i) => [i.canonicalLink || i.link, i])).values(),
    ];

    const existing = await govPostList.findOne({ url: categoryUrl });
    const previousJobs = existing && Array.isArray(existing.jobs) ? existing.jobs : [];

    const previousByLink = new Map(
      previousJobs.map((job) => {
        const key = job.canonicalLink || canonicalizeLink(job.link);
        return [key, job];
      })
    );

    const now = new Date();

    const newJobs = uniqueJobs.filter(
      (u) => !previousByLink.has(u.canonicalLink || u.link)
    );

    const mergedJobs = uniqueJobs.map((job) => {
      const key = job.canonicalLink || job.link;
      const prev = previousByLink.get(key);
      if (prev) {
        const titleChanged = job.title && job.title !== prev.title;
        const linkChanged = job.link && prev.link && job.link !== prev.link;

        const stableLink =
          prev.canonicalLink === job.canonicalLink ||
          canonicalizeLink(prev.link) === key
            ? prev.link
            : job.link;

        if (!titleChanged && !linkChanged) return prev;

        return {
          ...prev,
          ...job,
          link: stableLink,
          createdAt: prev.createdAt || now,
          updatedAt: now,
        };
      }
      return { ...job, createdAt: now, updatedAt: now };
    });

    await govPostList.findOneAndUpdate(
      { url: categoryUrl },
      { $set: { url: categoryUrl, jobs: mergedJobs, lastScraped: new Date() } },
      { upsert: true, new: true }
    );

    if (newJobs.length > 0) {
      try {
        const emailCategoryUrl = rewriteToJobsAddahDomain(categoryUrl);

        const emailJobs = newJobs.map((j) => ({
          ...j,
          link: rewriteToJobsAddahDomain(j.link),
          canonicalLink: rewriteToJobsAddahDomain(j.canonicalLink || j.link),
          sourceLink: j.link,
        }));

        const info = await sendNewPostsEmail({
          categoryUrl: emailCategoryUrl,
          newJobs: emailJobs,
        });

        console.log(
          `Notifier: Sent ${newJobs.length} new job(s) for ${categoryUrl} - messageId=${info && info.messageId}`
        );
      } catch (err) {
        console.error("Notifier: Error sending new posts email:", err);
      }
    }

    return { success: true, count: mergedJobs.length, jobs: mergedJobs };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const syncCategoriesAndJobs = async () => {
  const startTime = Date.now();

  try {
    const siteUrl = await Site.find();
    if (!siteUrl || siteUrl.length === 0) throw new Error("No site URL configured");

    const targetUrl = ensureProtocol(siteUrl[0].url);
    if (!targetUrl) throw new Error("Invalid site URL");

    const response = await axios.get(targetUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    let categories = [];

    const menuSelectors =
      "nav a, .menu a, ul.navigation a, .nav-menu a, #primary-menu a, .header-menu a, .menubar a";

    $(menuSelectors).each((_, el) => {
      const name = cleanText($(el).text());
      const href = $(el).attr("href");
      if (!name || !href || href === "#" || href === "/") return;

      try {
        const fullLink = new URL(href, targetUrl).href;
        const ignore = [
          "Home",
          "Contact Us",
          "Privacy Policy",
          "Disclaimer",
          "More",
          "About Us",
          "Sitemap",
        ];
        if (!ignore.includes(name)) categories.push({ name, link: fullLink });
      } catch {}
    });

    const uniqueCategories = [
      ...new Map(categories.map((i) => [i.link, i])).values(),
    ];

    await Section.findOneAndUpdate(
      { url: targetUrl },
      { $set: { url: targetUrl, categories: uniqueCategories, lastSynced: new Date() } },
      { upsert: true, new: true }
    );

    let totalJobsFound = 0;
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < uniqueCategories.length; i++) {
      const category = uniqueCategories[i];
      const result = await scrapeCategoryInternal(category.link);

      if (result.success) {
        totalJobsFound += result.count;
        successCount++;
      } else {
        failCount++;
      }

      if (i < uniqueCategories.length - 1) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    await clearNextJsCache();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    return {
      success: true,
      categories: uniqueCategories.length,
      jobs: totalJobsFound,
      successCount,
      failCount,
      duration,
    };
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error("syncCategoriesAndJobs error:", error?.message, error);
    return { success: false, error: error.message, duration };
  }
};

const scrapeCategory = async (req, res) => {
  try {
    const { url: categoryUrl } = req.body;
    if (!categoryUrl) return res.status(400).json({ error: "Category URL is required" });

    const result = await scrapeCategoryInternal(categoryUrl);
    if (result.success) return res.json(result);

    return res.status(500).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const initCategoryCron = () => {
  cron.schedule(
    "*/10 * * * *",
    async () => {
      const startedAt = new Date();
      console.log(`Cron: syncCategoriesAndJobs started at ${startedAt.toISOString()}`);
      try {
        const result = await syncCategoriesAndJobs();
        const finishedAt = new Date();
        if (result && result.success) {
          console.log(
            `Cron: syncCategoriesAndJobs finished at ${finishedAt.toISOString()} result: success categories=${result.categories} jobs=${result.jobs} duration=${result.duration}s`
          );
        } else {
          console.error(
            `Cron: syncCategoriesAndJobs finished at ${finishedAt.toISOString()} result: failure error=${result?.error} duration=${result?.duration}s`
          );
        }
      } catch (err) {
        console.error("Cron: syncCategoriesAndJobs error:", err);
      }
    },
    { scheduled: true, timezone: "Asia/Kolkata" }
  );

  console.log("Cron: category sync scheduled (every 10 minutes, Asia/Kolkata)");
};

export { initCategoryCron, syncCategoriesAndJobs, scrapeCategory, scrapeCategoryInternal };

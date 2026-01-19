import cron from "node-cron";
import axios from "axios";
import * as cheerio from "cheerio";
import { URL } from "node:url";
import Section from "../models/govJob/govSection.mjs";
import Site from "../models/govJob/scrapperSite.mjs";
import govPostList from "../models/govJob/govPostListBycatUrl.mjs";
import { sendNewPostsEmail } from "../nodemailer/notify_mailer.mjs";
import { clearNextJsCache } from "./clear-cache.mjs";

const cleanText = (text) => {
  if (!text) return "";
  return text.replace(/\s+/g, " ").replace(/\n+/g, " ").trim();
};

const ensureProtocol = (inputUrl) => {
  if (!inputUrl) return null;
  let clean = inputUrl.trim();
  if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
    clean = "https://" + clean;
  }
  return clean;
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
      const title = cleanText($(el).text());
      const link = $(el).attr("href");
      if (title && title.length > 10 && link) {
        try {
          const fullLink = new URL(link, categoryUrl).href;
          jobs.push({ title, link: fullLink });
        } catch {}
      }
    });

    const uniqueJobs = [...new Map(jobs.map((i) => [i.link, i])).values()];

    // fetch previous jobs to detect new posts
    const existing = await govPostList.findOne({ url: categoryUrl });
    const previousJobs = (existing && Array.isArray(existing.jobs)) ? existing.jobs : [];

    // determine which jobs are new (by link)
    const newJobs = uniqueJobs.filter(
      (u) => !previousJobs.some((p) => p.link === u.link)
    );

    await govPostList.findOneAndUpdate(
      { url: categoryUrl },
      { $set: { url: categoryUrl, jobs: uniqueJobs, lastScraped: new Date() } },
      { upsert: true, new: true }
    );

    // send notification if there are new jobs
    if (newJobs.length > 0) {
      try {
        const info = await sendNewPostsEmail({ categoryUrl, newJobs });
        console.log(
          `Notifier: Sent ${newJobs.length} new job(s) for ${categoryUrl} - messageId=${info && info.messageId}`
        );
      } catch (err) {
        console.error("Notifier: Error sending new posts email:", err);
      }
    }

    return { success: true, count: uniqueJobs.length, jobs: uniqueJobs };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const syncCategoriesAndJobs = async () => {
  const startTime = Date.now();
  const timestamp = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });

  try {
    const siteUrl = await Site.find();
    if (!siteUrl || siteUrl.length === 0) {
      throw new Error("No site URL configured");
    }

    const targetUrl = ensureProtocol(siteUrl[0].url);
    if (!targetUrl) {
      throw new Error("Invalid site URL");
    }

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
        if (!ignore.includes(name)) {
          categories.push({ name, link: fullLink });
        }
      } catch {}
    });

    const uniqueCategories = [
      ...new Map(categories.map((i) => [i.link, i])).values(),
    ];

    await Section.findOneAndUpdate(
      { url: targetUrl },
      {
        $set: {
          url: targetUrl,
          categories: uniqueCategories,
          lastSynced: new Date(),
        },
      },
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
    return { success: false, error: error.message, duration };
  }
};

const scrapeCategory = async (req, res) => {
  try {
    const { url: categoryUrl } = req.body;
    if (!categoryUrl) {
      return res.status(400).json({ error: "Category URL is required" });
    }

    const result = await scrapeCategoryInternal(categoryUrl);

    if (result.success) {
      return res.json(result);
    }

    return res.status(500).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const initCategoryCron = () => {
  // schedule to run at minute 0 of every hour (Asia/Kolkata)
  cron.schedule(
    "0 * * * *",
    async () => {
      const startedAt = new Date();
      console.log(`Cron: syncCategoriesAndJobs started at ${startedAt.toISOString()}`);
      try {
        const result = await syncCategoriesAndJobs();
        console.log(
          `Cron: syncCategoriesAndJobs finished at ${new Date().toISOString()} result: ${
            result && result.success ? "success" : "failure"
          }`
        );
      } catch (err) {
        console.error("Cron: syncCategoriesAndJobs error:", err);
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata",
    }
  );
  console.log("Cron: category sync scheduled (hourly, Asia/Kolkata)");
};

export {
  initCategoryCron,
  syncCategoriesAndJobs,
  scrapeCategory,
  scrapeCategoryInternal,
};

const cron = require("node-cron");
const axios = require("axios");
const cheerio = require("cheerio");
const url = require("url");
const Section = require("@/models/gov/section");
const Site = require("@/models/gov/scrapperSite");
const govPostList = require("@/models/gov/postList");
const { clearNextJsCache } = require("@/utils/clear-cache");

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

// Scrape single category
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
          const fullLink = new url.URL(link, categoryUrl).href;
          jobs.push({ title, link: fullLink });
        } catch (err) {
          // Skip invalid URLs silently
        }
      }
    });

    const uniqueJobs = [...new Map(jobs.map((i) => [i.link, i])).values()];

    await govPostList.findOneAndUpdate(
      { url: categoryUrl },
      { $set: { url: categoryUrl, jobs: uniqueJobs, lastScraped: new Date() } },
      { upsert: true, new: true }
    );

    return { success: true, count: uniqueJobs.length, jobs: uniqueJobs };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Main sync function
const syncCategoriesAndJobs = async () => {
  const startTime = Date.now();
  const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  try {
    console.log(`[${timestamp}] Sync started`);

    // Get site URL
    const siteUrl = await Site.find();
    if (!siteUrl || siteUrl.length === 0) {
      throw new Error("No site URL configured");
    }

    const targetUrl = ensureProtocol(siteUrl[0].url);
    if (!targetUrl) {
      throw new Error("Invalid site URL");
    }

    // Scrape categories
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
        const fullLink = new url.URL(href, targetUrl).href;
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
      } catch (err) {
        // Skip invalid links
      }
    });

    const uniqueCategories = [
      ...new Map(categories.map((i) => [i.link, i])).values(),
    ];

    // Save categories
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

    // Scrape jobs from all categories
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

      // Delay to avoid rate limiting
      if (i < uniqueCategories.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Clear Next.js cache
    await clearNextJsCache();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(
      `[${timestamp}] ✅ Sync completed in ${duration}s | Categories: ${uniqueCategories.length} | Jobs: ${totalJobsFound} | Success: ${successCount} | Failed: ${failCount}`
    );

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
    console.error(`[${timestamp}] ❌ Sync failed after ${duration}s:`, error.message);
    return { success: false, error: error.message };
  }
};

// Express route for manual trigger
const scrapeCategory = async (req, res) => {
  try {
    const categoryUrl = req.body.url;
    if (!categoryUrl) {
      return res.status(400).json({ error: "Category URL is required" });
    }

    const result = await scrapeCategoryInternal(categoryUrl);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Initialize cron - runs every hour at :00 minutes
const initCategoryCron = () => {
  // Schedule: Every hour at :00 minutes (12:00, 1:00, 2:00, etc.)
  cron.schedule(
    "0 * * * *",
    async () => {
      await syncCategoriesAndJobs();
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata",
    }
  );

  const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  console.log(`✅ Cron initialized at ${now}`);
  console.log("⏰ Schedule: Every hour at :00 minutes");
  console.log("🌏 Timezone: Asia/Kolkata (IST)");
};

module.exports = {
  initCategoryCron,
  syncCategoriesAndJobs,
  scrapeCategory,
  scrapeCategoryInternal,
};

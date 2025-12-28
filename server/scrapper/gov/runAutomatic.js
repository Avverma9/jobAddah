const cron = require("node-cron");
const axios = require("axios");
const cheerio = require("cheerio");
const url = require("url");
const Section = require("@/models/gov/section");
const Site = require("@/models/gov/scrapperSite");
const govPostList = require("@/models/gov/postList");

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

// Internal function to scrape a single category (no req/res)
const scrapeCategoryInternal = async (categoryUrl) => {
  try {
    console.log(`[SCRAPE] Scraping category: ${categoryUrl}`);
    
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
          console.warn(`[SCRAPE] Invalid URL: ${link}`);
        }
      }
    });

    const uniqueJobs = [...new Map(jobs.map((i) => [i.link, i])).values()];

    await govPostList.findOneAndUpdate(
      { url: categoryUrl },
      { $set: { url: categoryUrl, jobs: uniqueJobs, lastScraped: new Date() } },
      { upsert: true, new: true }
    );

    console.log(`[SCRAPE] ✅ Found ${uniqueJobs.length} jobs in category`);
    return { success: true, count: uniqueJobs.length, jobs: uniqueJobs };
  } catch (error) {
    console.error(`[SCRAPE] ❌ Error scraping ${categoryUrl}:`, error.message);
    return { success: false, error: error.message };
  }
};

// Combined sync: Categories + Jobs
const syncCategoriesAndJobs = async () => {
  try {
    console.log(`\n========================================`);
    console.log(`[CRON] Starting full sync at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
    console.log(`========================================\n`);
    
    // Step 1: Get site URL
    const siteUrl = await Site.find();
    if (!siteUrl || siteUrl.length === 0) {
      console.error("[CRON] No site URL configured");
      return;
    }

    const rawUrl = siteUrl[0].url;
    const targetUrl = ensureProtocol(rawUrl);
    
    if (!targetUrl) {
      console.error("[CRON] Invalid URL");
      return;
    }

    // Step 2: Scrape categories from main site
    console.log(`[STEP 1] Fetching categories from: ${targetUrl}`);
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
        console.warn(`[STEP 1] Invalid category link: ${href}`);
      }
    });

    const uniqueCategories = [
      ...new Map(categories.map((i) => [i.link, i])).values(),
    ];

    // Save categories to database
    await Section.findOneAndUpdate(
      { url: targetUrl },
      { $set: { url: targetUrl, categories: uniqueCategories, lastSynced: new Date() } },
      { upsert: true, new: true }
    );

    console.log(`[STEP 1] ✅ Found ${uniqueCategories.length} categories\n`);

    // Step 3: Scrape jobs from each category sequentially
    console.log(`[STEP 2] Starting to scrape jobs from all categories...`);
    
    let totalJobsFound = 0;
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < uniqueCategories.length; i++) {
      const category = uniqueCategories[i];
      console.log(`\n[${i + 1}/${uniqueCategories.length}] Category: ${category.name}`);
      
      const result = await scrapeCategoryInternal(category.link);
      
      if (result.success) {
        totalJobsFound += result.count;
        successCount++;
      } else {
        failCount++;
      }

      // Add delay between requests to avoid rate limiting
      if (i < uniqueCategories.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      }
    }

    console.log(`\n========================================`);
    console.log(`[CRON] ✅ Full sync completed!`);
    console.log(`Categories: ${uniqueCategories.length}`);
    console.log(`Jobs found: ${totalJobsFound}`);
    console.log(`Success: ${successCount} | Failed: ${failCount}`);
    console.log(`========================================\n`);

  } catch (error) {
    console.error("[CRON] ❌ Critical Error:", error.message);
  }
};

// Express route handler for manual trigger
const scrapeCategory = async (req, res) => {
  try {
    const categoryUrl = req.body.url;
    if (!categoryUrl)
      return res.status(400).json({ error: "Category URL is required" });

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

// Schedule combined job: Every 30 minutes
const initCategoryCron = () => {
  // Run immediately on startup
  console.log("🚀 Starting initial sync...");
  syncCategoriesAndJobs();

  // Then schedule for every 30 minutes
  cron.schedule('*/30 * * * *', syncCategoriesAndJobs, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });

  console.log("✅ Combined cron initialized - running every 30 minutes");
  console.log("📋 Tasks: 1) Sync categories 2) Scrape all category jobs");
};

module.exports = { 
  initCategoryCron, 
  syncCategoriesAndJobs,
  scrapeCategory, // For manual API calls
  scrapeCategoryInternal // For internal use
};

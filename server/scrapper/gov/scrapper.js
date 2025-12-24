const axios = require("axios");
const cheerio = require("cheerio");
const url = require("url");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Post = require("@/models/gov/govtpost");
const govPostList = require("@/models/gov/postList");
const Section = require("@/models/gov/section");
const GeminiModel = require("@/models/ai/gemini-model");
const ApiKey = require("@/models/ai/ai-apiKey");
const Site = require("@/models/gov/scrapperSite");

// ============================================================================
// 1. HELPER FUNCTIONS
// ============================================================================

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

// Simple Jaccard Similarity for strings (Faster than Levenshtein for long text)
const calculateSimilarity = (str1, str2) => {
  const set1 = new Set(str1.toLowerCase().split(/\s+/));
  const set2 = new Set(str2.toLowerCase().split(/\s+/));
  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return (intersection.size / union.size) * 100;
};

// ============================================================================
// 2. AI FORMATTING
// ============================================================================

const formatWithAI = async (scrapedData) => {
  try {
    // Fetch Model and Key in Parallel for speed
    const [modelNameData, apiKeyData] = await Promise.all([
      GeminiModel.findOne().sort({ createdAt: -1 }).lean(),
      ApiKey.findOne({}).sort({ createdAt: -1 }).lean(),
    ]);

    if (!modelNameData) throw new Error("No Gemini model configured");
    if (!apiKeyData) throw new Error("No API key configured");

    const genAI = new GoogleGenerativeAI(apiKeyData.apiKey);
    const model = genAI.getGenerativeModel({
      model: modelNameData.modelName,
      generationConfig: { responseMimeType: "application/json" },
    });

    // Minimized Prompt to save tokens and latency while keeping rules
    const prompt = `
      You are a data formatting assistant. Convert scraped data to JSON.
      RULES:
      1. Valid JSON only. Top-level key: "recruitment".
      2. REPHRASE "title" 100% uniquely. NO PLAGIARISM.
      3. Map fields intelligently based on keywords (e.g., "last date" -> applicationLastDate).
      4. Remove WhatsApp links.
      5. Output Structure:
      {
        "recruitment": {
          "title": "String",
          "organization": { "name": "", "shortName": "", "website": "", "officialWebsite": "" },
          "importantDates": { "notificationDate": "", "applicationStartDate": "", "applicationLastDate": "", "examDate": "", "admitCardDate": "", "resultDate": "" },
          "vacancyDetails": { "totalPosts": 0, "positions": [] },
          "applicationFee": {},
          "ageLimit": {},
          "eligibility": {},
          "selectionProcess": [],
          "importantLinks": {},
          "districtWiseData": []
        }
      }
      Scraped Data:
      ${JSON.stringify(scrapedData).substring(0, 15000)} 
    `; 
    // Truncated input to prevent token limits (15k chars is usually enough for context)

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
  } catch (error) {
    console.error("AI Formatting Error:", error.message);
    return null;
  }
};

// ============================================================================
// 3. MAIN SCRAPPER CONTROLLER
// ============================================================================

const scrapper = async (req, res) => {
  try {
    let jobUrl = req.body.url;
    if (!jobUrl) return res.status(400).json({ error: "URL is required" });

    // Handle relative URLs
    if (jobUrl.startsWith('/')) {
      const siteConfig = await Site.findOne().sort({ createdAt: -1 }).lean();
      if (!siteConfig?.url) return res.status(500).json({ error: "Base site URL missing" });
      const baseUrl = siteConfig.url.endsWith('/') ? siteConfig.url.slice(0, -1) : siteConfig.url;
      jobUrl = baseUrl + jobUrl;
    }

    const response = await axios.get(jobUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 20000,
    });

    const $ = cheerio.load(response.data);
    
    // Extract Text Content Efficiently
    const extractText = (selector) => {
      const items = [];
      $(selector).each((i, el) => {
        const text = cleanText($(el).text());
        if (text) items.push({ text, index: i });
      });
      return items;
    };

    const scrapedData = {
      url: jobUrl,
      title: $("title").text().trim(),
      headings: {
        h1: extractText("h1"),
        h2: extractText("h2"),
        h3: extractText("h3"),
      },
      links: [],
      tables: [],
      allText: extractText("body *").slice(0, 50), // Limit generic text to avoid noise
    };

    // Optimize Link Extraction
    $("a").each((i, el) => {
      const href = $(el).attr("href");
      const text = cleanText($(el).text());
      if (href && (text.includes("Apply") || text.includes("Download") || text.includes("Notification"))) {
         try {
           scrapedData.links.push({
             text,
             href: new url.URL(href, jobUrl).href
           });
         } catch(e) {}
      }
    });

    // Optimize Table Extraction (Only extract text, ignore complex HTML for AI)
    $("table").each((i, table) => {
      const rows = [];
      $(table).find("tr").each((_, row) => {
        const cells = $(row).find("td, th").map((_, c) => cleanText($(c).text())).get();
        if (cells.length) rows.push(cells);
      });
      if (rows.length) scrapedData.tables.push({ rows });
    });

    // --- AI Processing ---
    const formattedData = await formatWithAI(scrapedData);
    if (!formattedData) return res.status(500).json({ success: false, error: "AI failed" });

    // --- Clean URL & Save ---
    let cleanUrl = jobUrl;
    try {
      const parsed = new URL(jobUrl);
      cleanUrl = parsed.pathname;
    } catch (e) {}

    formattedData.url = cleanUrl;

    const savedPost = await Post.findOneAndUpdate(
      { url: cleanUrl },
      { $set: formattedData },
      { upsert: true, new: true, lean: true }
    );

    res.json({ success: true, formatted: savedPost });

  } catch (error) {
    console.error("Scraper Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================================
// 4. CATEGORY & SECTION CONTROLLERS
// ============================================================================

const getCategories = async (req, res) => {
  try {
    const siteUrlDoc = await Site.findOne().lean();
    if (!siteUrlDoc) return res.status(400).json({ error: "Site not configured" });

    const targetUrl = ensureProtocol(siteUrlDoc.url);
    const response = await axios.get(targetUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const categories = new Map(); // Use Map for uniqueness
    
    const ignore = new Set(["Home", "Contact Us", "Privacy Policy", "Disclaimer", "More", "About Us", "Sitemap"]);
    const menuSelectors = "nav a, .menu a, ul.navigation a, .nav-menu a, #primary-menu a, .header-menu a, .menubar a";

    $(menuSelectors).each((_, el) => {
      const name = cleanText($(el).text());
      const href = $(el).attr("href");
      
      if (name && href && !ignore.has(name) && href !== "#" && href !== "/") {
        try {
          const fullLink = new url.URL(href, targetUrl).href;
          if (!categories.has(fullLink)) {
            categories.set(fullLink, { name, link: fullLink });
          }
        } catch(e) {}
      }
    });

    const uniqueCategories = Array.from(categories.values());

    await Section.findOneAndUpdate(
      { url: targetUrl },
      { $set: { url: targetUrl, categories: uniqueCategories } },
      { upsert: true, new: true }
    );

    res.json({ success: true, count: uniqueCategories.length, categories: uniqueCategories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const scrapeCategory = async (req, res) => {
  try {
    const categoryUrl = req.body.url;
    if (!categoryUrl) return res.status(400).json({ error: "Category URL required" });

    const response = await axios.get(categoryUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    const $ = cheerio.load(response.data);
    
    const jobsMap = new Map();
    const postSelectors = ".post-link, .entry-title a, .post h2 a, ul li a, table tr td a, .content a";

    $(postSelectors).each((_, el) => {
      const title = cleanText($(el).text());
      const link = $(el).attr("href");
      if (title && title.length > 10 && link) {
        try {
          const fullLink = new url.URL(link, categoryUrl).href;
          if (!jobsMap.has(fullLink)) {
            jobsMap.set(fullLink, { title, link: fullLink });
          }
        } catch(e) {}
      }
    });

    const uniqueJobs = Array.from(jobsMap.values());

    await govPostList.findOneAndUpdate(
      { url: categoryUrl },
      { $set: { url: categoryUrl, jobs: uniqueJobs } },
      { upsert: true, new: true }
    );

    res.json({ success: true, count: uniqueJobs.length, jobs: uniqueJobs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// 5. DUPLICATE MANAGEMENT (OPTIMIZED O(N) Complexity)
// ============================================================================

const findDuplicatesOptimized = async () => {
  // Fetch only necessary fields, sorted by date
  const allPosts = await Post.find({}, { _id: 1, url: 1, 'recruitment.title': 1, createdAt: 1 })
    .sort({ createdAt: 1 }) // Oldest first
    .lean();

  const toDelete = [];
  const seenTitles = new Map(); // Store normalized title -> post

  // Normalize string for fuzzy matching
  const normalize = (str) => (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");

  for (const post of allPosts) {
    const title = post.recruitment?.title || post.url;
    const normTitle = normalize(title);
    
    if (!normTitle || normTitle.length < 5) continue;

    if (seenTitles.has(normTitle)) {
      // Duplicate found! 
      // Since we sorted by createdAt ASC, the one in map is older.
      // BUT logic usually is: Keep the NEWEST, delete the OLDER.
      // Wait, 'allPosts' loop goes Old -> New.
      // So 'seenTitles' has the OLDER one. 'post' is the NEWER one.
      
      const existingOldPost = seenTitles.get(normTitle);
      
      // We mark the OLDER one for deletion, and update map with NEWER one
      toDelete.push({
        deleteId: existingOldPost._id,
        keepId: post._id,
        title: title
      });

      // Update map to keep the newest version as the reference for future duplicates
      seenTitles.set(normTitle, post); 
    } else {
      seenTitles.set(normTitle, post);
    }
  }
  return toDelete;
};

const deleteDuplicates = async (req, res) => {
  try {
    const duplicates = await findDuplicatesOptimized();

    if (duplicates.length === 0) {
      return res.json({ success: true, message: "No duplicates found" });
    }

    const idsToDelete = duplicates.map(d => d.deleteId);
    
    // Batch Delete (Much faster than loop)
    const result = await Post.deleteMany({ _id: { $in: idsToDelete } });

    res.json({
      success: true,
      duplicatesFound: duplicates.length,
      duplicatesDeleted: result.deletedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const analyzeDuplicates = async (req, res) => {
  try {
    const duplicates = await findDuplicatesOptimized();
    
    res.json({
      success: true,
      count: duplicates.length,
      analysis: duplicates.slice(0, 100), // Return top 100 to avoid huge payload
      info: "Dry-run only. Use /delete-duplicates to remove.",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  scrapper,
  getCategories,
  scrapeCategory,
  deleteDuplicates,
  analyzeDuplicates,
};

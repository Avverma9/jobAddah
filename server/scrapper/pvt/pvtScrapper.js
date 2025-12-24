const axios = require("axios");
const cheerio = require("cheerio");
const url = require("url");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const ApiKey = require("@/models/ai/ai-apiKey");
const GeminiModel = require("@/models/ai/gemini-model");
const PvtSection = require("@/models/pvt/pvtSection");
const pvtPostlist = require("@/models/pvt/pvtPostlist");
const PvtPost = require("@/models/pvt/pvtPost");

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

// Normalize string for fuzzy matching (removes special chars, lowercase)
const normalizeTitle = (str) => (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");

// ============================================================================
// 2. AI FORMATTING ENGINE
// ============================================================================

const formatWithAI = async (scrapedData) => {
  try {
    // 1. Fetch Config in Parallel (Faster)
    const [modelNameData, apiKeyData] = await Promise.all([
      GeminiModel.findOne().sort({ createdAt: -1 }).lean(),
      ApiKey.findOne({}).sort({ createdAt: -1 }).lean(),
    ]);

    if (!modelNameData) throw new Error("No Gemini model configured");

    let effectiveKey = process.env.GEMINI_API_KEY;
    if (!effectiveKey) {
      if (!apiKeyData) throw new Error("No API key configured");
      effectiveKey = apiKeyData.apiKey;
    }

    const genAI = new GoogleGenerativeAI(effectiveKey);
    const model = genAI.getGenerativeModel({
      model: modelNameData.modelName,
      generationConfig: { responseMimeType: "application/json" },
    });

    // 2. Optimized Prompt (Shorter token count, same strictness)
    const prompt = `
      EXTRACT JSON JOB DATA. RULES:
      1. Valid JSON only. No markdown.
      2. No missing data assumptions. Use null.
      3. Dates ISO YYYY-MM-DD.
      4. Output Structure:
      {
        "sourceUrl": "${scrapedData.url}",
        "title": "String",
        "company": { "name": "String", "officialSite": "String|null" },
        "location": "String|null",
        "designation": "String|null",
        "employmentType": "String|null",
        "openings": Number|null,
        "qualification": { "level": "String", "branches": ["String"], "passoutYear": Number|null },
        "ageLimit": { "min": Number|null, "max": Number|null },
        "experience": "String|null",
        "stipend": { "amount": Number|null, "currency": "INR", "period": "String|null" },
        "benefits": ["String"],
        "applyLinks": { "register": "String|null", "notification": "String|null" },
        "closingDate": "String|null",
        "isActive": true,
        "scrapedAt": "${new Date().toISOString()}"
      }
      CONTENT:
      ${JSON.stringify(scrapedData).substring(0, 15000)}
    `;

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
// 3. MAIN SCRAPER
// ============================================================================

const scrapper = async (req, res) => {
  try {
    const jobUrl = req.body.url;
    if (!jobUrl) return res.status(400).json({ error: "URL is required" });

    const response = await axios.get(jobUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      timeout: 20000,
    });

    const $ = cheerio.load(response.data);

    // Optimized Extraction: Limit DOM traversal
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
      },
      // Only extract main content text to reduce payload size
      allText: extractText("main *, article *, .content *").slice(0, 50),
      links: [],
    };

    // Smart Link Extraction: Only grab likely "Apply" links
    $("a").each((i, el) => {
      const href = $(el).attr("href");
      const text = cleanText($(el).text());
      if (href && (text.match(/apply|register|notification|download/i))) {
        try {
          scrapedData.links.push({
            text,
            href: new url.URL(href, jobUrl).href
          });
        } catch (e) {}
      }
    });

    const formattedData = await formatWithAI(scrapedData);

    if (!formattedData) {
      return res.status(500).json({ success: false, error: "AI failed to format" });
    }

    // URL Normalization
    let cleanUrl = jobUrl;
    try {
      const parsed = new URL(jobUrl);
      cleanUrl = parsed.pathname;
    } catch (err) {}
    
    formattedData.url = cleanUrl;
    formattedData.sourceUrl = jobUrl;

    await PvtPost.findOneAndUpdate(
      { url: cleanUrl },
      { $set: formattedData },
      { upsert: true, new: true, lean: true }
    );

    res.json({ success: true, formatted: formattedData });
  } catch (error) {
    console.error("Scraper Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================================
// 4. CATEGORY & SECTION SCRAPERS
// ============================================================================

const getCategories = async (req, res) => {
  try {
    const targetUrl = "https://pvtjob.in"; // Hardcoded or fetch from config
    const response = await axios.get(targetUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const categories = new Map();

    const ignore = new Set(["Home", "Contact Us", "Privacy Policy", "Disclaimer", "More", "About Us", "Sitemap", "Web Stories", "Terms and Conditions"]);
    const menuSelectors = "nav a, .menu a, ul.navigation a, .nav-menu a, #primary-menu a";

    $(menuSelectors).each((_, el) => {
      const name = cleanText($(el).text());
      const href = $(el).attr("href");
      
      if (name && href && !ignore.has(name) && !href.includes("web-stories")) {
        try {
          const fullLink = new url.URL(href, targetUrl).href;
          if (!categories.has(fullLink)) {
            categories.set(fullLink, { name, link: fullLink });
          }
        } catch(e) {}
      }
    });

    const uniqueCategories = Array.from(categories.values());

    await PvtSection.findOneAndUpdate(
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
    // Broad selectors to catch standard links
    const mainContent = $("main, article, .content, .posts, .container, #primary");
    const ignoreSelectors = "nav, footer, .menu, .sidebar, .header, .widget";

    mainContent.find("a").each((_, el) => {
      // 1. Skip if inside ignored areas
      if ($(el).closest(ignoreSelectors).length > 0) return;

      // 2. Extract Text Strategy
      let title = cleanText($(el).text());
      const link = $(el).attr("href");

      // 3. Fallback: If text is empty (e.g. image link), check inner image alt/title
      if (!title) {
        const innerImg = $(el).find("img");
        if (innerImg.length > 0) {
          title = cleanText(innerImg.attr("title")) || cleanText(innerImg.attr("alt"));
        }
      }

      // 4. Fallback: Check title attribute of the anchor tag itself
      if (!title) {
        title = cleanText($(el).attr("title"));
      }

      // 5. Validation Logic
      if (title && title.length > 10 && link && !link.match(/category|policy|contact|about|#|javascript/)) {
        try {
          const fullLink = new url.URL(link, categoryUrl).href;
          
          // Final check: Ensure we haven't already added this link
          if (!jobsMap.has(fullLink)) {
            jobsMap.set(fullLink, { title, link: fullLink });
          }
        } catch(e) {}
      }
    });

    const uniqueJobs = Array.from(jobsMap.values());

    await pvtPostlist.findOneAndUpdate(
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
  // 1. Fetch minimal fields sorted by date (Oldest first)
  const allPosts = await PvtPost.find({}, { _id: 1, title: 1, url: 1, createdAt: 1 })
    .sort({ createdAt: 1 })
    .lean();

  const toDelete = [];
  const seenTitles = new Map(); 

  for (const post of allPosts) {
    // Key used for duplicate detection (Title or URL)
    const key = normalizeTitle(post.title || post.url);
    
    if (key.length < 5) continue;

    if (seenTitles.has(key)) {
      // Duplicate found! 
      // Current 'post' is NEWER because of sort order.
      // 'seenTitles' has the OLDER post.
      
      const olderPost = seenTitles.get(key);

      // Strategy: Delete OLDER, keep NEWER
      toDelete.push({
        deleteId: olderPost._id,
        keepId: post._id,
        title: post.title
      });

      // Update map with newer post so next duplicates compare against the latest one
      seenTitles.set(key, post);
    } else {
      seenTitles.set(key, post);
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
    
    // Batch Delete (1 Query instead of N queries)
    const result = await PvtPost.deleteMany({ _id: { $in: idsToDelete } });

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
      analysis: duplicates.slice(0, 50), // Limit payload
      info: "Dry-run only. Use /api/delete-duplicates to execute.",
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

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
const normalizeTitle = (str) =>
  (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");

// ============================================================================
const formatWithAI = async (scrapedData) => {
  try {
    const modelNameData = await GeminiModel.findOne().sort({ createdAt: -1 });
    if (!modelNameData) {
      throw new Error("No Gemini model configured in the database");
    }

    // Prefer environment variable GEMINI_API_KEY; fallback to DB-stored key
    let effectiveKey = process.env.GEMINI_API_KEY;
    if (!effectiveKey) {
      const apiKeyData = await ApiKey.findOne({}).sort({ createdAt: -1 });
      if (!apiKeyData) {
        throw new Error("No API key configured (env or DB)");
      }
      effectiveKey = apiKeyData.apiKey;
    }

    const genAI = new GoogleGenerativeAI(effectiveKey);
    const model = genAI.getGenerativeModel({
      model: modelNameData.modelName,
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `
You are an AI job-data extraction engine used inside a Node.js backend.

Your task is to extract ONLY structured job information from raw scraped webpage content.

========================
STRICT RULES (MUST FOLLOW)
========================
1. Output MUST be valid JSON only.
2. DO NOT include explanations, comments, markdown, or extra text.
3. DO NOT include UI-related data (divs, buttons, menus, ads, scripts, images).
4. DO NOT include HTML tags inside values.
5. DO NOT invent or assume missing data.
6. If data is missing, use null.
7. Numbers must be numbers (not strings).
8. Dates must be in ISO format: YYYY-MM-DD.
9. Currency symbols must be removed.
10. Arrays must be empty if no data found.
11. Field names must match EXACTLY.
12. Do NOT add or remove fields.
13. Output language: English only.
14. If multiple values exist, return them as arrays.
15. scrapedAt must be current UTC time in ISO format.

========================
REQUIRED OUTPUT FORMAT
========================
{
  "sourceUrl": string,
  "sourceSite": string,

  "title": string,

  "company": {
    "name": string,
    "officialSite": string | null
  },

  "location": string | null,
  "designation": string | null,
  "employmentType": string | null,
  "category": string | null,

  "openings": number | null,
  "duration": string | null,

  "qualification": {
    "level": string | null,
    "branches": string[],
    "passoutYear": number | null
  },

  "ageLimit": {
    "min": number | null,
    "max": number | null
  },

  "experience": string | null,

  "stipend": {
    "amount": number | null,
    "currency": "INR" | null,
    "period": string | null
  },

  "benefits": string[],

  "applyLinks": {
    "register": string | null,
    "notification": string | null
  },

  "closingDate": string | null,
  "isActive": boolean,
  "scrapedAt": string
}

========================
WHAT TO EXTRACT
========================
- Job title
- Company name and official website
- Job location
- Job designation
- Employment type
- Job category
- Number of openings
- Duration
- Qualification level and branches
- Age limit
- Experience requirement
- Stipend details
- Benefits/facilities
- Apply and notification links
- Closing date

========================
WHAT NOT TO EXTRACT
========================
- Ads, banners, popups
- WhatsApp/Telegram join links
- Author name
- Publish date
- Related jobs
- Navigation links
- Footer/header content
- Social media buttons
- Images or image URLs
Return ONLY the JSON object.
If any rule is violated, the response is invalid.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Formatting Error:", error.message);
    return null;
  }
};

const scrapper = async (req, res) => {
  try {
    const jobUrl = req.body.url;
    if (!jobUrl) return res.status(400).json({ error: "URL is required" });

    const response = await axios.get(jobUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      timeout: 20000,
    });

    const $ = cheerio.load(response.data);

    const scrapedData = {
      url: jobUrl,
      title: $("title").text().trim(),
      meta: {
        description: $('meta[name="description"]').attr("content") || "",
        keywords: $('meta[name="keywords"]').attr("content") || "",
        author: $('meta[name="author"]').attr("content") || "",
      },
      headings: { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] },
      links: [],
      images: [],
      tables: [],
      lists: { ul: [], ol: [] },
      paragraphs: [],
      sections: [],
      divs: [],
      forms: [],
      buttons: [],
      allText: [],
    };

    $("h1").each((i, el) =>
      scrapedData.headings.h1.push({
        text: cleanText($(el).text()),
        html: $(el).html(),
        index: i,
      })
    );
    $("h2").each((i, el) =>
      scrapedData.headings.h2.push({
        text: cleanText($(el).text()),
        html: $(el).html(),
        index: i,
      })
    );
    $("h3").each((i, el) =>
      scrapedData.headings.h3.push({
        text: cleanText($(el).text()),
        html: $(el).html(),
        index: i,
      })
    );
    $("h4").each((i, el) =>
      scrapedData.headings.h4.push({
        text: cleanText($(el).text()),
        html: $(el).html(),
        index: i,
      })
    );
    $("h5").each((i, el) =>
      scrapedData.headings.h5.push({
        text: cleanText($(el).text()),
        html: $(el).html(),
        index: i,
      })
    );
    $("h6").each((i, el) =>
      scrapedData.headings.h6.push({
        text: cleanText($(el).text()),
        html: $(el).html(),
        index: i,
      })
    );

    $("a").each((i, el) => {
      const href = $(el).attr("href");
      const text = cleanText($(el).text());
      if (!href) return;
      try {
        const fullUrl = new url.URL(href, jobUrl).href;
        scrapedData.links.push({
          text,
          href: fullUrl,
          title: $(el).attr("title") || "",
          target: $(el).attr("target") || "",
          index: i,
        });
      } catch {
        scrapedData.links.push({ text, href, fullUrl: href, index: i });
      }
    });

    $("img").each((i, el) => {
      const src = $(el).attr("src");
      if (src) {
        scrapedData.images.push({
          src,
          alt: $(el).attr("alt") || "",
          index: i,
        });
      }
    });

    $("p").each((i, el) => {
      const text = cleanText($(el).text());
      if (text) scrapedData.paragraphs.push({ text, index: i });
    });

    $("table").each((tableIndex, table) => {
      const tableData = { index: tableIndex, rows: [] };
      $(table)
        .find("tr")
        .each((rowIndex, row) => {
          const rowData = { index: rowIndex, cells: [] };
          $(row)
            .find("td, th")
            .each((cellIndex, cell) => {
              rowData.cells.push({
                tag: cell.tagName.toLowerCase(),
                text: cleanText($(cell).text()),
                html: $(cell).html(),
              });
            });
          tableData.rows.push(rowData);
        });
      scrapedData.tables.push(tableData);
    });

    $("ul").each((ulIndex, ul) => {
      const listData = { index: ulIndex, items: [] };
      $(ul)
        .children("li")
        .each((liIndex, li) => {
          listData.items.push({
            text: cleanText($(li).text()),
            html: $(li).html(),
          });
        });
      scrapedData.lists.ul.push(listData);
    });

    $("ol").each((olIndex, ol) => {
      const listData = { index: olIndex, items: [] };
      $(ol)
        .children("li")
        .each((liIndex, li) => {
          listData.items.push({
            text: cleanText($(li).text()),
            html: $(li).html(),
          });
        });
      scrapedData.lists.ol.push(listData);
    });

    $("div").each((i, el) => {
      const text = cleanText($(el).text());
      if (text.length > 20)
        scrapedData.divs.push({
          text: text.substring(0, 200),
          class: $(el).attr("class"),
        });
    });

    $("form").each((i, el) => {
      scrapedData.forms.push({
        action: $(el).attr("action"),
        method: $(el).attr("method"),
      });
    });

    $("button").each((i, el) => {
      scrapedData.buttons.push({ text: cleanText($(el).text()) });
    });

    $("body *").each((_, el) => {
      const tag = el.tagName?.toLowerCase();
      if (!tag) return;
      const text = $(el).clone().children().remove().end().text().trim();
      if (!text) return;
      const validTags = [
        "p",
        "span",
        "div",
        "li",
        "td",
        "th",
        "h1",
        "h2",
        "h3",
        "strong",
        "b",
      ];
      if (validTags.includes(tag)) {
        scrapedData.allText.push({ tag, text: cleanText(text) });
      }
    });

    const formattedData = await formatWithAI(scrapedData);

    if (!formattedData) {
      return res
        .status(500)
        .json({ success: false, error: "Failed to format data with AI" });
    }
    let cleanUrl = jobUrl;

    try {
      const parsed = new URL(jobUrl);
      cleanUrl = parsed.pathname; // "/xyz"
    } catch (err) {
      console.warn("Invalid URL, using as-is:", jobUrl);
    }

    // 2️⃣ Ensure formattedData me cleanUrl daal do
    formattedData.url = cleanUrl;

    await PvtPost.findOneAndUpdate(
      { url: cleanUrl }, // DB me sirf path save karna hai
      { $set: formattedData },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      formatted: formattedData,
    });
  } catch (error) {
    console.error("Scraper Error:", error);
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

    const ignore = new Set([
      "Home",
      "Contact Us",
      "Privacy Policy",
      "Disclaimer",
      "More",
      "About Us",
      "Sitemap",
      "Web Stories",
      "Terms and Conditions",
    ]);
    const menuSelectors =
      "nav a, .menu a, ul.navigation a, .nav-menu a, #primary-menu a";

    $(menuSelectors).each((_, el) => {
      const name = cleanText($(el).text());
      const href = $(el).attr("href");

      if (name && href && !ignore.has(name) && !href.includes("web-stories")) {
        try {
          const fullLink = new url.URL(href, targetUrl).href;
          if (!categories.has(fullLink)) {
            categories.set(fullLink, { name, link: fullLink });
          }
        } catch (e) {}
      }
    });

    const uniqueCategories = Array.from(categories.values());

    await PvtSection.findOneAndUpdate(
      { url: targetUrl },
      { $set: { url: targetUrl, categories: uniqueCategories } },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      count: uniqueCategories.length,
      categories: uniqueCategories,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const scrapeCategory = async (req, res) => {
  try {
    const categoryUrl = req.body.url;
    if (!categoryUrl)
      return res.status(400).json({ error: "Category URL required" });

    const response = await axios.get(categoryUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const $ = cheerio.load(response.data);

    const jobsMap = new Map();
    const mainContent = $("main, article, .content, .posts, .container");
    const ignoreSelectors = "nav, footer, .menu, .sidebar, .header";

    mainContent.find("a").each((_, el) => {
      if ($(el).closest(ignoreSelectors).length > 0) return;

      const title = cleanText($(el).text());
      const link = $(el).attr("href");

      if (
        title &&
        title.length > 10 &&
        link &&
        !link.match(/category|policy|contact|about/)
      ) {
        try {
          const fullLink = new url.URL(link, categoryUrl).href;
          if (!jobsMap.has(fullLink)) {
            jobsMap.set(fullLink, { title, link: fullLink });
          }
        } catch (e) {}
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
  const allPosts = await PvtPost.find(
    {},
    { _id: 1, title: 1, url: 1, createdAt: 1 }
  )
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
        title: post.title,
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

    const idsToDelete = duplicates.map((d) => d.deleteId);

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

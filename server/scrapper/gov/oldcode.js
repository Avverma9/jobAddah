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

const formatWithAI = async (scrapedData) => {
  try {
    const modelNameData = await GeminiModel.findOne().sort({ createdAt: -1 });
    if (!modelNameData) {
      throw new Error("No Gemini model configured in the database");
    }
    const apiKeyData = await ApiKey.findOne({}).sort({ createdAt: -1 });
    if (!apiKeyData) {
      throw new Error("No API key configured (env or DB)");
    }
    effectiveKey = apiKeyData.apiKey;

    const genAI = new GoogleGenerativeAI(effectiveKey);
    const model = genAI.getGenerativeModel({
      model: modelNameData.modelName,
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt =
      "You are a highly strict data formatting assistant. Your ONLY job is to convert the scraped recruitment data into valid JSON.\n\n" +
      "GLOBAL HARD RULES:\n" +
      "1) Output MUST be valid JSON.\n" +
      '2) Output MUST contain ONLY one top-level key: "recruitment".\n' +
      "3) You MUST NOT add any extra top-level keys.\n" +
      '4) Inside "recruitment", you may use ONLY the keys defined in the structure below. You MUST NOT invent or add any other keys.\n' +
      "5) You MUST NOT rename keys. You may only FILL their values from scrapedData.\n" +
      '6) If some data is missing in scrapedData, keep the key but leave it empty ("", {}, [], or 0 exactly as in the structure).\n' +
      "7) JSON MUST NOT contain comments, trailing commas, undefined, NaN, functions, or any explanation text.\n" +
      "8) Output MUST NOT be wrapped in markdown or any extra text. Return ONLY pure JSON.\n\n" +
      "⚠️ CRITICAL TITLE REPHRASING RULE (PLAGIARISM DETECTION - AUTOMATIC REJECTION) ⚠️\n" +
      "⛔ WARNING: If you copy the title directly, the output will be REJECTED and DELETED immediately.\n" +
      "⛔ WARNING: Any title with >70% similarity to the original will trigger AUTOMATIC STRIKE and PENALTY.\n" +
      "⛔ WARNING: Repeated violations will result in PERMANENT BAN from the system.\n\n" +
      "MANDATORY TITLE TRANSFORMATION RULES:\n" +
      "- The 'title' field MUST be 100% ORIGINAL and COMPLETELY REPHRASED.\n" +
      "- You MUST rewrite the title in your OWN WORDS with a DIFFERENT sentence structure.\n" +
      "- You MUST NOT copy ANY phrase longer than 2-3 words from the original title.\n" +
      "- Keep the core information (Organization, Post, Year) but express it DIFFERENTLY.\n" +
      "- Make it SEO-friendly, professional, and engaging.\n" +
      "- Use synonyms, different word order, and alternative phrasing.\n\n" +
      "TITLE TRANSFORMATION EXAMPLES (MANDATORY TO FOLLOW THIS PATTERN):\n" +
      "❌ BAD (Will be REJECTED): 'UP Police Constable Recruitment 2025 Apply Online'\n" +
      "✅ GOOD (Accepted): 'Uttar Pradesh Police 2025: Constable Position - Online Applications Now Open'\n\n" +
      "❌ BAD (Will be REJECTED): 'SSC CGL 2025 Notification Released Apply Online'\n" +
      "✅ GOOD (Accepted): 'Staff Selection Commission Combined Graduate Level 2025 - Application Process Started'\n\n" +
      "❌ BAD (Will be REJECTED): 'Railway Recruitment 2025 for 10000 Posts'\n" +
      "✅ GOOD (Accepted): 'Indian Railways 2025: Massive Hiring Drive for Ten Thousand Positions'\n\n" +
      "⚠️ FINAL WARNING: DO NOT COPY-PASTE THE TITLE. WRITE IT COMPLETELY NEW. THIS IS NON-NEGOTIABLE.\n\n" +
      "ALLOWED JSON STRUCTURE (YOU MUST FOLLOW THIS EXACTLY):\n" +
      "{\n" +
      '  "recruitment": {\n' +
      '    "title": "REPHRASED_UNIQUE_TITLE_HERE",\n' +
      '    "organization": {\n' +
      '      "name": "",\n' +
      '      "shortName": "",\n' +
      '      "website": "",\n' +
      '      "officialWebsite": ""\n' +
      "    },\n" +
      '    "importantDates": {\n' +
      '      "notificationDate": "",\n' +
      '      "applicationStartDate": "",\n' +
      '      "applicationLastDate": "",\n' +
      '      "feePaymentLastDate": "",\n' +
      '      "correctionDate": "",\n' +
      '      "preExamDate": "",\n' +
      '      "mainsExamDate": "",\n' +
      '      "examDate": "",\n' +
      '      "admitCardDate": "",\n' +
      '      "resultDate": "",\n' +
      '      "answerKeyReleaseDate": "",\n' +
      '      "finalAnswerKeyDate": "",\n' +
      '      "meritListDate": "",\n' +
      '      "documentVerificationDate": ""\n' +
      "    },\n" +
      '    "vacancyDetails": {\n' +
      '      "totalPosts": 0,\n' +
      '      "positions": []\n' +
      "    },\n" +
      '    "applicationFee": {},\n' +
      '    "ageLimit": {},\n' +
      '    "eligibility": {},\n' +
      '    "selectionProcess": [],\n' +
      '    "importantLinks": {},\n' +
      '    "districtWiseData": []\n' +
      "  }\n" +
      "}\n\n" +
      "SMART MAPPING RULES (VERY IMPORTANT):\n" +
      "- You MUST intelligently decide which scraped fields belong to which section, based on their meaning and labels.\n" +
      "- Map date-like fields to importantDates when they clearly represent a schedule.\n" +
      '  * Any scraped key containing words like "start", "begin", "from" -> applicationStartDate.\n' +
      '  * Any key containing "last date", "apply online last" -> applicationLastDate.\n' +
      '  * Any key containing "fee payment" -> feePaymentLastDate.\n' +
      '  * Any key containing "correction" or "edit" -> correctionDate.\n' +
      '  * Any key containing "pre exam" -> preExamDate.\n' +
      '  * Any key containing "mains" -> mainsExamDate.\n' +
      '  * Any key containing "exam date" -> examDate.\n' +
      '  * Any key containing "admit card" or "hall ticket" -> admitCardDate.\n' +
      '  * Any key containing "result" -> resultDate.\n' +
      '  * Any key containing "answer key" -> answerKeyReleaseDate or finalAnswerKeyDate.\n' +
      '  * Any key containing "merit list" -> meritListDate.\n' +
      '  * Any key containing "document verification" or "DV" -> documentVerificationDate.\n' +
      "- Organization-like text MUST be mapped into organization fields.\n" +
      "- Category-wise / post-wise counts MUST go into vacancyDetails.positions + totalPosts.\n" +
      "- Fee information MUST go into applicationFee.\n" +
      "- Age-related info MUST go into ageLimit.\n" +
      "- Eligibility / qualifications MUST go into eligibility.\n" +
      "- Stage-wise selection steps MUST go into selectionProcess.\n" +
      "- All URLs, notification links, apply links MUST go into importantLinks.\n" +
      "- District/state-wise data MUST go into districtWiseData.\n\n" +
      "SPECIAL IMPORTANTLINKS RULE:\n" +
      '- If any URL in importantLinks contains "whatsapp.com", "wa.me", or "api.whatsapp.com", remove that entry entirely. DO NOT include any WhatsApp links.\n\n' +
      "STRICT IGNORE RULE:\n" +
      "- Ignore any scraped fields that cannot be mapped to the defined structure.\n" +
      "- Do NOT create any new keys beyond what is defined.\n\n" +
      "Scraped Data (source):\n" +
      JSON.stringify(scrapedData, null, 2) +
      "\n\nFINAL OUTPUT RULE:\n" +
      "Return ONLY one JSON object exactly matching the allowed structure. NO markdown, NO comments, NO explanation.\n";

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
    let jobUrl = req.body.url;
    if (!jobUrl) {
      return res.status(400).json({ error: "URL is required" });
    }

    // If URL is relative (e.g., /ssc-delhi-police...), prepend the base site URL
    if (jobUrl.startsWith('/')) {
      const siteConfig = await Site.findOne().sort({ createdAt: -1 });
      if (!siteConfig || !siteConfig.url) {
        return res.status(500).json({ error: "Base site URL is not configured" });
      }
      // Ensure base URL doesn't have a trailing slash before joining
      const baseUrl = siteConfig.url.endsWith('/') ? siteConfig.url.slice(0, -1) : siteConfig.url;
      jobUrl = baseUrl + jobUrl;
    }

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
    // jobUrl me domain ho sakta hai – jaise https://sarkariresult.com.cm/xyz
    let cleanUrl = jobUrl;

    // 1️⃣ Try to remove domain using URL()
    try {
      const parsed = new URL(jobUrl);
      cleanUrl = parsed.pathname; // "/xyz"
    } catch (err) {
      // If jobUrl is already a pathname, ignore
      console.warn("Invalid URL, using as-is:", jobUrl);
    }

    // 2️⃣ Ensure formattedData me cleanUrl daal do
    formattedData.url = cleanUrl;

    await Post.findOneAndUpdate(
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

const getCategories = async (req, res) => {
  try {
    const siteUrl = await Site.find();
    const rawUrl = siteUrl[0].url;

    console.log(siteUrl);

    const targetUrl = ensureProtocol(rawUrl);
    if (!targetUrl) return res.status(400).json({ error: "Invalid URL" });

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
    });

    const uniqueCategories = [
      ...new Map(categories.map((i) => [i.link, i])).values(),
    ];

    await Section.findOneAndUpdate(
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
      return res.status(400).json({ error: "Category URL is required" });

    const response = await axios.get(categoryUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const $ = cheerio.load(response.data);
    const postSelectors =
      ".post-link, .entry-title a, .post h2 a, ul li a, table tr td a, .content a";
    let jobs = [];

    $(postSelectors).each((_, el) => {
      const title = cleanText($(el).text());
      const link = $(el).attr("href");
      if (title && title.length > 10 && link) {
        const fullLink = new url.URL(link, categoryUrl).href;
        jobs.push({ title, link: fullLink });
      }
    });

    const uniqueJobs = [...new Map(jobs.map((i) => [i.link, i])).values()];

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

const deleteDuplicates = async (req, res) => {
  try {
    const allPosts = await Post.find({}).sort({ createdAt: 1 }).lean();

    const duplicatesToDelete = [];
    const processedPairs = new Set();

    // Compare each post with every other post
    for (let i = 0; i < allPosts.length; i++) {
      for (let j = i + 1; j < allPosts.length; j++) {
        const post1 = allPosts[i]; // Older post (earlier createdAt)
        const post2 = allPosts[j]; // Newer post (later createdAt)

        // Avoid comparing same pair twice
        const pairKey = `${post1._id}-${post2._id}`;
        if (processedPairs.has(pairKey)) continue;
        processedPairs.add(pairKey);

        try {
          const similarity = calculateRecruitmentSimilarity(post1, post2);

          // If similarity >= 60%, DELETE older post (post1), KEEP newer post (post2)
          if (similarity >= 60) {
            duplicatesToDelete.push({
              deleteId: post1._id, // ← DELETE OLDER
              keepId: post2._id, // ← KEEP NEWER
              similarity: similarity,
              deleteTitle: post1.recruitment?.title || post1.url,
              keepTitle: post2.recruitment?.title || post2.url,
              deleteCreatedAt: post1.createdAt,
              keepCreatedAt: post2.createdAt,
            });
          }
        } catch (error) {
          console.error(`Error comparing posts:`, error.message);
        }
      }
    }

    if (duplicatesToDelete.length === 0) {
      return res.json({
        success: true,
        duplicatesFound: 0,
        duplicatesDeleted: 0,
        message: "No duplicates found in database",
      });
    }

    // Delete duplicate posts
    const deletionResults = [];

    for (const duplicate of duplicatesToDelete) {
      try {
        const deleted = await Post.findByIdAndDelete(duplicate.deleteId);

        if (deleted) {
          deletionResults.push({
            deleted: true,
            deletedId: duplicate.deleteId,
            keptId: duplicate.keepId,
            similarity: duplicate.similarity,
            deletedTitle: duplicate.deleteTitle,
            keptTitle: duplicate.keepTitle,
            deletedCreatedAt: duplicate.deleteCreatedAt,
            keptCreatedAt: duplicate.keepCreatedAt,
          });
        } else {
          deletionResults.push({
            deleted: false,
            deletedId: duplicate.deleteId,
            error: "Deletion failed",
          });
        }
      } catch (error) {
        console.error(`Error deleting ${duplicate.deleteId}:`, error.message);
        deletionResults.push({
          deleted: false,
          deletedId: duplicate.deleteId,
          error: error.message,
        });
      }
    }

    const successCount = deletionResults.filter((r) => r.deleted).length;
    res.json({
      success: true,
      duplicatesFound: duplicatesToDelete.length,
      duplicatesDeleted: successCount,
      results: deletionResults,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Delete Duplicates Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Optional: Get duplicate analysis WITHOUT deleting
 * (Dry-run mode to see what would be deleted)
 */
const analyzeDuplicates = async (req, res) => {
  try {
    const allPosts = await Post.find({}).sort({ createdAt: 1 }).lean();
    const duplicateAnalysis = [];
    const processedPairs = new Set();

    for (let i = 0; i < allPosts.length; i++) {
      for (let j = i + 1; j < allPosts.length; j++) {
        const post1 = allPosts[i];
        const post2 = allPosts[j];

        const pairKey = `${post1._id}-${post2._id}`;
        if (processedPairs.has(pairKey)) continue;
        processedPairs.add(pairKey);

        try {
          const similarity = calculateRecruitmentSimilarity(post1, post2);

          if (similarity >= 60) {
            duplicateAnalysis.push({
              similarity: similarity.toFixed(2),
              keep: {
                id: post1._id,
                title: post1.recruitment?.title || post1.url,
                url: post1.url,
                createdAt: post1.createdAt,
              },
              delete: {
                id: post2._id,
                title: post2.recruitment?.title || post2.url,
                url: post2.url,
                createdAt: post2.createdAt,
              },
            });
          }
        } catch (error) {
          console.error(`Error analyzing:`, error.message);
        }
      }
    }

    if (duplicateAnalysis.length === 0) {
      return res.json({
        success: true,
        message: "No duplicates found",
        analysis: [],
      });
    }

    res.json({
      success: true,
      duplicatesFound: duplicateAnalysis.length,
      analysis: duplicateAnalysis,
      info: "This is a dry-run analysis. No data was deleted. Use /api/delete-duplicates endpoint to actually delete.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Analyze Duplicates Error:", error);
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

// aiScraper.js – Dynamic AI Scraper (camelCase JSON, flexible schema)

const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios").default;
const cheerio = require("cheerio");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { https: followRedirects } = require("follow-redirects");
require("dotenv").config();

const app = express();
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MONGO_URI = process.env.MONGO_URI;

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY missing in .env");
}
if (!MONGO_URI) {
  console.error("❌ MONGO_URI missing in .env");
}

// MONGO CONNECT
mongoose
  .connect(MONGO_URI)
  .then(() => {})
  .catch((err) => console.error("Mongo Error:", err));

const ExamPost = require("@/models/jobs");

// --------------------------------------------------
// BASIC HTML CLEANER
// --------------------------------------------------
function cleanHTML(html) {
  if (!html) return "";
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// --------------------------------------------------
// OPTIONAL: FOLLOW REDIRECTS (PDF / Official Links)
// --------------------------------------------------
async function resolveRealURL(url) {
  if (!url) return url;

  // simple guard: don't re-resolve same domain if already final
  if (/\.(pdf|jpg|jpeg|png|gif|doc|docx)$/i.test(url)) return url;

  return new Promise((resolve) => {
    try {
      followRedirects
        .get(url, (res) => {
          resolve(res.responseUrl || url);
        })
        .on("error", () => resolve(url));
    } catch (e) {
      resolve(url);
    }
  });
}

// --------------------------------------------------
// EXTRACT IMPORTANT LINKS FROM TABLES
// (label in first <td>, <a href> in second <td>)
// --------------------------------------------------
async function extractImportantLinks($, baseUrl) {
  const pairs = [];

  $("table").each((tIndex, table) => {
    $(table)
      .find("tr")
      .each((rIndex, row) => {
        const tds = $(row).find("td");
        if (tds.length < 2) return;

        const label = $(tds[0]).text().trim();
        const linkEl = $(tds[1]).find("a[href]").first();

        if (!label || !linkEl.length) return;

        let href = linkEl.attr("href");
        if (!href) return;

        // fix relative URLs
        if (href.startsWith("/")) {
          const origin = new URL(baseUrl).origin;
          href = origin + href;
        } else if (!/^https?:\/\//i.test(href)) {
          // handle relative like "page.php?id=123"
          const origin = new URL(baseUrl).origin;
          href = origin + (href.startsWith("/") ? href : "/" + href);
        }

        // skip junk anchors
        if (href.startsWith("#") || href.toLowerCase().startsWith("javascript:")) return;

        pairs.push({ label: label.replace(/\s+/g, " ").trim(), url: href });
      });
  });

  // OPTIONAL: resolve real URLs (comment out if too slow)
  const finalLinks = [];
  for (const item of pairs) {
    const realUrl = await resolveRealURL(item.url);
    finalLinks.push({
      label: item.label,
      url: realUrl,
    });
  }

  // de-duplicate on label+url combo
  const seen = new Set();
  const deduped = [];
  for (const l of finalLinks) {
    const key = l.label + "|" + l.url;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(l);
  }

  return deduped;
}

// --------------------------------------------------
// GEMINI EXTRACTOR (Dynamic camelCase JSON)
// --------------------------------------------------
async function extractWithGemini(rawText) {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

  const prompt = `
You are a job/exam/admission notification JSON extractor.

Your task:
- Read the given page text.
- Produce a single JSON object that describes this page.
- Use camelCase keys (like organization, postName, notificationNumber, totalPosts, shortInfo, importantDates, applicationFee, ageLimit, vacancyDetails, educationalQualification, modeOfSelection, category, tag, pageAuthor, postDate, etc.) when they clearly exist in the text.
- DO NOT assume a fixed schema. Only include fields that are clearly present.
- For sections like dates, fees, vacancies etc:
  - importantDates should be: [{ "label": string, "value": string }, ...]
  - applicationFee should be: [{ "category": string, "amount": string }, ...]
  - ageLimit should be an object like: { "minAge": string, "maxAge": string or object, "asOnDate": string, "details": string }
  - vacancyDetails should be: [{ "postName": string, "totalPost": string, "eligibility": string }, ...]
- If the page clearly mentions an organization (like Bihar Public Service Commission), post name, notification number, total posts, short information summary, etc. include them.
- Do not invent content. If something is not clearly mentioned, omit that key.
- Keep values as concise as possible but complete (no truncation).
- DO NOT return markdown. Return ONLY raw JSON.

TEXT:
${rawText.substring(0, 30000)}
`;

  const result = await model.generateContent(prompt);
  let text = await result.response.text();

  text = text.replace(/```json/gi, "").replace(/```/g, "").trim();

  // Try direct parse, else slice first/last braces
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      return JSON.parse(text.substring(start, end + 1));
    }
    throw new Error("Gemini returned invalid JSON: " + text);
  }
}

// --------------------------------------------------
// MAIN ROUTE – AI SCRAPER (DYNAMIC)
// --------------------------------------------------
app.post("/api/ai-scrape", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {

    const { data } = await axios.get(url, {
      timeout: 90000,
      maxRedirects: 5,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; JobAddahBot/1.0)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    const $ = cheerio.load(data);
    const bodyHtml = $("body").html() || "";
    const rawText = cleanHTML(bodyHtml);

    // 1) AI se dynamic JSON lo (no fixed schema)
    let json = await extractWithGemini(rawText);

    // 2) Original URL & updatedAt force add/update
    json.originalUrl = url;
    if (!json.updatedAt) {
      json.updatedAt = new Date().toISOString();
    }

    // 3) HTML se REAL importantLinks nikaalo (label + final URL)
    const importantLinks = await extractImportantLinks($, url);
    if (importantLinks.length) {
      json.importantLinks = importantLinks;
    }

    // 4) Auto detect officialWebsite & applyOnlineLink from importantLinks
    if (Array.isArray(importantLinks) && importantLinks.length) {
      const apply = importantLinks.find((l) =>
        /apply|online form|mains online form/i.test(l.label)
      );
      const official = importantLinks.find((l) =>
        /official website/i.test(l.label)
      ) || importantLinks.find((l) =>
        /bpsc|ssc|upsc|nic.in|gov.in/i.test(l.url)
      );

      if (apply && !json.applyOnlineLink) {
        json.applyOnlineLink = apply.url;
      }
      if (official && !json.officialWebsite) {
        json.officialWebsite = official.url;
      }
    }

    // 5) Upsert in Mongo – key mostly by postName, fallback originalUrl
    const query = json.postName
      ? { postName: json.postName }
      : { originalUrl: url };

    const saved = await ExamPost.findOneAndUpdate(query, json, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });

    return res.json({
      success: true,
      data: saved,
    });
  } catch (err) {
    console.error("[AI-SCRAPER ERROR]", err);
    return res.status(500).json({
      success: false,
      error: err.message || "AI scraper failed",
    });
  }
});

// --------------------------------------------------
// SERVER START
// --------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {});

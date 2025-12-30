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
const PerplexityModel = require("@/models/ai/perplexity-model");
const pplKey = require("@/models/ai/perplexity-apikey");
const { buildPrompt } = require("./prompt");
const getActiveAIConfig = require("@/utils/aiKey");

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

// formatWithAI(scrapedData): builds prompt, runs Gemini or falls back to Perplexity
const formatWithAI = async (scrapedData, hints = {}) => {
  try {
    const { provider, modelName, apiKey } = await getActiveAIConfig();

    const prompt = buildPrompt(scrapedData, hints);

    // ===============================
    // 🔹 GEMINI FLOW
    // ===============================
    if (provider === "gemini") {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
    }

    // ===============================
    // 🔹 PERPLEXITY FLOW
    // ===============================
    const pplResponse = await fetch(
      "https://api.perplexity.ai/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelName || "sonar",
          messages: [
            {
              role: "system",
              content:
                "You are a data formatting expert. Return only valid JSON matching the provided schema.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.2,
          max_tokens: 4000,
        }),
      }
    );

    if (!pplResponse.ok) {
      const err = await pplResponse.json();
      throw new Error(err.error?.message || "Perplexity API error");
    }

    const pplResult = await pplResponse.json();
    const content = pplResult.choices?.[0]?.message?.content;

    if (!content) throw new Error("Perplexity returned empty content");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
  } catch (err) {
    console.error("AI Formatting Error:", err.message);
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
    if (jobUrl.startsWith("/")) {
      const siteConfig = await Site.findOne().sort({ createdAt: -1 });
      if (!siteConfig || !siteConfig.url) {
        return res
          .status(500)
          .json({ error: "Base site URL is not configured" });
      }
      // Ensure base URL doesn't have a trailing slash before joining
      const baseUrl = siteConfig.url.endsWith("/")
        ? siteConfig.url.slice(0, -1)
        : siteConfig.url;
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

    // Extract deterministic important links heuristically so AI has real URLs to use
    const extractImportantLinks = (sd) => {
      const hints = {
        applyOnline: "",
        officialNotification: "",
        shortNotice: "",
        officialWebsite: "",
      };

      const urlHost = (() => {
        try {
          return new url.URL(sd.url).host;
        } catch (e) {
          return null;
        }
      })();

      for (const link of sd.links || []) {
        const text = (link.text || "").toLowerCase();
        const href = link.href || link.fullUrl || "";
        const hrefLower = href.toLowerCase();

        if (
          !hints.applyOnline &&
          (text.includes("apply") ||
            hrefLower.includes("apply") ||
            text.includes("registration"))
        ) {
          hints.applyOnline = href;
        }

        if (
          !hints.officialNotification &&
          (text.includes("notification") ||
            hrefLower.includes("notification") ||
            text.includes("notice") ||
            hrefLower.includes("notice"))
        ) {
          hints.officialNotification = href;
        }

        if (
          !hints.shortNotice &&
          (text.includes("short notice") ||
            text.includes("short-notice") ||
            text.includes("shortnotice"))
        ) {
          hints.shortNotice = href;
        }

        // prefer same-host links as official website
        if (!hints.officialWebsite && urlHost) {
          try {
            const linkHost = new url.URL(href).host;
            if (linkHost === urlHost) hints.officialWebsite = href;
          } catch (e) {}
        }

        // last resort: if pdf found and no notification yet
        if (!hints.officialNotification && hrefLower.endsWith(".pdf")) {
          hints.officialNotification = href;
        }
      }

      return hints;
    };

    const hints = extractImportantLinks(scrapedData);

    // Pass scrapedData + hints to AI
    const formattedData = await formatWithAI(scrapedData, hints);

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

    // Post-process importantLinks: replace anchor-text placeholders (e.g., "Click Here")
    // with deterministic hints when possible.
    try {
      const outLinks = formattedData?.recruitment?.importantLinks || {};
      for (const key of Object.keys(outLinks)) {
        const val = (outLinks[key] || "").toString().trim();
        const lower = val.toLowerCase();
        const isUrl = val.startsWith("http://") || val.startsWith("https://");
        const isPlaceholder =
          !isUrl ||
          lower === "click here" ||
          lower === "here" ||
          lower === "click";
        if (isPlaceholder) {
          // map key names from AI to our hints keys where possible
          const hintKey =
            key in hints ? key : key.replace(/([A-Z])/g, "_$1").toLowerCase();
          if (hints[hintKey]) {
            formattedData.recruitment.importantLinks[key] = hints[hintKey];
          } else {
            // try to use any non-empty hint value
            const anyHint = Object.values(hints).find((h) => h && h.length > 0);
            formattedData.recruitment.importantLinks[key] = anyHint || "";
          }
        }
      }
    } catch (e) {
      // don't fail the whole scrape for link-fix errors
      console.warn("importantLinks post-process failed:", e.message);
    }

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


module.exports = {
  scrapper,
  getCategories,
  scrapeCategory,
};

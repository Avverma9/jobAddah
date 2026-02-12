import Site from "../../models/govJob/scrapperSite.mjs";
import Section from "../../models/govJob/govSection.mjs";
import govPostList from "../../models/govJob/govPostListBycatUrl.mjs";
import * as cheerio from "cheerio";
import axios from "axios";
import { URL } from "node:url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import getActiveAIConfig, {
  markKeyFailure,
  markKeySuccess,
} from "../../utils/aiKey.mjs";


const http = axios.create({
  timeout: 12000,
  headers: { "User-Agent": "Mozilla/5.0 (compatible; JobsAddahBot/1.0)" },
  maxRedirects: 5,
});

const TRACKING_KEYS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "gclid",
  "igshid",
  "mc_cid",
  "mc_eid",
  "ref",
  "ref_src",
  "source",
]);

const IMPORTANT_QUERY_KEYS = new Set(["p", "post", "post_id", "id", "job", "vacancy", "pid"]);

const BLOCKED_TITLE_RE =
  /^(home|about|about us|contact|contact us|privacy|privacy policy|disclaimer|sitemap|more|read more|view all|next|previous)$/i;

const BLOCKED_PATH_RE =
  /(\/category\/|\/tag\/|\/author\/|\/search\/|\/feed\/?$|\/wp-admin\/|\/page\/\d+\/?$|\/sitemap)/i;

const YEAR_RE = /\b20(2[4-9]|3[0-2])\b/;

const CATEGORY_KEYWORDS = {
  result: [
    "result",
    "score card",
    "merit",
    "cutoff",
    "marks",
    "final list",
    "selection list",
  ],
  "admit-card": ["admit card", "hall ticket", "call letter", "exam city"],
  "answer-key": ["answer key", "response sheet", "objection"],
  "latest-jobs": ["notification", "recruitment", "vacancy", "apply online", "online form"],
  mixed: [
    "result",
    "admit card",
    "answer key",
    "notification",
    "recruitment",
    "vacancy",
    "online form",
    "score card",
    "merit list",
    "cutoff",
  ],
};

const COMMON_JOB_TERMS = [
  "result",
  "admit card",
  "answer key",
  "notification",
  "recruitment",
  "vacancy",
  "score card",
  "merit list",
  "cutoff",
  "final",
  "exam",
  "selection",
  "joining",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const cleanText = (value) => String(value || "").replace(/\s+/g, " ").trim();

const normalizeHost = (host) =>
  String(host || "")
    .toLowerCase()
    .replace(/^www\./, "")
    .trim();

const normalizeCategoryUrl = (inputUrl) => {
  if (!inputUrl) return null;
  let raw = String(inputUrl).trim();
  if (!raw.startsWith("http://") && !raw.startsWith("https://")) {
    raw = `https://${raw}`;
  }
  const u = new URL(raw);
  u.hash = "";
  u.search = "";
  let pathname = u.pathname || "/";
  pathname = pathname.replace(/\/+$/, "");
  if (!pathname) pathname = "/";
  return `${u.protocol}//${normalizeHost(u.host)}${pathname}`;
};

const sectionFromUrl = (inputUrl) => {
  try {
    const u = new URL(inputUrl);
    let path = u.pathname || "/";
    path = path.replace(/\/+$/, "");
    return path || "/";
  } catch {
    return "/";
  }
};

const detectCategoryMode = (categoryUrl, categoryName = "") => {
  const source = `${categoryUrl} ${categoryName}`.toLowerCase();
  if (source.includes("admit-card") || source.includes("admit card")) return "admit-card";
  if (source.includes("answer-key") || source.includes("answer key")) return "answer-key";
  if (source.includes("result")) return "result";
  if (source.includes("latest-jobs") || source.includes("latest jobs")) return "latest-jobs";
  return "mixed";
};

const canonicalizeJobLink = (inputUrl) => {
  if (!inputUrl) return null;
  try {
    const u = new URL(String(inputUrl).trim());
    u.hash = "";

    const params = new URLSearchParams(u.search || "");
    const keys = [...params.keys()];
    const hasImportant = keys.some((k) => IMPORTANT_QUERY_KEYS.has(k.toLowerCase()));
    if (!hasImportant) {
      keys.forEach((k) => {
        if (TRACKING_KEYS.has(k.toLowerCase())) params.delete(k);
      });
      const query = params.toString();
      u.search = query ? `?${query}` : "";
    }

    let pathname = u.pathname || "/";
    pathname = pathname.replace(/\/+$/, "");
    if (!pathname) pathname = "/";

    return `${u.protocol}//${normalizeHost(u.host)}${pathname}${u.search}`;
  } catch {
    return String(inputUrl).trim().split("#")[0];
  }
};

const canonicalJobKey = (job) =>
  canonicalizeJobLink(job?.canonicalLink || job?.link || "") || "";

const sanitizeJob = (job) => {
  const title = cleanText(job?.title);
  const link = cleanText(job?.link);
  if (!title || !link) return null;

  const canonicalLink = canonicalizeJobLink(job?.canonicalLink || link);
  if (!canonicalLink) return null;

  return {
    title,
    link,
    canonicalLink,
    createdAt: new Date(job?.createdAt || Date.now()),
    updatedAt: new Date(),
  };
};

const containsAny = (text, terms) => terms.some((t) => text.includes(t));

const scoreCandidate = ({ title, canonicalLink }, categoryMode) => {
  const t = title.toLowerCase();
  const path = (() => {
    try {
      return new URL(canonicalLink).pathname.toLowerCase();
    } catch {
      return "";
    }
  })();

  if (!t || t.length < 12) return -100;
  if (BLOCKED_TITLE_RE.test(t)) return -100;
  if (BLOCKED_PATH_RE.test(path)) return -100;

  const categoryTerms = CATEGORY_KEYWORDS[categoryMode] || CATEGORY_KEYWORDS.mixed;
  let score = 0;

  if (containsAny(t, COMMON_JOB_TERMS)) score += 2;
  if (containsAny(t, categoryTerms)) score += 3;
  if (YEAR_RE.test(t)) score += 2;
  if (/\/\d{4}\/\d{1,2}\//.test(path)) score += 1;

  const slugSegments = path.split("/").filter(Boolean);
  const lastSeg = slugSegments[slugSegments.length - 1] || "";
  if (slugSegments.length >= 1 && lastSeg.length >= 8) score += 1;

  if (
    /^\/(result|results|admit-card|answer-key|latest-jobs|job|jobs)\/?$/.test(path) ||
    /^\/?$/.test(path)
  ) {
    score -= 5;
  }

  if (/category|tag|archive|latest|all|list/.test(lastSeg) && !YEAR_RE.test(t)) score -= 2;

  return score;
};

const extractCandidateLinks = (html, pageUrl, categoryMode) => {
  const $ = cheerio.load(html);
  $("script, style, noscript, nav, footer, header, .menu, .sidebar, aside").remove();

  const selectors = [
    "article h1 a",
    "article h2 a",
    "article h3 a",
    ".entry-title a",
    ".post-title a",
    ".post h2 a",
    ".post h3 a",
    "h2 a",
    "h3 a",
    "main a[href]",
    ".content a[href]",
  ].join(",");

  const pageCanonical = canonicalizeJobLink(pageUrl);
  const pageHost = normalizeHost(new URL(pageUrl).host);
  const candidates = [];
  const seen = new Set();

  $(selectors).each((_, el) => {
    const title = cleanText($(el).text());
    const href = $(el).attr("href");
    if (!title || !href) return;

    let full;
    try {
      full = new URL(href, pageUrl).href;
    } catch {
      return;
    }

    const canonicalLink = canonicalizeJobLink(full);
    if (!canonicalLink || canonicalLink === pageCanonical) return;

    let u;
    try {
      u = new URL(canonicalLink);
    } catch {
      return;
    }

    if (normalizeHost(u.host) !== pageHost) return;

    const dedupe = `${canonicalLink}::${title.toLowerCase()}`;
    if (seen.has(dedupe)) return;
    seen.add(dedupe);

    const score = scoreCandidate({ title, canonicalLink }, categoryMode);
    if (score < 2) return;

    candidates.push({
      id: candidates.length + 1,
      title,
      link: full,
      canonicalLink,
      score,
    });
  });

  return candidates.slice(0, 80);
};

const parseJsonLoose = (input) => {
  if (input && typeof input === "object") return input;
  const text = String(input || "").trim();
  if (!text) throw new Error("Empty AI output");

  const clean = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(clean);
  } catch {
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(clean.slice(start, end + 1));
    }
  }
  throw new Error("Invalid AI JSON");
};

const callPerplexity = async ({ apiKey, modelName, prompt }) => {
  const response = await axios.post(
    "https://api.perplexity.ai/chat/completions",
    {
      model: modelName || "sonar",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0,
      max_tokens: 300,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 18000,
    },
  );

  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("No response from Perplexity");
  return parseJsonLoose(content);
};

const classifyCandidatesWithAI = async ({ candidates, pageUrl, categoryMode }) => {
  if (!candidates.length) return new Set();

  const compact = candidates.slice(0, 40).map((c) => ({
    id: c.id,
    title: c.title.slice(0, 140),
    url: c.canonicalLink,
  }));

  const prompt = `Filter links for category "${categoryMode}" from page "${pageUrl}".
Keep only individual post URLs. Reject navigation/category/tag/archive/pagination links.
Do not merge by organization name. If titles are different and URLs are different, keep both.
Return strict JSON only: {"keepIds":[1,2]}
Candidates:
${JSON.stringify(compact)}`;

  const tried = new Set();
  let lastError = null;

  while (true) {
    let cfg;
    try {
      cfg = await getActiveAIConfig({ excludeKeyIds: [...tried] });
    } catch (e) {
      throw lastError || e;
    }

    try {
      let parsed;
      if (cfg.provider === "gemini") {
        const genAI = new GoogleGenerativeAI(cfg.apiKey);
        const model = genAI.getGenerativeModel({
          model: cfg.modelName || "gemini-1.5-flash",
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0,
          },
        });
        const res = await model.generateContent(prompt);
        parsed = parseJsonLoose(res.response.text());
      } else if (cfg.provider === "perplexity") {
        parsed = await callPerplexity({
          apiKey: cfg.apiKey,
          modelName: cfg.modelName,
          prompt,
        });
      } else {
        throw new Error(`Unsupported provider: ${cfg.provider}`);
      }

      const keepIds = Array.isArray(parsed?.keepIds)
        ? parsed.keepIds
            .map((v) => Number(v))
            .filter((v) => Number.isInteger(v) && v > 0)
        : [];

      await markKeySuccess({ provider: cfg.provider, keyId: cfg.keyId });
      return new Set(keepIds);
    } catch (err) {
      lastError = err;
      await markKeyFailure({
        provider: cfg.provider,
        keyId: cfg.keyId,
        errorMessage: err.message,
      });
      tried.add(String(cfg.keyId));
      continue;
    }
  }
};

const extractJobsSmartFast = async (html, pageUrl, categoryMode) => {
  const candidates = extractCandidateLinks(html, pageUrl, categoryMode);

  const confident = candidates.filter((c) => c.score >= 5);
  const ambiguous = candidates.filter((c) => c.score >= 2 && c.score < 5);

  let aiKept = new Set();
  let aiUsed = false;

  if (ambiguous.length) {
    try {
      aiUsed = true;
      aiKept = await classifyCandidatesWithAI({
        candidates: ambiguous,
        pageUrl,
        categoryMode,
      });
    } catch (e) {
      // Keep fast fallback behavior: if AI fails, still return deterministic confident items.
      aiUsed = true;
      console.error("AI classification fallback:", e.message);
    }
  }

  const finalCandidates = [
    ...confident,
    ...ambiguous.filter((c) => aiKept.has(c.id)),
  ];

  const unique = new Map();
  finalCandidates.forEach((candidate) => {
    const job = sanitizeJob(candidate);
    if (!job) return;
    const key = canonicalJobKey(job);
    if (!key) return;
    const existing = unique.get(key);
    if (!existing || job.title.length > existing.title.length) {
      unique.set(key, job);
    }
  });

  return {
    jobs: Array.from(unique.values()),
    stats: {
      candidates: candidates.length,
      confident: confident.length,
      ambiguous: ambiguous.length,
      aiUsed,
      final: unique.size,
    },
  };
};

const fetchCategoryPage = async (baseUrl, page) => {
  const attempts =
    page === 1
      ? [baseUrl]
      : [`${baseUrl}/page/${page}/`, `${baseUrl}?paged=${page}`, `${baseUrl}?page=${page}`];

  let lastError = null;
  for (const pageUrl of attempts) {
    try {
      const response = await http.get(pageUrl);
      return { html: response.data, pageUrl };
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError || new Error(`Failed to fetch page ${page}`);
};

const getCategories = async (req, res) => {
  try {
    const siteUrl = await Site.find();
    if (!siteUrl.length) {
      return res.status(404).json({ error: "No site configured" });
    }

    const rawUrl = siteUrl[0].url;
    let targetUrl = rawUrl.trim();
    if (!targetUrl.startsWith("http")) targetUrl = "https://" + targetUrl;

    const response = await http.get(targetUrl);

    const $ = cheerio.load(response.data);
    const categories = [];
    const ignore = new Set([
      "Home",
      "Contact Us",
      "Privacy Policy",
      "Disclaimer",
      "More",
      "About Us",
      "Sitemap",
    ]);

    $("nav a, .menu a, ul.navigation a, .nav-menu a, #primary-menu a").each((_, el) => {
      const name = cleanText($(el).text());
      const href = $(el).attr("href");
      if (!name || !href || href === "#" || href === "/") return;
      if (ignore.has(name)) return;

      try {
        const fullLink = new URL(href, targetUrl).href;
        categories.push({ name, link: fullLink });
      } catch {}
    });

    const uniqueCategories = [...new Map(categories.map((i) => [i.link, i])).values()];

    await Section.findOneAndUpdate(
      { url: targetUrl },
      { $set: { url: targetUrl, categories: uniqueCategories } },
      { upsert: true, new: true },
    );

    return res.json({
      success: true,
      count: uniqueCategories.length,
      categories: uniqueCategories,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const scrapeCategory = async (req, res) => {
  try {
    const { url, name, maxPages = 3 } = req.body;
    if (!url) return res.status(400).json({ error: "URL required" });

    const normalizedUrl = normalizeCategoryUrl(url);
    const categoryMode = detectCategoryMode(normalizedUrl, name);
    const pages = Math.max(1, Math.min(Number(maxPages) || 3, 20));

    console.log(`Scraping category: ${normalizedUrl} mode=${categoryMode} pages=${pages}`);

    const existingDoc = await govPostList.findOne({ url: normalizedUrl }).lean();
    const previousJobs = Array.isArray(existingDoc?.jobs)
      ? existingDoc.jobs.map(sanitizeJob).filter(Boolean)
      : [];

    const previousMap = new Map(previousJobs.map((job) => [canonicalJobKey(job), job]));
    const runMap = new Map();
    const stats = {
      pagesTried: 0,
      pagesFetched: 0,
      candidates: 0,
      confident: 0,
      ambiguous: 0,
      aiCalls: 0,
      extracted: 0,
    };

    for (let page = 1; page <= pages; page++) {
      stats.pagesTried += 1;
      let fetched;
      try {
        fetched = await fetchCategoryPage(normalizedUrl, page);
      } catch (e) {
        if (page === 1) throw e;
        break;
      }

      stats.pagesFetched += 1;

      const extracted = await extractJobsSmartFast(
        fetched.html,
        fetched.pageUrl,
        categoryMode,
      );

      stats.candidates += extracted.stats.candidates;
      stats.confident += extracted.stats.confident;
      stats.ambiguous += extracted.stats.ambiguous;
      if (extracted.stats.aiUsed) stats.aiCalls += 1;
      stats.extracted += extracted.jobs.length;

      extracted.jobs.forEach((job) => {
        const key = canonicalJobKey(job);
        if (!key) return;
        const old = runMap.get(key);
        if (!old || job.title.length > old.title.length) runMap.set(key, job);
      });

      if (page > 1 && extracted.jobs.length === 0) break;
      if (page < pages) await sleep(200);
    }

    const mergedMap = new Map(previousMap);
    const newJobs = [];
    let newJobsCount = 0;

    runMap.forEach((job, key) => {
      const prev = mergedMap.get(key);
      if (!prev) {
        newJobsCount += 1;
        newJobs.push(job);
      }
      mergedMap.set(key, {
        ...job,
        createdAt: prev?.createdAt || job.createdAt || new Date(),
        updatedAt: new Date(),
      });
    });

    const mergedJobs = Array.from(mergedMap.values());

    const savedDoc = await govPostList.findOneAndUpdate(
      { url: normalizedUrl },
      {
        $set: {
          url: normalizedUrl,
          section: sectionFromUrl(normalizedUrl),
          jobs: mergedJobs,
          lastScraped: new Date(),
          categoryName: cleanText(name) || normalizedUrl,
        },
      },
      { upsert: true, new: true, runValidators: true },
    );

    if (!savedDoc) {
      throw new Error("Failed to save category data in govPostList");
    }

    return res.json({
      success: true,
      count: savedDoc.jobs?.length || mergedJobs.length,
      newJobsCount,
      newJobs,
      jobs: Array.from(runMap.values()),
      totalInDB: savedDoc.jobs?.length || mergedJobs.length,
      categoryUrl: normalizedUrl,
      categoryName: cleanText(name) || null,
      mode: categoryMode,
      speed: stats,
    });
  } catch (error) {
    console.error("Category scrape error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export { getCategories, scrapeCategory };

import axios from "axios";
import * as cheerio from "cheerio";
import { URL } from "node:url";
import crypto from "crypto";

import { GoogleGenerativeAI } from "@google/generative-ai";

import Post from "../../models/govJob/govJob.mjs";
import Site from "../../models/govJob/scrapperSite.mjs";
import getActiveAIConfig, {
  markKeyFailure,
  markKeySuccess,
} from "../../utils/aiKey.mjs";
import buildPrompt from "./prompt.mjs";
import rephraseTitle from "../../utils/rephraser.js";

const UA_HEADERS = { "User-Agent": "Mozilla/5.0" };

const cleanText = (t) =>
  (t || "").replace(/\s+/g, " ").replace(/,/g, "").trim();

const normalizeSemantic = (v) => cleanText(v).toLowerCase();

const INVALID_VALUES = [
  "notify later",
  "will be updated",
  "available soon",
  "to be announced",
  "tba",
  "na",
  "n/a",
];

// ---------------- URL Canonicalization ----------------
const normalizePath = (inputUrl) => {
  if (!inputUrl) return null;
  let url = inputUrl.trim().split("#")[0].split("?")[0];
  try {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      const parsed = new URL(url);
      url = parsed.pathname;
    }
  } catch {}
  if (!url.startsWith("/")) url = "/" + url;
  if (url.length > 1 && url.endsWith("/")) url = url.slice(0, -1);
  return url;
};

const buildCanonical = (jobUrl) => {
  const u = new URL(jobUrl);
  const pathname = u.pathname.endsWith("/") && u.pathname.length > 1
    ? u.pathname.slice(0, -1)
    : u.pathname;

  // Normalize host to lower to avoid duplicates for case differences or scheme flips
  const host = u.host.toLowerCase();
  const canonicalUrl = `${u.protocol}//${host}${pathname}`;

  return { canonicalUrl, path: pathname };
};

const buildLegacyPaths = (jobUrl, path) => {
  const variants = new Set();
  const legacyPath = normalizePath(jobUrl);

  if (legacyPath) {
    variants.add(legacyPath);
    if (!legacyPath.endsWith("/")) variants.add(`${legacyPath}/`);
  }

  if (path) {
    variants.add(path);
    if (!path.endsWith("/")) variants.add(`${path}/`);
  }

  return [...variants];
};

const buildDedupeFilter = ({
  canonicalUrl,
  path,
  pageHash,
  contentSignature,
  semanticSignature,
  legacyPaths = [],
  sourceUrls = [],
  titles = [],
  advertisementNumbers = [],
}) => {
  const ors = [];
  if (contentSignature) ors.push({ contentSignature });
  if (semanticSignature) ors.push({ semanticSignature });
  if (canonicalUrl) ors.push({ canonicalUrl });
  if (path) ors.push({ path });
  if (pageHash) ors.push({ pageHash });

  legacyPaths.filter(Boolean).forEach((p) => {
    ors.push({ url: p });
    ors.push({ path: p });
  });

  sourceUrls.filter(Boolean).forEach((s) => {
    ors.push({ sourceUrlFull: s });
    ors.push({ sourceUrl: s });
  });

   titles
    .map((t) => cleanText(t))
    .filter(Boolean)
    .forEach((t) => {
      ors.push({ "recruitment.title": t });
      ors.push({ title: t });
    });

  advertisementNumbers
    .map((a) => cleanText(a))
    .filter(Boolean)
    .forEach((a) => {
      ors.push({ "recruitment.advertisementNumber": a });
      ors.push({ "recruitment.advertisementNo": a });
    });

  if (!ors.length) return { canonicalUrl: null }; // never true, but keeps query valid
  if (ors.length === 1) return ors[0];
  return { $or: ors };
};

// ---------------- Stable hashing ----------------
const generateStableHash = ($) => {
  // basic "noise reduction": remove script/style + excessive footer/menus if needed
  $("script,noscript,style").remove();

  const text = cleanText($("body").find("table, p, li").text())
    // strip common noise patterns:
    .replace(/updated\s*on\s*[:\-]?\s*\w.+/gi, "")
    .replace(/last\s*updated\s*[:\-]?\s*\w.+/gi, "")
    .replace(/\b\d{1,2}\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\w*\s*\d{2,4}\b/gi, (m) => m.toLowerCase()); // normalize dates text-ish

  return crypto.createHash("md5").update(text).digest("hex");
};

// ---------------- Scrape raw HTML ----------------
const scrapeHTML = ($, jobUrl) => {
  const data = {
    url: jobUrl,
    title: $("title").text().trim(),
    headings: { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] },
    links: [],
    tables: [],
    lists: { ul: [], ol: [] },
    paragraphs: [],
  };

  ["h1", "h2", "h3", "h4", "h5", "h6"].forEach((t) => {
    $(t).each((_, el) => data.headings[t].push(cleanText($(el).text())));
  });

  $("p").each((_, el) => data.paragraphs.push(cleanText($(el).text())));

  $("a").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    try {
      data.links.push({
        text: cleanText($(el).text()),
        href: new URL(href, jobUrl).href,
      });
    } catch {}
  });

  $("table").each((_, t) => {
    const rows = [];
    $(t)
      .find("tr")
      .each((_, r) => {
        const cells = [];
        $(r)
          .find("td,th")
          .each((_, c) => cells.push({ text: cleanText($(c).text()) }));
        rows.push({ cells });
      });
    data.tables.push({ rows });
  });

  $("ul").each((_, u) => {
    const items = [];
    $(u)
      .children("li")
      .each((_, l) => items.push({ text: cleanText($(l).text()) }));
    data.lists.ul.push({ items });
  });

  $("ol").each((_, o) => {
    const items = [];
    $(o)
      .children("li")
      .each((_, l) => items.push({ text: cleanText($(l).text()) }));
    data.lists.ol.push({ items });
  });

  return data;
};

const minifyDataForAI = (scrapedData) => ({
  url: scrapedData.url,
  title: scrapedData.title,
  headings: scrapedData.headings,
  tables: scrapedData.tables.map((t) => ({
    rows: t.rows.map((r) => ({
      cells: r.cells.map((c) => c.text),
    })),
  })),
  lists: {
    ul: scrapedData.lists.ul.map((l) => ({
      items: l.items.map((i) => i.text),
    })),
    ol: scrapedData.lists.ol.map((l) => ({
      items: l.items.map((i) => i.text),
    })),
  },
  paragraphs: scrapedData.paragraphs.slice(0, 120),
  links: scrapedData.links.slice(0, 200).map((l) => ({ text: l.text, href: l.href })),
});

// ---------------- AI call (hardened) ----------------
const callPerplexity = async ({ apiKey, modelName, prompt }) => {
  const res = await axios.post(
    "https://api.perplexity.ai/chat/completions",
    {
      model: modelName,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 2048,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 45000,
    }
  );

  const text = res?.data?.choices?.[0]?.message?.content;
  return JSON.parse(text);
};

const formatWithAI = async (scrapedData) => {
  const tried = new Set();
  let lastError = null;
  const prompt = buildPrompt(minifyDataForAI(scrapedData), {}, "FULL");

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
          model: cfg.modelName,
          generationConfig: { responseMimeType: "application/json" },
        });
        const res = await model.generateContent(prompt);
        parsed = JSON.parse(res.response.text());
      } else {
        parsed = await callPerplexity({
          apiKey: cfg.apiKey,
          modelName: cfg.modelName,
          prompt,
        });
      }

      // Minimal sanity
      if (!parsed || typeof parsed !== "object") {
        throw new Error("AI returned invalid JSON object");
      }

      await markKeySuccess({ provider: cfg.provider, keyId: cfg.keyId });
      return parsed;
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

// ---------------- Deterministic content signature ----------------
// NOTE: title removed to avoid rephrase/non-deterministic differences.
const dropEmpty = (obj) => {
  if (Array.isArray(obj)) {
    const arr = obj
      .map((v) => dropEmpty(v))
      .filter((v) => v !== undefined && v !== null && v !== "");
    return arr.length ? arr : undefined;
  }
  if (obj && typeof obj === "object") {
    const out = {};
    Object.entries(obj).forEach(([k, v]) => {
      const cleaned = dropEmpty(v);
      if (cleaned !== undefined && cleaned !== null && cleaned !== "") {
        out[k] = cleaned;
      }
    });
    return Object.keys(out).length ? out : undefined;
  }
  if (typeof obj === "string") {
    const t = cleanText(obj);
    return t === "" ? undefined : t;
  }
  return obj;
};

const sortKeysDeep = (val) => {
  if (Array.isArray(val)) {
    return val.map(sortKeysDeep).sort((a, b) => {
      const sa = JSON.stringify(a);
      const sb = JSON.stringify(b);
      return sa.localeCompare(sb);
    });
  }
  if (val && typeof val === "object") {
    return Object.keys(val)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortKeysDeep(val[key]);
        return acc;
      }, {});
  }
  return typeof val === "string" ? val.toLowerCase() : val;
};

const buildContentSignature = (data) => {
  const r = data?.recruitment || {};
  const signature = {
    // title intentionally excluded
    advertisementNumber: r.advertisementNumber || r.advertisementNo,
    organization: r.organization || r.orgName,
    vacancyDetails: r.vacancyDetails,
    importantDates: r.importantDates,
    // fallback: if above missing, use some stable-ish extracted anchors:
    // do NOT use sourceUrl here (it differs across mirrors)
  };

  const cleaned = dropEmpty(signature);
  if (!cleaned) return null;

  const sorted = sortKeysDeep(cleaned);
  return crypto.createHash("md5").update(JSON.stringify(sorted)).digest("hex");
};

// A softer, title-aware signature to catch near-duplicates when contentSignature is null
const buildSemanticSignature = (data) => {
  if (!data) return null;
  const r = data.recruitment || {};

  const sig = {
    title: cleanText(r.title || data.title || ""),
    org: cleanText(r.organization?.name || r.organization || ""),
    adv: cleanText(r.advertisementNumber || r.advertisementNo || ""),
  };

  const cleaned = dropEmpty(sig);
  if (!cleaned) return null;

  return crypto
    .createHash("md5")
    .update(JSON.stringify(sortKeysDeep(cleaned)))
    .digest("hex");
};

// ---------------- Update detection (same as your idea) ----------------
const UPDATE_SIGNALS = [
  { key: "examDate", regex: /exam\s*date\s*[:\-]?\s*(.+)/i },
  { key: "resultDate", regex: /result\s*(date|declared|released)\s*[:\-]?\s*(.+)/i },
  { key: "admitCardDate", regex: /admit\s*card\s*(date|released)\s*[:\-]?\s*(.+)/i },
  { key: "answerKeyReleaseDate", regex: /answer\s*key\s*(date|released)\s*[:\-]?\s*(.+)/i },
  { key: "correctionDate", regex: /correction\s*(date|window)\s*[:\-]?\s*(.+)/i },
  { key: "applicationLastDate", regex: /(last|closing)\s*date\s*[:\-]?\s*(.+)/i },
];

const detectUpdatesFromHTML = ($, post) => {
  const text = $("body").text();
  const updates = {};

  for (const s of UPDATE_SIGNALS) {
    const match = text.match(s.regex);
    if (!match) continue;

    const newVal = cleanText(match[match.length - 1]);
    const oldVal = post.recruitment?.importantDates?.[s.key] || "";

    const n = normalizeSemantic(newVal);
    if (!n || INVALID_VALUES.some((x) => n.includes(x))) continue;

    if (normalizeSemantic(oldVal) !== n) {
      updates[s.key] = newVal;
    }
  }

  return updates;
};

// ---------------- Main scrapper (robust) ----------------
const scrapper = async (req, res) => {
  try {
    let jobUrl = req.body.url;
    if (!jobUrl) return res.status(400).json({ error: "URL Required" });

    // If path-only, attach latest Site base
    if (jobUrl.startsWith("/")) {
      const site = await Site.findOne().sort({ createdAt: -1 }).lean();
      if (!site?.url) return res.status(400).json({ error: "Base site not configured" });
      jobUrl = site.url.replace(/\/$/, "") + jobUrl;
    }

    // canonicalize
    const { canonicalUrl, path } = buildCanonical(jobUrl);
    const sourceUrlFull = jobUrl;

    // Fetch page (needed both cases for pageHash and updates)
    const response = await axios.get(sourceUrlFull, { headers: UA_HEADERS, timeout: 25000 });
    const $ = cheerio.load(response.data);
    const pageHash = generateStableHash($);

    // Legacy variants used by older records (path + trailing slash variants)
    const legacyPaths = buildLegacyPaths(jobUrl, path);
    const sourceVariants = [sourceUrlFull, jobUrl];

    // 1) Fast lookup across multiple stable keys to prevent duplicates
    const rawTitle = $("title").text().trim();
    const dedupeFilterBase = buildDedupeFilter({
      canonicalUrl,
      path,
      pageHash,
      legacyPaths,
      sourceUrls: sourceVariants,
      titles: [rawTitle],
    });
    const existing = await Post.findOne(dedupeFilterBase).lean();

    if (existing) {
      // respond immediately with existing data
      res.json({ success: true, action: "EXISTING_DATA", data: existing });

      // background refresh (safe patch, no new docs)
      setImmediate(async () => {
        try {
          const baseSet = {
            canonicalUrl,
            path,
            sourceUrlFull,
            url: path,
            sourceUrl: sourceUrlFull,
            pageHash,
            contentSignature: existing.contentSignature || buildContentSignature(existing),
            semanticSignature: existing.semanticSignature || buildSemanticSignature(existing),
            updatedAt: new Date(),
          };

          if (existing.pageHash === pageHash) {
            await Post.updateOne({ _id: existing._id }, { $set: baseSet });
            return;
          }

          const updates = detectUpdatesFromHTML($, existing);
          const updateObj = { ...baseSet };

          for (const [k, v] of Object.entries(updates)) {
            updateObj[`recruitment.importantDates.${k}`] = v;
          }

          await Post.updateOne({ _id: existing._id }, { $set: updateObj });
        } catch (e) {
          console.error("Background refresh failed:", e.message);
        }
      });

      return;
    }

    // 2) Not found by canonicalUrl => scrape + AI
    const scraped = scrapeHTML($, sourceUrlFull);

    let aiData;
    try {
      aiData = await formatWithAI(scraped);
    } catch (aiErr) {
      // AI failed => still save a minimal record via canonicalUrl unique upsert
      const minimal = {
        canonicalUrl,
        path,
        sourceUrlFull,
        url: path,
        sourceUrl: sourceUrlFull,
        pageHash,
        title: scraped.title,
        recruitment: { title: scraped.headings?.h1?.[0] || scraped.title },
      };

      const semanticSignature = buildSemanticSignature(minimal);

      const doc = await Post.findOneAndUpdate(
        buildDedupeFilter({
          canonicalUrl,
          path,
          pageHash,
          semanticSignature,
          legacyPaths,
          sourceUrls: sourceVariants,
          titles: [minimal.title, minimal.recruitment?.title],
        }),
        {
          $setOnInsert: { ...minimal, semanticSignature },
          $set: { updatedAt: new Date() },
        },
        { upsert: true, new: true }
      ).lean();

      return res.json({ success: true, action: "CREATED_MINIMAL_AI_FAILED", data: doc });
    }

    // Rephrase title but keep signature stable (title excluded from signature)
    if (aiData?.recruitment?.title) {
      aiData.recruitment.title = rephraseTitle(aiData.recruitment.title);
    } else if (aiData?.title) {
      aiData.title = rephraseTitle(aiData.title);
    }

    // Build signatures (hard + soft)
    const contentSignature = buildContentSignature(aiData);
    const semanticSignature = buildSemanticSignature(aiData);

    // Final document shape
    const finalData = {
      ...aiData,
      canonicalUrl,
      path,
      sourceUrlFull,
      url: path, // backward compat
      sourceUrl: sourceUrlFull, // backward compat
      pageHash,
      contentSignature,
      semanticSignature,
      updatedAt: new Date(),
    };

    // 3) Single atomic upsert across multiple dedupe keys to avoid new duplicates
    const dedupeFilter = buildDedupeFilter({
      canonicalUrl,
      path,
      pageHash,
      contentSignature,
      semanticSignature,
      legacyPaths,
      sourceUrls: sourceVariants,
      titles: [aiData?.recruitment?.title, aiData?.title],
      advertisementNumbers: [
        aiData?.recruitment?.advertisementNumber,
        aiData?.recruitment?.advertisementNo,
      ],
    });

    const now = new Date();
    const saved = await Post.findOneAndUpdate(
      dedupeFilter,
      {
        $set: finalData,
        $setOnInsert: { createdAt: now },
      },
      { upsert: true, new: true }
    ).lean();

    const isNew =
      saved?.createdAt &&
      Math.abs(now.getTime() - new Date(saved.createdAt).getTime()) < 5000 &&
      saved._id?.toString() !== existing?._id?.toString();

    const action = isNew ? "CREATED_NEW" : "PATCHED_EXISTING";

    return res.json({ success: true, action, data: saved });
  } catch (e) {
    // Duplicate key safety: if unique index triggered, re-fetch and return patched
    if (e?.code === 11000) {
      try {
        const jobUrl = req.body.url;
        let full = jobUrl;
        if (jobUrl && jobUrl.startsWith("/")) {
          const site = await Site.findOne().sort({ createdAt: -1 }).lean();
          full = site?.url ? site.url.replace(/\/$/, "") + jobUrl : jobUrl;
        }
        const { canonicalUrl } = buildCanonical(full);
        const doc = await Post.findOne({ canonicalUrl }).lean();
        if (doc) return res.json({ success: true, action: "PATCHED_EXISTING", data: doc });
      } catch {}
    }

    console.error("Scrapper Error:", e.message);
    return res.status(500).json({ success: false, error: e.message });
  }
};

export { scrapper };

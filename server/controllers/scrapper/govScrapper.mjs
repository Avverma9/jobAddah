import axios from "axios";
import * as cheerio from "cheerio";
import { URL } from "node:url";
import crypto from "crypto";
import { GoogleGenerativeAI } from "@google/generative-ai";

import Post from "../../models/govJob/govJob.mjs";
import Site from "../../models/govJob/scrapperSite.mjs";
import getActiveAIConfig from "../../utils/aiKey.mjs";
import buildPrompt from "./prompt.mjs";

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

const generateStableHash = ($) => {
  const text = cleanText($("body").find("table, p, li").text());
  return crypto.createHash("md5").update(text).digest("hex");
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
  paragraphs: scrapedData.paragraphs.slice(0, 100),
  links: scrapedData.links.map((l) => ({ text: l.text, href: l.href })),
});

const formatWithAI = async (scrapedData) => {
  const { apiKey, modelName } = await getActiveAIConfig();
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = buildPrompt(minifyDataForAI(scrapedData), {}, "FULL");
  const res = await model.generateContent(prompt);
  return JSON.parse(res.response.text());
};

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

const scrapper = async (req, res) => {
  try {
    let jobUrl = req.body.url;
    if (!jobUrl) return res.status(400).json({ error: "URL Required" });

    if (jobUrl.startsWith("/")) {
      const site = await Site.findOne().sort({ createdAt: -1 }).lean();
      jobUrl = site.url.replace(/\/$/, "") + jobUrl;
    }

    const u = new URL(jobUrl);
    const cleanUrl = u.origin + u.pathname;

    const existingCheck = await Post.findOne(
      { $or: [{ url: cleanUrl }, { sourceUrl: jobUrl }] },
      { _id: 1, pageHash: 1 }
    )
      .lean()
      .select("_id pageHash");

    if (existingCheck) {
      const [fullPost, response] = await Promise.all([
        Post.findById(existingCheck._id).lean(),
        axios.get(jobUrl, {
          headers: { "User-Agent": "Mozilla/5.0" },
          timeout: 20000,
        }),
      ]);

      res.json({
        success: true,
        action: "EXISTING_DATA",
        data: fullPost,
      });

      setImmediate(async () => {
        try {
          const $ = cheerio.load(response.data);
          const pageHash = generateStableHash($);

          if (existingCheck.pageHash === pageHash) {
            return;
          }

          const updates = detectUpdatesFromHTML($, fullPost);

          if (!Object.keys(updates).length) {
            await Post.updateOne(
              { _id: existingCheck._id },
              { $set: { pageHash, updatedAt: new Date() } }
            );
            return;
          }

          const updateObj = {};
          for (const [key, value] of Object.entries(updates)) {
            updateObj[`recruitment.importantDates.${key}`] = value;
          }
          updateObj.pageHash = pageHash;
          updateObj.updatedAt = new Date();

          await Post.updateOne({ _id: existingCheck._id }, { $set: updateObj });
        } catch (bgError) {
          console.error("Background update failed:", bgError.message);
        }
      });

      return;
    }

    const response = await axios.get(jobUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 20000,
    });

    const $ = cheerio.load(response.data);
    const pageHash = generateStableHash($);
    const scraped = scrapeHTML($, jobUrl);
    const aiData = await formatWithAI(scraped);

    aiData.url = cleanUrl;
    aiData.sourceUrl = jobUrl;
    aiData.pageHash = pageHash;

    const saved = await new Post(aiData).save();

    return res.json({
      success: true,
      action: "CREATED_NEW",
      data: saved,
    });
  } catch (e) {
    console.error("Scrapper Error:", e.message);
    res.status(500).json({
      success: false,
      error: e.message,
    });
  }
};

export { scrapper };

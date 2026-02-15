import Site from "../../models/govJob/scrapperSite.mjs";
import Section from "../../models/govJob/govSection.mjs";
import axios from "axios";
import * as cheerio from "cheerio";
import { URL } from "node:url";

const http = axios.create({
  timeout: 15000,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; JobsAddahBot/1.0)",
  },
  maxRedirects: 5,
});



// ================= HELPERS =================

const cleanText = (value) =>
  String(value || "").replace(/\s+/g, " ").trim();

const normalizeHost = (host) =>
  String(host || "").toLowerCase().replace(/^www\./, "").trim();

const normalizeUrl = (inputUrl) => {
  if (!inputUrl) return null;

  let raw = String(inputUrl).trim();
  if (!raw.startsWith("http")) raw = "https://" + raw;

  try {
    const u = new URL(raw);
    u.hash = "";
    u.search = "";

    let path = u.pathname.replace(/\/+$/, "");
    if (!path) path = "/";

    return `${u.protocol}//${normalizeHost(u.host)}${path}`;
  } catch {
    return null;
  }
};


// Only allow real job categories
const ALLOWED_TERMS = [
  "job",
  "latest",
  "result",
  "admit",
  "answer",
  "syllabus",
  "admission",
  "vacancy",
];



// ================= SCRAPE CATEGORIES =================

const scrapeCategory = async (req, res) => {
  try {
    let targetUrl = req.body?.url || req.query?.url;

    // If not provided, load from Site model
    if (!targetUrl) {
      const siteDoc = await Site.findOne().sort({ createdAt: -1 }).lean();
      if (!siteDoc?.url)
        return res.status(400).json({ error: "No site configured" });

      targetUrl = siteDoc.url;
    }

    const baseUrl = normalizeUrl(targetUrl);
    if (!baseUrl)
      return res.status(400).json({ error: "Invalid URL" });

    const response = await http.get(baseUrl);
    const $ = cheerio.load(response.data);

    const categories = [];
    const seen = new Set();
    const host = normalizeHost(new URL(baseUrl).host);

    // Only scan navigation menu
    $("nav a, .menu a, #primary-menu a, .navbar a").each((_, el) => {
      const name = cleanText($(el).text());
      const href = $(el).attr("href");

      if (!name || !href) return;

      try {
        const full = new URL(href, baseUrl).href;
        const parsed = new URL(full);

        // Same host only
        if (normalizeHost(parsed.host) !== host) return;

        const normalized = normalizeUrl(full);
        if (!normalized) return;

        const lowerName = name.toLowerCase();
        const lowerPath = parsed.pathname.toLowerCase();

        const isAllowed =
          ALLOWED_TERMS.some((k) => lowerName.includes(k)) ||
          ALLOWED_TERMS.some((k) => lowerPath.includes(k));

        if (!isAllowed) return;

        if (seen.has(normalized)) return;
        seen.add(normalized);

        categories.push({
          name,
          link: normalized,
        });
      } catch {}
    });

    const finalCategories = categories.slice(0, 20);

    await Section.findOneAndUpdate(
      { url: baseUrl },
      { $set: { url: baseUrl, categories: finalCategories } },
      { upsert: true, new: true }
    );

    return res.json({
      success: true,
      site: baseUrl,
      count: finalCategories.length,
      categories: finalCategories,
    });
  } catch (err) {
    console.error("Scrape category error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};



// ================= GET SAVED CATEGORIES =================

const getCategories = async (req, res) => {
  try {
    let targetUrl = req.query?.url;

    if (!targetUrl) {
      const siteDoc = await Site.findOne().sort({ createdAt: -1 }).lean();
      if (!siteDoc?.url)
        return res.status(404).json({ error: "No site configured" });

      targetUrl = siteDoc.url;
    }

    const baseUrl = normalizeUrl(targetUrl);
    const doc = await Section.findOne({ url: baseUrl }).lean();

    return res.json({
      success: true,
      site: baseUrl,
      count: doc?.categories?.length || 0,
      categories: doc?.categories || [],
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};



export { scrapeCategory, getCategories };

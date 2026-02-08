import Site from "../../models/govJob/scrapperSite.mjs";
import govPostList from "../../models/govJob/govPostListBycatUrl.mjs";
import Section from "../../models/govJob/govSection.mjs";
import * as cheerio from "cheerio";
import axios from "axios";
import { URL } from "node:url";
const getCategories = async (req, res) => {
  try {
    const siteUrl = await Site.find();
    if (!siteUrl.length)
      return res.status(404).json({ error: "No site configured" });

    const rawUrl = siteUrl[0].url;
    let targetUrl = rawUrl.trim();
    if (!targetUrl.startsWith("http")) targetUrl = "https://" + targetUrl;

    const response = await axios.get(targetUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    let categories = [];
    const ignore = [
      "Home",
      "Contact Us",
      "Privacy Policy",
      "Disclaimer",
      "More",
      "About Us",
      "Sitemap",
    ];

    $("nav a, .menu a, ul.navigation a, .nav-menu a, #primary-menu a").each(
      (_, el) => {
        const name = $(el).text().trim();
        const href = $(el).attr("href");
        if (!name || !href || href === "#" || href === "/") return;
        if (ignore.includes(name)) return;

        const fullLink = new URL(href, targetUrl).href;
        categories.push({ name, link: fullLink });
      }
    );

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
    if (!categoryUrl) return res.status(400).json({ error: "URL Required" });

    const response = await axios.get(categoryUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const $ = cheerio.load(response.data);
    let jobs = [];

    $(".post-link, .entry-title a, .post h2 a, ul li a").each((_, el) => {
      const title = $(el).text().trim();
      const link = $(el).attr("href");
      if (title && title.length > 10 && link) {
        const fullLink = new URL(link, categoryUrl).href;
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

export { getCategories, scrapeCategory };

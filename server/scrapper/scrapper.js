const axios = require("axios");
const cheerio = require("cheerio");
const url = require("url");
const Post = require("../models/jobs");
const postList = require("../models/postList");
const Section = require("../models/section");

const cleanText = (text) => {
  if (!text) return "";
  return text.replace(/\s+/g, " ").trim();
};

const ensureProtocol = (inputUrl) => {
  if (!inputUrl) return null;
  let clean = inputUrl.trim();
  if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
    clean = "https://" + clean;
  }
  return clean;
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
      scrapedData.headings.h1.push({ text: cleanText($(el).text()), html: $(el).html(), index: i })
    );

    $("h2").each((i, el) =>
      scrapedData.headings.h2.push({ text: cleanText($(el).text()), html: $(el).html(), index: i })
    );

    $("h3").each((i, el) =>
      scrapedData.headings.h3.push({ text: cleanText($(el).text()), html: $(el).html(), index: i })
    );

    $("h4").each((i, el) =>
      scrapedData.headings.h4.push({ text: cleanText($(el).text()), html: $(el).html(), index: i })
    );

    $("h5").each((i, el) =>
      scrapedData.headings.h5.push({ text: cleanText($(el).text()), html: $(el).html(), index: i })
    );

    $("h6").each((i, el) =>
      scrapedData.headings.h6.push({ text: cleanText($(el).text()), html: $(el).html(), index: i })
    );

    $("a").each((i, el) => {
      const href = $(el).attr("href");
      const text = cleanText($(el).text());
      if (!href) return;

      try {
        const fullUrl = new url.URL(href, jobUrl).href;
        scrapedData.links.push({
          text,
          href,
          fullUrl,
          title: $(el).attr("title") || "",
          target: $(el).attr("target") || "",
          class: $(el).attr("class") || "",
          id: $(el).attr("id") || "",
          parent: $(el).parent().prop("tagName"),
          index: i,
        });
      } catch {
        scrapedData.links.push({ text, href, fullUrl: href, index: i });
      }
    });

    $("img").each((i, el) => {
      const src = $(el).attr("src");
      if (!src) return;

      try {
        const fullUrl = new url.URL(src, jobUrl).href;
        scrapedData.images.push({
          src,
          fullUrl,
          alt: $(el).attr("alt") || "",
          title: $(el).attr("title") || "",
          width: $(el).attr("width") || "",
          height: $(el).attr("height") || "",
          class: $(el).attr("class") || "",
          index: i,
        });
      } catch {
        scrapedData.images.push({ src, alt: $(el).attr("alt") || "", index: i });
      }
    });

    $("table").each((tableIndex, table) => {
      const tableData = {
        index: tableIndex,
        class: $(table).attr("class") || "",
        id: $(table).attr("id") || "",
        rows: [],
        rawHTML: $(table).html(),
      };

      $(table)
        .find("tr")
        .each((rowIndex, row) => {
          const rowData = { index: rowIndex, cells: [] };

          $(row)
            .find("td, th")
            .each((cellIndex, cell) => {
              const $cell = $(cell);
              const cellData = {
                index: cellIndex,
                tag: cell.tagName.toLowerCase(),
                text: cleanText($cell.text()),
                html: $cell.html(),
                colspan: $cell.attr("colspan") || "1",
                rowspan: $cell.attr("rowspan") || "1",
                class: $cell.attr("class") || "",
                style: $cell.attr("style") || "",
              };

              const cellLinks = [];
              $cell.find("a").each((_, link) => {
                const href = $(link).attr("href");
                if (!href) return;

                try {
                  cellLinks.push({
                    text: cleanText($(link).text()),
                    href,
                    fullUrl: new url.URL(href, jobUrl).href,
                  });
                } catch {
                  cellLinks.push({ text: cleanText($(link).text()), href });
                }
              });

              if (cellLinks.length) cellData.links = cellLinks;

              const cellLists = [];
              $cell.find("ul, ol").each((_, list) => {
                const items = [];
                $(list)
                  .find("li")
                  .each((_, li) => items.push(cleanText($(li).text())));

                cellLists.push({
                  type: list.tagName.toLowerCase(),
                  items,
                });
              });

              if (cellLists.length) cellData.lists = cellLists;

              rowData.cells.push(cellData);
            });

          tableData.rows.push(rowData);
        });

      scrapedData.tables.push(tableData);
    });

    $("ul").each((ulIndex, ul) => {
      const listData = {
        index: ulIndex,
        class: $(ul).attr("class") || "",
        id: $(ul).attr("id") || "",
        items: [],
      };

      $(ul)
        .children("li")
        .each((liIndex, li) => {
          const itemData = {
            index: liIndex,
            text: cleanText($(li).text()),
            html: $(li).html(),
          };

          const liLinks = [];
          $(li)
            .find("a")
            .each((_, link) => {
              const href = $(link).attr("href");
              if (!href) return;

              try {
                liLinks.push({
                  text: cleanText($(link).text()),
                  href,
                  fullUrl: new url.URL(href, jobUrl).href,
                });
              } catch {
                liLinks.push({ text: cleanText($(link).text()), href });
              }
            });

          if (liLinks.length) itemData.links = liLinks;
          listData.items.push(itemData);
        });

      scrapedData.lists.ul.push(listData);
    });

    $("ol").each((olIndex, ol) => {
      const listData = {
        index: olIndex,
        class: $(ol).attr("class") || "",
        id: $(ol).attr("id") || "",
        items: [],
      };

      $(ol)
        .children("li")
        .each((liIndex, li) => {
          const itemData = {
            index: liIndex,
            text: cleanText($(li).text()),
            html: $(li).html(),
          };

          const liLinks = [];
          $(li)
            .find("a")
            .each((_, link) => {
              const href = $(link).attr("href");
              if (!href) return;

              try {
                liLinks.push({
                  text: cleanText($(link).text()),
                  href,
                  fullUrl: new url.URL(href, jobUrl).href,
                });
              } catch {
                liLinks.push({ text: cleanText($(link).text()), href });
              }
            });

          if (liLinks.length) itemData.links = liLinks;
          listData.items.push(itemData);
        });

      scrapedData.lists.ol.push(listData);
    });

    $("p").each((i, p) => {
      const text = cleanText($(p).text());
      if (!text) return;

      scrapedData.paragraphs.push({
        index: i,
        text,
        html: $(p).html(),
        class: $(p).attr("class") || "",
        style: $(p).attr("style") || "",
      });
    });

    $("section").each((i, section) => {
      scrapedData.sections.push({
        index: i,
        id: $(section).attr("id") || "",
        class: $(section).attr("class") || "",
        text: cleanText($(section).text()),
        html: $(section).html(),
      });
    });

    $("div").each((i, div) => {
      const text = cleanText($(div).text());
      if (!text || text.length < 10 || text.length > 5000) return;

      scrapedData.divs.push({
        index: i,
        id: $(div).attr("id") || "",
        class: $(div).attr("class") || "",
        text,
      });
    });

    $("form").each((i, form) => {
      const formData = {
        index: i,
        action: $(form).attr("action") || "",
        method: $(form).attr("method") || "",
        id: $(form).attr("id") || "",
        class: $(form).attr("class") || "",
        inputs: [],
      };

      $(form)
        .find("input, textarea, select")
        .each((_, input) => {
          formData.inputs.push({
            type: $(input).attr("type") || input.tagName.toLowerCase(),
            name: $(input).attr("name") || "",
            id: $(input).attr("id") || "",
            placeholder: $(input).attr("placeholder") || "",
            value: $(input).attr("value") || "",
            required: $(input).attr("required") !== undefined,
          });
        });

      scrapedData.forms.push(formData);
    });

    $('button, input[type="button"], input[type="submit"]').each((i, btn) => {
      scrapedData.buttons.push({
        index: i,
        text: cleanText($(btn).text()) || $(btn).attr("value") || "",
        type: $(btn).attr("type") || "",
        class: $(btn).attr("class") || "",
        id: $(btn).attr("id") || "",
      });
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
        "h4",
        "h5",
        "h6",
        "strong",
        "b",
        "i",
        "em",
      ];

      if (validTags.includes(tag)) {
        scrapedData.allText.push({
          tag,
          text: cleanText(text),
          class: $(el).attr("class") || "",
          style: $(el).attr("style") || "",
        });
      }
    });

    await Post.findOneAndUpdate(
      { url: scrapedData.url },
      { $set: scrapedData },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: scrapedData,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message, stack: error.stack });
  }
};

const getCategories = async (req, res) => {
  try {
    const rawUrl = "sarkariresult.com.cm";
    const targetUrl = ensureProtocol(rawUrl);
    if (!targetUrl) return res.status(400).json({ error: "Invalid URL" });

    const response = await axios.get(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "text/html",
      },
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
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
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

    const uniqueJobs = [
      ...new Map(jobs.map((i) => [i.link, i])).values(),
    ];

    await postList.findOneAndUpdate(
      { url: categoryUrl },
      { $set: { url: categoryUrl, jobs: uniqueJobs } },
      { upsert: true, new: true }
    );

    res.json({ success: true, count: uniqueJobs.length, jobs: uniqueJobs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { scrapper, getCategories, scrapeCategory };

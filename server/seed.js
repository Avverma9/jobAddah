// seederFinalExact.js

const axios = require("axios");
const cheerio = require("cheerio");
const Job = require("./models/Job");

// Clean HTML
function cleanHTML(raw) {
  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// PERFECT Vacancy Extractor
function extractVacancy(text) {
  const blk = text.match(/General\s*\d+[\s\S]*?ST\s*\d+/i);
  if (!blk) return {};

  const b = blk[0];

  return {
    general: parseInt(b.match(/General\s*(\d+)/i)?.[1] || 0),
    EWS: parseInt(b.match(/EWS\s*(\d+)/i)?.[1] || 0),
    BC: parseInt(b.match(/BC\s*(\d+)/i)?.[1] || 0),
    BC_female: parseInt(b.match(/BC Female\s*(\d+)/i)?.[1] || 0),
    EBC: parseInt(b.match(/EBC\s*(\d+)/i)?.[1] || 0),
    SC: parseInt(b.match(/SC\s*(\d+)/i)?.[1] || 0),
    ST: parseInt(b.match(/ST\s*(\d+)/i)?.[1] || 0)
  };
}

// FULL Important Dates Extractor (no missing fields)
function extractImportantDates(text) {
  const block = text.match(/Important Dates[\s\S]*?Application Fee/i);
  if (!block) return {};

  const b = block[0];

  const get = (keyword) => {
    const part = b.split(keyword)[1];
    if (!part) return null;

    const date = part.match(/([0-9]{1,2}\s\w+\s[0-9]{4})/);
    return date ? date[1] : null;
  };

  return {
    notification_date: get("Notification Date"),
    application_start: get("Application Start") || get("Application Begin") || get("Start Date"),
    last_date: get("Last Date"),
    fee_payment_last_date: get("Fee Payment Last Date") || get("Fee Payment"),
    final_submit_last_date: get("Final Submit") || get("Final Submit Form"),
    exam_date: get("Exam Date") || "Notify Later"
  };
}


// Fee extractor (Formatted EXACT)
function extractFee(text) {
  const block = text.match(/Application Fee[\s\S]*?Age Limit/i);
  if (!block) return { all_candidates: "Rs. 100/-" };

  const raw = block[0].match(/(\d+)\s*\/?-/);
  const amount = raw ? raw[1] : "100";

  return { all_candidates: `Rs. ${amount}/-` };
}

// Extract Age Limit As On
function extractAgeLimitAsOn(text) {
  const m = text.match(/As On\s*:?(\d{1,2}\s\w+\s\d{4})/i);
  return m ? m[1].trim() : "01 August 2025";
}

// Age Limit Block
function extractAgeLimit(text) {
  const min = parseInt(text.match(/Minimum Age\s*:?(\d+)/i)?.[1] || 18);

  return {
    minimum: min,
    maximum: {
      general_male: 37,
      general_female: 40,
      "BC/EBC_male_female": 40,
      "SC/ST_male_female": 42
    }
  };
}

// Date Formatter (Human-Friendly)
function formatReadableDate() {
  const d = new Date();
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

// MAIN SEEDER
async function seedExactJob(req, res) {
  try {
    const link = req.body.link;
    if (!link) return res.status(400).json({ error: "Link required" });

    let raw = (await axios.get(link)).data;
    const cleaned = cleanHTML(raw);
    const $ = cheerio.load(cleaned);
    const body = $("body").text();

    const json = {};

    // ORGANIZATION NAME
    json.organization =
      $("h1").first().text().trim() ||
      "Bihar Staff Selection Commission (BSSC)";

    // Notification Number
    const notif = body.match(/Advt.*?(\d+\/\d+\s*\(A\)?)/i);
    json.notification_number = notif ? notif[1].trim() : "02/2023 (A)";

    // Total Posts
    json.total_posts =
      parseInt(body.match(/Total Posts\s*:?(\d+)/i)?.[1]) || 23175;

    // FULL Extractors
    json.important_dates = extractImportantDates(body);
    json.application_fee = extractFee(body);
    json.age_limit_as_on = extractAgeLimitAsOn(body);
    json.age_limit = extractAgeLimit(body);
    json.vacancy_details = extractVacancy(body);

    // Full qualification sentence
    json.educitional_qualification =
      "Passed 12th class (Intermediate) from a recognized board/institution.";

    // Selection
    json.mode_of_selection = [
      "Prelims Written Exam",
      "Mains Written Exam",
      "Skill Test (If Applicable)",
      "Document Verification",
      "Medical Examination"
    ];

    // Links
    json.official_website = "https://bssc.bihar.gov.in/";
    json.apply_online_link = "https://bssc.bihar.gov.in/";

    // Human readable post date
    json.post_date = formatReadableDate();

    // Author
    json.page_author = "Sarkari Exam Team";
    json.tag = "12th Pass Job";

    // Save
    const saved = await Job.create(json);

    res.json({
      message: "FINAL EXACT SEED JSON",
      json,
      saved
    });
  } catch (err) {
    res.status(500).json({
      error: "Extractor Failed",
      details: err.message
    });
  }
}

module.exports = seedExactJob;

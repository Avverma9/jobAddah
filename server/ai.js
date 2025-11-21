const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/jobaddah";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));
const ExamPost = require("./models/jobs");
function cleanHTML(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function extractWithGemini(rawText) {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  // Updated to the available model from your list
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    Extract data from this text into valid JSON format. Keys must include: postName, shortInfo, category, importantDates (array of label/value), applicationFee (array of category/amount), ageLimit (object with minAge, maxAge, asOnDate, details), vacancyDetails (array of postName, totalPost, eligibility), importantLinks (array of label, url).
    
    Do not use markdown. Return only raw JSON.
    
    Text:
    ${rawText.substring(0, 30000)}
    `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

app.post("/api/ai-scrape", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });

  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(data);
    const rawText = cleanHTML($("body").text());

    let aiResponse = await extractWithGemini(rawText);
    aiResponse = aiResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let jsonData;
    try {
      jsonData = JSON.parse(aiResponse);
    } catch (e) {
      const startIndex = aiResponse.indexOf("{");
      const endIndex = aiResponse.lastIndexOf("}");
      if (startIndex !== -1 && endIndex !== -1) {
        jsonData = JSON.parse(aiResponse.substring(startIndex, endIndex + 1));
      } else {
        return res
          .status(500)
          .json({ error: "AI returned invalid JSON", raw: aiResponse });
      }
    }

    jsonData.originalUrl = url;

    if (
      !jsonData.importantLinks ||
      jsonData.importantLinks.length === 0 ||
      !jsonData.importantLinks[0].url
    ) {
      const scrapedLinks = [];
      $("a").each((i, el) => {
        const href = $(el).attr("href");
        const label = $(el).text().trim();

        if (href && label && href.startsWith("http") && label.length > 2) {
          const isSocial =
            /whatsapp|instagram|telegram|twitter|youtube|share/i.test(label);
          const isRelevant =
            /apply|notification|online|click|download|official/i.test(label);

          if (!isSocial && isRelevant) {
            scrapedLinks.push({
              label: label.replace(/Click Here/i, "").trim() || "Direct Link",
              url: href,
              isNew: true,
            });
          }
        }
      });
      if (scrapedLinks.length > 0) jsonData.importantLinks = scrapedLinks;
    }

    const savedPost = await ExamPost.findOneAndUpdate(
      { postName: jsonData.postName },
      jsonData,
      { upsert: true, new: true }
    );

    res.status(200).json({
      status: "success",
      data: savedPost,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

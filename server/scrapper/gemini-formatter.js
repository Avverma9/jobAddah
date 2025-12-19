const axios = require("axios");

const formatWithAI = async (scrapedData) => {
  try {
    const prompt = `
You are a data formatting assistant. Convert the following scraped recruitment data into ONLY valid JSON.

Extract:
1. Recruitment title & organization
2. Important dates
3. Vacancies (total + post-wise)
4. Application fees
5. Age limits
6. Eligibility
7. Selection process
8. Important links

Scraped Data:
${JSON.stringify(scrapedData, null, 2)}

Return ONLY JSON like:
{
  "recruitment": {
    "title": "",
    "organization": {},
    "importantDates": {},
    "vacancyDetails": {
      "totalPosts": 0,
      "positions": []
    },
    "applicationFee": {},
    "ageLimit": {},
    "eligibility": {},
    "selectionProcess": [],
    "importantLinks": {}
  }
}
ONLY JSON. No extra words. No markdown.`;

    const key = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY;
    if (!key) throw new Error('GEMINI API key not set in environment');

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=" + key,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      }
    );

    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Extract JSON safely
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON detected from Gemini");

    return JSON.parse(jsonMatch[0]);

  } catch (err) {
    console.error("Gemini Formatting Error:", err);
    return null;
  }
};

module.exports = formatWithAI;

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

connectDB();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors({ origin: "*", credentials: false }));
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));

app.post('/api/v1/ai-chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("API Key is missing in .env file");
    }

    if (!message) {
      return res
        .status(400)
        .json({ success: false, message: "Message is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

    const prompt = `
You are an SSC / government jobs / exams / schemes assistant for Indian students and job seekers.

Strict rules:
- Agar user kisi job, exam, recruitment, scholarship, yojana, scheme, result, admit card, notification, syllabus, registration ya application form ke baare me poochhe,
  to SIRF official website aur official links hi batao.
- Kisi bhi third-party, private, blog, YouTube, coaching, news, ya unofficial website ka link MAT dena.
- Agar official website sure nahi ho, to clearly bolo ki official website confirm nahi hai, sirf likely domains jese gov.in, nic.in, ac.in, etc. ka naam bata sakte ho, lekin direct link tab bhi third-party nahi hoga.
- Hamesha links ko clean, well-formatted tarike se do jisse user ko samajhna easy ho:
  - Short heading
  - Niche bullet points me 1) URL 2) ye link kis kaam ka hai (e.g. apply online, notification PDF, login, result, etc.)
- Koi bhi non-official / third-party link kabhi mat likho.

User message:
"${message}"

Ab upar ke rules follow karte hue answer do.  
Answer concise, Hindi + simple English mix me ho sakta hai.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ success: true, reply: text });
  } catch (error) {
    console.error("FULL ERROR DETAILS:", error);
    return res.status(500).json({
      success: false,
      message: "AI service currently unavailable",
      errorDetail: error.message,
    });
  }
});

app.use('/api/v1', require('./routes/index'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

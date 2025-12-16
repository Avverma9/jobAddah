const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const Post = require("../models/govtpost");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Use flash model for speed, pro for better reasoning if needed
const modelName = "gemini-1.5-flash";

// --- 1. SMART KEYWORD EXTRACTION ---
const extractSearchTerms = (message) => {
  // Remove special chars and extra spaces
  const cleanMsg = message.toLowerCase().replace(/[^\w\s]/g, '').trim();
  
  // Hindi/English Stopwords to ignore during search
  const stopwords = new Set([
    'hi', 'hello', 'hey', 'kaise', 'ho', 'kya', 'hai', 'me', 'mein', 'ke', 'ki', 'ka', 'ko', 'se', 
    'par', 'pe', 'aur', 'karna', 'chahiye', 'batao', 'details', 'about', 'information', 'info',
    'the', 'is', 'am', 'are', 'was', 'were', 'for', 'to', 'in', 'on', 'at', 'please', 'tell'
  ]);

  return cleanMsg.split(/\s+/).filter(word => word.length > 1 && !stopwords.has(word));
};

// --- 2. HIGH PRECISION DATABASE SEARCH ---
const searchDatabase = async (userQuery) => {
  try {
    const terms = extractSearchTerms(userQuery);
    
    // If no meaningful terms (e.g., just "Hello kaise ho"), don't search
    if (terms.length === 0) return null;


    // STRATEGY 1: High Precision (AND Logic)
    // Result MUST contain ALL extracted terms (e.g. "SSC" AND "CGL")
    const strictConditions = terms.map(term => ({
      $or: [
        { postTitle: { $regex: term, $options: 'i' } },
        { organization: { $regex: term, $options: 'i' } },
        { slug: { $regex: term, $options: 'i' } }
      ]
    }));

    let results = await Post.find({ $and: strictConditions })
      .select("postTitle organization slug postType importantDates importantLinks")
      .limit(3)
      .lean();

    // STRATEGY 2: Fallback (Relaxed Logic)
    // If strict search fails, try to match at least one major term
    if (results.length === 0 && terms.length > 1) {
      const relaxedConditions = terms.map(term => ({
        postTitle: { $regex: term, $options: 'i' }
      }));
      
      results = await Post.find({ $or: relaxedConditions })
        .select("postTitle organization slug postType importantDates importantLinks")
        .limit(2)
        .lean();
    }

    if (results.length > 0) {
      return results;
    }
    
    return null;

  } catch (error) {
    console.error("❌ DB Search Error:", error);
    return null;
  }
};

// --- 3. FORMAT DATA FOR AI CONTEXT ---
const formatContextData = (jobs) => {
  if (!jobs || jobs.length === 0) return "";
  
  return JSON.stringify(jobs.map(job => ({
    title: job.postTitle,
    org: job.organization,
    slug: job.slug,
    link: `https://yourwebsite.com/${job.slug}`, // Update with your actual domain
    dates: job.importantDates?.map(d => `${d.label}: ${d.value || d.date}`).join(', ') || "Not specified",
    apply_links: job.importantLinks?.slice(0, 2).map(l => l.url).join(', ') || "Check website"
  })));
};

// --- 4. MAIN CONTROLLER ---
const aiAssistant = async (req, res) => {
  try {
    const { message } = req.body;

    if (!process.env.GEMINI_API_KEY) throw new Error("API Key Missing");
    if (!message) return res.status(400).json({ success: false, message: "Empty message" });


    // Step 1: Search DB (We search first, but let AI decide if it uses the data)
    const dbResults = await searchDatabase(message);
    const dataContext = formatContextData(dbResults);
    const hasData = !!dataContext;

    // Step 2: Construct the System Prompt
    // This is the "Brain" that decides how to behave
    const systemPrompt = `
    You are 'JobsAddah Assistant', a professional and friendly career guide for Indian students.
    
    Your Goal: Help users with government jobs, exams, and admit cards using the provided database context.
    Language: Hinglish (Natural mix of Hindi & English).
    Tone: Professional, Encouraging, and Concise.

    --- DATABASE CONTEXT (Results found for user query) ---
    ${hasData ? dataContext : "NO DIRECT MATCH FOUND IN DATABASE."}
    -------------------------------------------------------

    INSTRUCTIONS:

    1. **ANALYZE INTENT FIRST:**
       - If the user is just greeting (e.g., "Hi", "Hello", "Kaise ho"), IGNORE the database context. Reply normally and politely ask how you can help regarding jobs.
       - If the user asks a General Question (e.g., "UPSC ki taiyari kaise karein"), answer with general advice. Do NOT force a specific job link unless relevant.
       - If the user asks about a Specific Job/Result present in the CONTEXT (e.g., "SSC CGL dates", "Railway vacancy"), use the provided JSON data to answer accurately.

    2. **IF DATA IS PRESENT & RELEVANT:**
       - Summarize the key details (Dates, Organization, Title).
       - Provide the direct link (from context slug).
       - Don't dump the whole JSON. Make it readable.
       - Example: "Haan, [Job Title] ki vacancy aayi hai. Last date [Date] hai. Aap yahan se apply kar sakte hain: [Link]"

    3. **IF DATA IS MISSING OR IRRELEVANT:**
       - If user asks for a job not in the context, politely say: "Filhal is job ki specific details mere paas database mein nahi hain. Aap kripya official website check karein ya hamare website ke 'Latest Jobs' section par jayein."

    4. **SENSITIVE TOPICS (Fees/Docs):**
       - If user asks for fees or complex eligibility, summarize briefly if known, but ALWAYS advise: "Official notification zaroor padhein kyunki fees aur eligibility category-wise alag ho sakti hai."

    User Message: "${message}"
    `;

    // Step 3: Generate Response
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();

    // Clean formatting (remove markdown bolding if excessive)
    const cleanResponse = responseText.replace(/\*\*/g, '').trim();

    return res.status(200).json({
      success: true,
      reply: cleanResponse,
      // Debug info to help you monitor performance
      meta: {
        dbMatch: hasData,
        matchCount: dbResults ? dbResults.length : 0
      }
    });

  } catch (error) {
    console.error("❌ Assistant Error:", error);
    
    // Graceful error handling
    if (error.message?.includes('429')) {
      return res.status(429).json({ success: false, message: "High traffic. Please try in 10 seconds." });
    }

    return res.status(500).json({ 
      success: false, 
      message: "Abhi main process nahi kar pa raha hu. Thodi der baad try karein." 
    });
  }
};

module.exports = { aiAssistant };
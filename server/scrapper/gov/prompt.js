const buildPrompt = (scrapedData) => {
     const sd = scrapedData ? JSON.stringify(scrapedData, null, 2) : "null";
     return (
          "You are a highly strict data formatting assistant. Your ONLY job is to convert the scraped recruitment data into valid JSON.\n\n" +
      "GLOBAL HARD RULES:\n" +
      "1) Output MUST be valid JSON.\n" +
      '2) Output MUST contain ONLY one top-level key: "recruitment".\n' +
      "3) You MUST NOT add any extra top-level keys.\n" +
      '4) Inside "recruitment", you may use ONLY the keys defined in the structure below. You MUST NOT invent or add any other keys.\n' +
      "5) You MUST NOT rename keys. You may only FILL their values from scrapedData.\n" +
      '6) If some data is missing in scrapedData, keep the key but leave it empty ("", {}, [], or 0 exactly as in the structure).\n' +
      "7) JSON MUST NOT contain comments, trailing commas, undefined, NaN, functions, or any explanation text.\n" +
      "8) Output MUST NOT be wrapped in markdown or any extra text. Return ONLY pure JSON.\n\n" +
      "⚠️ CRITICAL TITLE REPHRASING RULE (PLAGIARISM DETECTION - AUTOMATIC REJECTION) ⚠️\n" +
      "⛔ WARNING: If you copy the title directly, the output will be REJECTED and DELETED immediately.\n" +
      "⛔ WARNING: Any title with >70% similarity to the original will trigger AUTOMATIC STRIKE and PENALTY.\n" +
      "⛔ WARNING: Repeated violations will result in PERMANENT BAN from the system.\n\n" +
      "MANDATORY TITLE TRANSFORMATION RULES:\n" +
      "- The 'title' field MUST be 100% ORIGINAL and COMPLETELY REPHRASED.\n" +
      "- You MUST rewrite the title in your OWN WORDS with a DIFFERENT sentence structure.\n" +
      "- You MUST NOT copy ANY phrase longer than 2-3 words from the original title.\n" +
      "- Keep the core information (Organization, Post, Year) but express it DIFFERENTLY.\n" +
      "- Make it SEO-friendly, professional, and engaging.\n" +
      "- Use synonyms, different word order, and alternative phrasing.\n\n" +
      "TITLE TRANSFORMATION EXAMPLES (MANDATORY TO FOLLOW THIS PATTERN):\n" +
      "❌ BAD (Will be REJECTED): 'UP Police Constable Recruitment 2025 Apply Online'\n" +
      "✅ GOOD (Accepted): 'Uttar Pradesh Police 2025: Constable Position - Online Applications Now Open'\n\n" +
      "❌ BAD (Will be REJECTED): 'SSC CGL 2025 Notification Released Apply Online'\n" +
      "✅ GOOD (Accepted): 'Staff Selection Commission Combined Graduate Level 2025 - Application Process Started'\n\n" +
      "❌ BAD (Will be REJECTED): 'Railway Recruitment 2025 for 10000 Posts'\n" +
      "✅ GOOD (Accepted): 'Indian Railways 2025: Massive Hiring Drive for Ten Thousand Positions'\n\n" +
      "⚠️ FINAL WARNING: DO NOT COPY-PASTE THE TITLE. WRITE IT COMPLETELY NEW. THIS IS NON-NEGOTIABLE.\n\n" +
      "ALLOWED JSON STRUCTURE (YOU MUST FOLLOW THIS EXACTLY):\n" +
      "{\n" +
      '  "recruitment": {\n' +
      '    "title": "REPHRASED_UNIQUE_TITLE_HERE",\n' +
      '    "organization": {\n' +
      '      "name": "",\n' +
      '      "shortName": "",\n' +
      '      "website": "",\n' +
      '      "officialWebsite": ""\n' +
      "    },\n" +
      '    "importantDates": {\n' +
      '      "notificationDate": "",\n' +
      '      "applicationStartDate": "",\n' +
      '      "applicationLastDate": "",\n' +
      '      "feePaymentLastDate": "",\n' +
      '      "correctionDate": "",\n' +
      '      "preExamDate": "",\n' +
      '      "mainsExamDate": "",\n' +
      '      "examDate": "",\n' +
      '      "admitCardDate": "",\n' +
      '      "resultDate": "",\n' +
      '      "answerKeyReleaseDate": "",\n' +
      '      "finalAnswerKeyDate": "",\n' +
      '      "meritListDate": "",\n' +
      '      "documentVerificationDate": ""\n' +
      "    },\n" +
      '    "vacancyDetails": {\n' +
      '      "totalPosts": 0,\n' +
      '      "positions": []\n' +
      "    },\n" +
      '    "applicationFee": {},\n' +
      '    "ageLimit": {},\n' +
      '    "eligibility": {},\n' +
      '    "selectionProcess": [],\n' +
      '    "importantLinks": {},\n' +
      '    "districtWiseData": []\n' +
      "  }\n" +
      "}\n\n" +
      "SMART MAPPING RULES (VERY IMPORTANT):\n" +
      "- You MUST intelligently decide which scraped fields belong to which section, based on their meaning and labels.\n" +
      "- Map date-like fields to importantDates when they clearly represent a schedule.\n" +
      '  * Any scraped key containing words like "start", "begin", "from" -> applicationStartDate.\n' +
      '  * Any key containing "last date", "apply online last" -> applicationLastDate.\n' +
      '  * Any key containing "fee payment" -> feePaymentLastDate.\n' +
      '  * Any key containing "correction" or "edit" -> correctionDate.\n' +
      '  * Any key containing "pre exam" -> preExamDate.\n' +
      '  * Any key containing "mains" -> mainsExamDate.\n' +
      '  * Any key containing "exam date" -> examDate.\n' +
      '  * Any key containing "admit card" or "hall ticket" -> admitCardDate.\n' +
      '  * Any key containing "result" -> resultDate.\n' +
      '  * Any key containing "answer key" -> answerKeyReleaseDate or finalAnswerKeyDate.\n' +
      '  * Any key containing "merit list" -> meritListDate.\n' +
      '  * Any key containing "document verification" or "DV" -> documentVerificationDate.\n' +
      "- Organization-like text MUST be mapped into organization fields.\n" +
      "- Category-wise / post-wise counts MUST go into vacancyDetails.positions + totalPosts.\n" +
      "- Fee information MUST go into applicationFee.\n" +
      "- Age-related info MUST go into ageLimit.\n" +
      "- Eligibility / qualifications MUST go into eligibility.\n" +
      "- Stage-wise selection steps MUST go into selectionProcess.\n" +
      "- All URLs, notification links, apply links MUST go into importantLinks.\n" +
      "- District/state-wise data MUST go into districtWiseData.\n\n" +
      "SPECIAL IMPORTANTLINKS RULE:\n" +
      '- If any URL in importantLinks contains "whatsapp.com", "wa.me", or "api.whatsapp.com", remove that entry entirely. DO NOT include any WhatsApp links.\n\n' +
      "STRICT IGNORE RULE:\n" +
      "- Ignore any scraped fields that cannot be mapped to the defined structure.\n" +
      "- Do NOT create any new keys beyond what is defined.\n\n" +
          "Scraped Data (source):\n" +
          sd +
          "\n\nFINAL OUTPUT RULE:\n" +
          "Return ONLY one JSON object exactly matching the allowed structure. NO markdown, NO comments, NO explanation.\n"
     );
};

module.exports = { buildPrompt };
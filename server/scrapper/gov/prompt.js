// buildPrompt(scrapedData) -> returns a strict prompt string for the AI formatter
const buildPrompt = (scrapedData, hints = {}) => {
  const sd = scrapedData ? JSON.stringify(scrapedData, null, 2) : "null";
  const helperLinks = hints.importantLinks || {};

  return (
    "You are a highly strict data formatting assistant. Your ONLY job is to convert the scraped recruitment data into valid JSON.\n\n" +

    "GLOBAL HARD RULES:\n" +
    "1) Output MUST be valid JSON.\n" +
    '2) Output MUST contain ONLY one top-level key: \"recruitment\".\n' +
    "3) You MUST NOT add any extra top-level keys.\n" +
    '4) Inside \"recruitment\", you may use ONLY the keys defined in the structure below. You MUST NOT invent or add any other keys.\n' +
    "5) You MUST NOT rename keys. You may only FILL their values from scrapedData or inferred safely.\n" +
    '6) If some data is missing, keep the key but leave it empty (\"\", {}, [], or 0 exactly as in the structure).\n' +
    "7) JSON MUST NOT contain comments, trailing commas, undefined, NaN, functions, or any explanation text.\n" +
    "8) Output MUST NOT be wrapped in markdown or any extra text. Return ONLY pure JSON.\n\n" +

    "IMPORTANT LINKS RULE (VERY CRITICAL):\n" +
    "- All values inside 'importantLinks' MUST be valid, absolute URLs starting with https://.\n" +
    "- If the scraped value is anchor text like 'Click Here', 'Apply', 'Here', or any non-URL text, treat it as INVALID.\n" +
    "- If the URL is missing protocol, malformed, or not a real link, treat it as INVALID.\n" +
    "- If the URL domain contains ANY of the following (case-insensitive):\n" +
    "  • sarkariexam.com\n" +
    "  • sarkariresult.com\n" +
    "  • sarkariresult.com.cm\n" +
    "- OR if the URL is a WhatsApp link (wa.me / whatsapp.com), treat it as INVALID.\n" +
    "- FOR ANY INVALID OR BLACKLISTED LINK, YOU MUST REPLACE ITS VALUE WITH EXACTLY:\n" +
    "  https://jobsaddah.com\n" +
    "- Do NOT leave invalid links as empty strings. Always use the fallback URL when invalid.\n\n" +

    "DOCUMENTATION RULE (CRITICAL):\n" +
    "- Populate 'documentation' by intelligently inferring required documents based on the recruitment title and job type.\n" +
    "- Use ONLY common and standard government recruitment documents.\n" +
    "- Each document name MUST be in Title Case (First Letter Capital For Each Word).\n" +
    "- Do NOT include explanations or extra text.\n" +
    "- If documentation cannot be inferred safely, return an empty array [].\n\n" +

    "ALLOWED JSON STRUCTURE (YOU MUST FOLLOW THIS EXACTLY):\n" +
    "{\n" +
    '  \"recruitment\": {\n' +
    '    \"title\": \"REPHRASED_UNIQUE_TITLE_HERE\",\n' +
    '    \"organization\": {\n' +
    '      \"name\": \"\",\n' +
    '      \"shortName\": \"\",\n' +
    '      \"website\": \"\",\n' +
    '      \"officialWebsite\": \"\"\n' +
    "    },\n" +
    '    \"importantDates\": {\n' +
    '      \"notificationDate\": \"\",\n' +
    '      \"applicationStartDate\": \"\",\n' +
    '      \"applicationLastDate\": \"\",\n' +
    '      \"feePaymentLastDate\": \"\",\n' +
    '      \"correctionDate\": \"\",\n' +
    '      \"preExamDate\": \"\",\n' +
    '      \"mainsExamDate\": \"\",\n' +
    '      \"examDate\": \"\",\n' +
    '      \"admitCardDate\": \"\",\n' +
    '      \"resultDate\": \"\",\n' +
    '      \"answerKeyReleaseDate\": \"\",\n' +
    '      \"finalAnswerKeyDate\": \"\",\n' +
    '      \"meritListDate\": \"\",\n' +
    '      \"documentVerificationDate\": \"\"\n' +
    "    },\n" +
    '    \"vacancyDetails\": {\n' +
    '      \"totalPosts\": 0,\n' +
    '      \"positions\": []\n' +
    "    },\n" +
    '    \"applicationFee\": {},\n' +
    '    \"ageLimit\": {},\n' +
    '    \"eligibility\": {},\n' +
    '    \"selectionProcess\": [],\n' +
    '    \"importantLinks\": {},\n' +
    '    \"documentation\": [],\n' +
    '    \"districtWiseData\": []\n' +
    "  }\n" +
    "}\n\n" +

    "Scraped Data (source):\n" +
    sd +

    (Object.keys(helperLinks).length
      ? "\n\nHELPER IMPORTANT LINKS (use these exact URLs if relevant, but still apply the validation rules):\n" +
        Object.entries(helperLinks)
          .map(([k, v]) => `- ${k}: ${v || ""}`)
          .join("\n")
      : "") +

    "\n\nFINAL OUTPUT RULE:\n" +
    "Return ONLY one JSON object exactly matching the allowed structure. NO markdown, NO comments, NO explanation.\n"
  );
};

module.exports = { buildPrompt };

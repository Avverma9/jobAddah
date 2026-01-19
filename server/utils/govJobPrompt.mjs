const buildPrompt = (scrapedData, hints = {}) => {
  const sd = scrapedData ? JSON.stringify(scrapedData, null, 2) : "null";
  const helperLinks = hints.importantLinks || {};

  return (
    "TASK: Convert scraped recruitment data into STRICT JSON.\n\n" +

    "GLOBAL RULES:\n" +
    "- Output ONLY valid JSON.\n" +
    "- EXACTLY one top-level key: \"recruitment\".\n" +
    "- NO markdown, NO comments, NO explanations.\n" +
    "- Do NOT invent data.\n" +
    "- Missing data → keep key with empty value (\"\", {}, [], 0).\n\n" +

    "CORE SCHEMA (DO NOT RENAME KEYS):\n" +
    "{ \"recruitment\": {\n" +
    "  \"title\": \"\",\n" +
    "  \"organization\": { \"name\": \"\", \"shortName\": \"\", \"website\": \"\", \"officialWebsite\": \"\" },\n" +
    "  \"importantDates\": {\n" +
    "    \"notificationDate\": \"\", \"applicationStartDate\": \"\", \"applicationLastDate\": \"\",\n" +
    "    \"feePaymentLastDate\": \"\", \"correctionDate\": \"\", \"preExamDate\": \"\",\n" +
    "    \"mainsExamDate\": \"\", \"examDate\": \"\", \"admitCardDate\": \"\",\n" +
    "    \"resultDate\": \"\", \"answerKeyReleaseDate\": \"\", \"finalAnswerKeyDate\": \"\",\n" +
    "    \"meritListDate\": \"\", \"documentVerificationDate\": \"\"\n" +
    "  },\n" +
    "  \"vacancyDetails\": { \"totalPosts\": 0, \"positions\": [] },\n" +
    "  \"applicationFee\": {},\n" +
    "  \"ageLimit\": {},\n" +
    "  \"eligibility\": {},\n" +
    "  \"selectionProcess\": [],\n" +
    "  \"importantLinks\": {},\n" +
    "  \"documentation\": [],\n" +
    "  \"districtWiseData\": [],\n" +
    "  \"additionalDetails\": {}\n" +
    "} }\n\n" +

    "IMPORTANT LINKS & REPLACEMENT LOGIC (STRICT):\n" +
    "1. Analyze the domain of extracted links (applyOnline, notification, etc.).\n" +
    "2. IF the domain is an OFFICIAL source (e.g., ends in .gov.in, .nic.in, .org, or is the official recruitment portal) -> KEEP the original link.\n" +
    "3. IF the domain is a THIRD-PARTY competitor (specifically: sarkariresult.com, sarkariresult.com.cm, sarkariexam.com, majhinaukri.in, jobriya.in) -> REPLACE it with \"https://jobsaddah.com\".\n" +
    "4. IF the link is internal/relative or broken -> REPLACE it with \"https://jobsaddah.com\".\n" +
    "5. Ensure 'officialWebsite' in organization object is always the real official site, never a third-party link.\n\n" +

    "DOCUMENTATION RULE:\n" +
    "- Infer ONLY standard government documents from job title/type.\n" +
    "- Title Case only.\n" +
    "- If unsure, return [].\n\n" +

    "ADDITIONAL DETAILS RULE:\n" +
    "- Any extra info NOT in core schema MUST go inside \"additionalDetails\".\n" +
    "- Examples: physicalMeasures, physicalStandards, physicalEfficiency, running, height, chest, weight, medicalStandards, experience, training.\n" +
    "- Objects → nested objects.\n" +
    "- Lists → arrays.\n" +
    "- Tables → array of objects.\n" +
    "- Use clean camelCase keys.\n\n" +

    "SCRAPED DATA:\n" +
    sd +
    (Object.keys(helperLinks).length
      ? "\n\nHELPER LINKS (use only if valid):\n" +
        Object.entries(helperLinks)
          .map(([k, v]) => `${k}: ${v || ""}`)
          .join("\n")
      : "") +
    "\n\nRETURN ONLY JSON."
  );
};

export { buildPrompt };

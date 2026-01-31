// rephraser.js
// Short + meaningful title rephraser (Hindi/Indian exam site friendly)

const cleanSpaces = (s = "") =>
  s.replace(/\s+/g, " ").replace(/\u2013|\u2014/g, "-").trim();

const extractYear = (title) => {
  const m = title.match(/\b(19\d{2}|20\d{2})\b/g);
  return m ? m[m.length - 1] : null;
};

const normalizeCommonTypos = (t) =>
  t.replace(/\bHight\b/gi, "High").replace(/\bHight Court\b/gi, "High Court");

const shortenOrgTerms = (t) =>
  t
    .replace(/\bRailway Recruitment Board\b/gi, "RRB")
    .replace(/\bStaff Selection Commission\b/gi, "SSC")
    .replace(/\bUnion Public Service Commission\b/gi, "UPSC")
    .replace(/\bNational Testing Agency\b/gi, "NTA");

const removeNoise = (t) =>
  t
    .replace(/\bSarkari Result\b/gi, "")
    .replace(/\bCheck Now\b/gi, "")
    .replace(/\bDownload\b/gi, "")
    .replace(/\bClick Here\b/gi, "")
    .replace(/\bNotice\b/gi, "")
    .replace(/\bNotification\b/gi, "");

// ✅ remove duplicate words/phrases: "Live Live", "Final Final", "Being Being Being Revised"
const dedupeRepeats = (t = "") => {
  t = cleanSpaces(t);

  let prev;
  do {
    prev = t;

    // repeated 2-word phrase: "Available Now Available Now"
    t = t.replace(/\b([A-Za-z]+(?:\s+[A-Za-z]+))\s+\1\b/gi, "$1");

    // repeated single word: "Live Live", "Final Final", "Being Being"
    t = t.replace(/\b([A-Za-z]+)\s+\1\b/gi, "$1");

    t = cleanSpaces(t);
  } while (t !== prev);

  return t;
};

// ✅ Toggle helper:
// - If short exists => expand to full
// - Else if full exists => shrink to short
// (one direction per run, avoids loops)
const toggleAbbr = (t) => {
  // BPSC <-> Bihar Public Service Commission
  const hasBPSCFull = /\bBihar Public Service Commission\b/i.test(t);
  const hasBPSCShort = /\bBPSC\b/.test(t);

  if (hasBPSCFull) {
    t = t.replace(/\bBihar Public Service Commission\b/gi, "BPSC");
  } else if (hasBPSCShort) {
    t = t.replace(/\bBPSC\b/g, "Bihar Public Service Commission");
  }

  // BSSC <-> Bihar Staff Selection Commission
  const hasBSSCFull = /\bBihar Staff Selection Commission\b/i.test(t);
  const hasBSSCShort = /\bBSSC\b/.test(t);

  if (hasBSSCFull) {
    t = t.replace(/\bBihar Staff Selection Commission\b/gi, "BSSC");
  } else if (hasBSSCShort) {
    t = t.replace(/\bBSSC\b/g, "Bihar Staff Selection Commission");
  }

  return t;
};

const mapKeyPhrases = (t) => {
  t = t.replace(/\s*\/\s*/g, " / ");
  t = t.replace(/\s*-\s*/g, " - ");

  // status normalize
  t = t.replace(/\b(out|released)\b/gi, "out");

  // IMPORTANT: order matters
  // 1) Admit Card -> Link Active
  // 2) Link Active -> Available Now
  t = t
    .replace(/\bOnline Form\b/gi, "online")
    .replace(/\bApplication Form\b/gi, "apply")
    .replace(/\bApply Online\b/gi, "apply")
    .replace(/\bAdmit Card\b/gi, "Link Active")
    .replace(/\bExam City Details?\b/gi, "city details")
    .replace(/\bExam Date\b/gi, "date")
    .replace(/\bAnswer Key\b/gi, "key")
    .replace(/\bCut Off\b/gi, "cutoff")
    .replace(/\bResult\b/gi, "result")
    .replace(/\bScore Card\b/gi, "score")
    .replace(/\bMerit List\b/gi, "merit")
    .replace(/\bSyllabus\b/gi, "syllabus")
    .replace(/\bExam Pattern\b/gi, "pattern")
    .replace(/\bInterview Letter\b/gi, "interview")
    .replace(/\bApplication Status\b/gi, "status")
    .replace(/\bVacancy Details?\b/gi, "vacancy")
    .replace(/\bLink Active\b/gi, "Available Now")
    
    .replace(/\b2026\b/gi, "2K26")
    .replace(/\b2027\b/gi, "2K27")
    .replace(/\b2025\b/gi, "2K25")
    .replace(/\b2024\b/gi, "2K24")
    .replace(/\bImportant Date(s)?\b/gi, "important dates")
    .replace(/\bEligibility Details?\b/gi, "eligibility")
    .replace(/\bHow to Apply\b/gi, "apply process")
    .replace(/\bCorrection\s*\/\s*Edit Form\b/gi, "correction")
    .replace(/\bRevised\b/gi, "Being Revised")
    .replace(/\bPostponed\b/gi, "Is postponed")
    .replace(/\bLast Date Today\b/gi, "Today Is Last Date")
    .replace(/\bDate Extend(ed)?\b/gi, "Final Date Extended");

  // remove extra " - out"
  t = t.replace(/\s+-\s+out\b/gi, " out");

  // ✅ toggle BPSC/BSSC short <-> full
  t = toggleAbbr(t);

  // ✅ cleanup duplicates caused by replacements
  t = dedupeRepeats(t);

  return t;
};

// ✅ Start/Started => only one "Started"
const normalizeStartedToken = (t, hadStart) => {
  // remove any existing start/started first
  t = t.replace(/\b(start|started)\b/gi, "").replace(/\s+/g, " ").trim();

  // add only one Started if original had start/started
  if (hadStart) t = `${t} Started`;

  return cleanSpaces(t);
};

const compactStructure = (original) => {
  let t = cleanSpaces(original);

  // detect start/started in ORIGINAL
  const hadStart = /\b(start|started)\b/i.test(original);

  t = normalizeCommonTypos(t);
  t = shortenOrgTerms(t);
  t = removeNoise(t);
  t = mapKeyPhrases(t);

  // Pull year out (keep it once)
  const year = extractYear(t);
  if (year) {
    t = t.replace(/\b(19\d{2}|20\d{2})\b/g, "").replace(/\s+/g, " ").trim();
  }

  // remove filler
  t = t
    .replace(/\b(Recruitment|Vacancy|Various Post(s)?|Notification)\b/gi, "")
    .replace(/\b(For)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  // ✅ ensure ONLY one Started (and only if original had start)
  t = normalizeStartedToken(t, hadStart);

  // Out append (if needed)
  const hadOut = /\b(out|released)\b/i.test(original);
  const hasOut = /\bout\b/i.test(t);
  if (hadOut && !hasOut) t = `${t} Out`;

  // Append year
  if (year) t = `${t} ${year}`;

  // ✅ FINAL: remove any repeated words/phrases once again after appends
  t = dedupeRepeats(t);

  // Preserve acronyms + title casing
  t = cleanSpaces(t)
    .split(" ")
    .map((w) => {
      if (/^[A-Z]{2,}$/.test(w)) return w; // acronyms
      if (/^\d+$/.test(w)) return w; // numbers
      return w[0] ? w[0].toUpperCase() + w.slice(1) : w;
    })
    .join(" ");

  return cleanSpaces(t);
};

export const rephraseTitle = (title) => {
  if (!title || typeof title !== "string") return "";
  const out = compactStructure(title);

  // Safety fallback
  if (out.replace(/\W/g, "").length < 10) return cleanSpaces(title);

  return out;
};

export default rephraseTitle;

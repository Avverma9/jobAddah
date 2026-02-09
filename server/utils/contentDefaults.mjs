const DEFAULT_FULL_CONTENT = {
  originalSummary: "",
  whoShouldApply: [],
  keyHighlights: [],
  applicationSteps: [],
  selectionProcessSummary: "",
  documentsChecklist: [],
  feeSummary: "",
  importantNotes: [],
  faq: [],
};

const DEFAULT_UPDATE_CONTENT = {
  updateSummary: "",
  keyChanges: [],
  actionItems: [],
  importantNotes: [],
  faq: [],
};

const cleanText = (v) =>
  typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "";

const normalizeArray = (input, maxItems) => {
  const arr = Array.isArray(input) ? input : input ? [input] : [];
  const seen = new Set();
  const out = [];
  for (const raw of arr) {
    const t = cleanText(raw);
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
    if (maxItems && out.length >= maxItems) break;
  }
  return out;
};

const normalizeFaq = (input, maxItems) => {
  const arr = Array.isArray(input) ? input : [];
  const out = [];
  for (const item of arr) {
    if (!item || typeof item !== "object") continue;
    const q = cleanText(item.q);
    const a = cleanText(item.a);
    if (!q || !a) continue;
    out.push({ q, a });
    if (maxItems && out.length >= maxItems) break;
  }
  return out;
};

const isUpdateContent = (content) =>
  Boolean(content?.updateSummary || content?.keyChanges || content?.actionItems);

const buildContentDefaults = (content = {}) => {
  const base = isUpdateContent(content)
    ? { ...DEFAULT_UPDATE_CONTENT }
    : { ...DEFAULT_FULL_CONTENT };

  const merged = { ...base, ...content };

  if ("originalSummary" in merged) merged.originalSummary = cleanText(merged.originalSummary);
  if ("selectionProcessSummary" in merged)
    merged.selectionProcessSummary = cleanText(merged.selectionProcessSummary);
  if ("feeSummary" in merged) merged.feeSummary = cleanText(merged.feeSummary);
  if ("updateSummary" in merged) merged.updateSummary = cleanText(merged.updateSummary);

  if ("whoShouldApply" in merged) merged.whoShouldApply = normalizeArray(merged.whoShouldApply, 10);
  if ("keyHighlights" in merged) merged.keyHighlights = normalizeArray(merged.keyHighlights, 10);
  if ("applicationSteps" in merged)
    merged.applicationSteps = normalizeArray(merged.applicationSteps, 15);
  if ("documentsChecklist" in merged)
    merged.documentsChecklist = normalizeArray(merged.documentsChecklist, 20);
  if ("importantNotes" in merged) merged.importantNotes = normalizeArray(merged.importantNotes, 10);
  if ("keyChanges" in merged) merged.keyChanges = normalizeArray(merged.keyChanges, 10);
  if ("actionItems" in merged) merged.actionItems = normalizeArray(merged.actionItems, 10);

  merged.faq = normalizeFaq(merged.faq, 10);

  return merged;
};

const withContentDefaults = (post) => {
  if (!post || typeof post !== "object") return post;
  const recruitment = post.recruitment || {};
  const content = recruitment.content || {};

  const nextContent = buildContentDefaults(content);

  return {
    ...post,
    recruitment: {
      ...recruitment,
      content: nextContent,
    },
  };
};

export { withContentDefaults };

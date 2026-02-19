import { getBaseUrl } from "@/lib/server-url";

const SECTION_TO_MEGA_TITLE = {
  "latest job": "Latest Gov Jobs",
  "latest jobs": "Latest Gov Jobs",
  "admit card": "Admit Cards",
  "admit cards": "Admit Cards",
  result: "Recent Results",
  results: "Recent Results",
  admission: "Admission Form",
  admissions: "Admission Form",
  "answer key": "Answer Keys",
  "answer keys": "Answer Keys",
  syllabus: "Syllabus",
};

function toText(value) {
  return String(value || "").trim();
}

function toSlug(value) {
  return toText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveMegaTitle(sectionTitle) {
  const key = toText(sectionTitle).toLowerCase();
  return SECTION_TO_MEGA_TITLE[key] || toText(sectionTitle);
}

function toCategoryFromSection(section, fallbackSite = {}) {
  const rawName = toText(section?.sectionTitle) || toText(section?.title);
  if (!rawName) return null;
  const megaTitle = toText(section?.megaTitle) || resolveMegaTitle(rawName);
  const key =
    toText(section?.key) || toText(section?.slug) || toSlug(megaTitle || rawName);
  return {
    name: rawName,
    key,
    megaTitle,
    sectionTitle: rawName,
    sectionUrl: toText(section?.sectionUrl) || toText(section?.url),
    siteName: toText(section?.siteName) || toText(fallbackSite?.name),
    siteUrl: toText(section?.siteUrl) || toText(fallbackSite?.url),
    data: [{ jobs: [] }],
  };
}

function normalizeJobSectionsPayload(payload) {
  if (!payload?.success) return null;
  const data = Array.isArray(payload?.data) ? payload.data : [];
  if (data.length === 0) return null;

  if (Array.isArray(data?.[0]?.categories)) {
    return data[0];
  }

  const categories = [];
  for (const item of data) {
    if (Array.isArray(item?.sections)) {
      for (const section of item.sections) {
        const normalized = toCategoryFromSection(section, item);
        if (normalized) categories.push(normalized);
      }
      continue;
    }

    const normalized = toCategoryFromSection(item);
    if (normalized) categories.push(normalized);
  }

  if (categories.length === 0) return null;

  const first = data[0] || {};
  return {
    siteId: toText(first?.siteId),
    name: toText(first?.name),
    url: toText(first?.url),
    categories,
  };
}

export async function getJobSections() {
  try {
    const baseUrl = await getBaseUrl();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(`${baseUrl}/api/gov-post/job-section`, {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const payload = await res.json();
    return normalizeJobSectionsPayload(payload);
  } catch {
    return null;
  }
  return null;
}

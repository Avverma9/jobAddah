import { baseUrl } from "@/lib/baseUrl";
import { NextResponse } from "next/server";

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
  "previous year paper": "Previous Year Paper",
  "previous year papers": "Previous Year Paper",
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

function buildCategory({
  name,
  key,
  megaTitle,
  sectionTitle,
  sectionUrl,
  siteName,
  siteUrl,
}) {
  const safeName = toText(name) || toText(sectionTitle) || toText(megaTitle);
  const safeMegaTitle = toText(megaTitle) || resolveMegaTitle(safeName);
  const safeKey = toText(key) || toSlug(safeMegaTitle || safeName);

  return {
    name: safeName,
    key: safeKey,
    megaTitle: safeMegaTitle,
    sectionTitle: toText(sectionTitle) || safeName,
    sectionUrl: toText(sectionUrl),
    siteName: toText(siteName),
    siteUrl: toText(siteUrl),
    data: [{ jobs: [] }],
  };
}

function dedupeCategories(categories) {
  const byKey = new Map();

  for (const category of categories) {
    const key = toText(category?.key);
    if (!key) continue;

    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, category);
      continue;
    }

    if (!existing.sectionUrl && category.sectionUrl) {
      existing.sectionUrl = category.sectionUrl;
    }
    if (!existing.siteName && category.siteName) {
      existing.siteName = category.siteName;
    }
    if (!existing.siteUrl && category.siteUrl) {
      existing.siteUrl = category.siteUrl;
    }
    if (!existing.name && category.name) {
      existing.name = category.name;
    }
    if (!existing.sectionTitle && category.sectionTitle) {
      existing.sectionTitle = category.sectionTitle;
    }
  }

  return Array.from(byKey.values());
}

function normalizeMegaSectionsPayload(payload) {
  const data = Array.isArray(payload?.data) ? payload.data : [];
  const categories = [];
  const siteInfo = { siteId: "", name: "", url: "" };

  for (const item of data) {
    const megaTitle = toText(item?.title);
    const key = toText(item?.slug) || toSlug(megaTitle);
    const sources = Array.isArray(item?.sources) ? item.sources : [];

    if (sources.length === 0) {
      if (!megaTitle) continue;
      categories.push(
        buildCategory({
          name: megaTitle,
          key,
          megaTitle,
          sectionTitle: megaTitle,
          sectionUrl: "",
          siteName: "",
          siteUrl: "",
        }),
      );
      continue;
    }

    for (const source of sources) {
      const sectionTitle = toText(source?.sectionTitle) || megaTitle;
      if (!sectionTitle && !megaTitle) continue;

      const category = buildCategory({
        name: sectionTitle,
        key,
        megaTitle: megaTitle || resolveMegaTitle(sectionTitle),
        sectionTitle,
        sectionUrl: toText(source?.sectionUrl),
        siteName: toText(source?.siteName),
        siteUrl: toText(source?.siteUrl),
      });
      categories.push(category);

      if (!siteInfo.siteId) siteInfo.siteId = toText(source?.siteId);
      if (!siteInfo.name) siteInfo.name = toText(source?.siteName);
      if (!siteInfo.url) siteInfo.url = toText(source?.siteUrl);
    }
  }

  return {
    siteInfo,
    categories: dedupeCategories(categories),
  };
}

function normalizeSiteSectionsPayload(payload) {
  const data = Array.isArray(payload?.data) ? payload.data : [];
  const categories = [];
  const firstSite = data[0] || {};

  for (const site of data) {
    const sections = Array.isArray(site?.sections) ? site.sections : [];
    for (const section of sections) {
      const sectionTitle = toText(section?.title);
      if (!sectionTitle) continue;

      const megaTitle = resolveMegaTitle(sectionTitle);
      categories.push(
        buildCategory({
          name: sectionTitle,
          key: toSlug(megaTitle),
          megaTitle,
          sectionTitle,
          sectionUrl: toText(section?.url),
          siteName: toText(site?.name),
          siteUrl: toText(site?.url),
        }),
      );
    }
  }

  return {
    siteInfo: {
      siteId: toText(firstSite?.siteId),
      name: toText(firstSite?.name),
      url: toText(firstSite?.url),
    },
    categories: dedupeCategories(categories),
  };
}

function normalizeSectionsPayload(payload) {
  const data = Array.isArray(payload?.data) ? payload.data : [];
  if (data.length === 0) return null;

  const hasSources = data.some((item) => Array.isArray(item?.sources));
  if (hasSources) return normalizeMegaSectionsPayload(payload);

  const hasSections = data.some((item) => Array.isArray(item?.sections));
  if (hasSections) return normalizeSiteSectionsPayload(payload);

  return null;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null);
  return { response, payload };
}

function buildResponse(normalized, status) {
  const categories = Array.isArray(normalized?.categories)
    ? normalized.categories
    : [];

  return NextResponse.json(
    {
      success: true,
      count: categories.length,
      data: [
        {
          siteId: toText(normalized?.siteInfo?.siteId),
          name: toText(normalized?.siteInfo?.name),
          url: toText(normalized?.siteInfo?.url),
          categories,
        },
      ],
    },
    { status },
  );
}

export async function GET() {
  const primaryUrl = `${baseUrl}/site/mega-sections`;
  const fallbackUrl = `${baseUrl}/sections/get-sections`;

  try {
    const primary = await fetchJson(primaryUrl);
    const normalizedPrimary = normalizeSectionsPayload(primary.payload);
    if (normalizedPrimary?.categories?.length) {
      return buildResponse(normalizedPrimary, primary.response.status);
    }

    const fallback = await fetchJson(fallbackUrl);
    const normalizedFallback = normalizeSectionsPayload(fallback.payload);
    if (normalizedFallback?.categories?.length) {
      return buildResponse(normalizedFallback, fallback.response.status);
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid response from upstream service",
      },
      { status: 502 },
    );
  } catch (error) {
    console.error("job-section route error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to upstream service",
      },
      { status: 502 },
    );
  }
}

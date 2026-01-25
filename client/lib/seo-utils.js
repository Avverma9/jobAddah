import { buildCanonicalPath } from "@/lib/job-url";

export const PUBLIC_SITE = "https://jobsaddah.com";
export const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

export const normalizeUrlValue = (value) => {
  if (!value) return "/";
  const trimmed = value.toString().trim();
  if (!trimmed) return "/";
  try {
    const parsed = new URL(trimmed, PUBLIC_SITE);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }
};

export const resolveCanonicalPath = (value) => {
  const normalized = normalizeUrlValue(value);
  const canonicalPath = buildCanonicalPath(normalized);
  return canonicalPath || normalized || "/";
};

export const resolveAbsoluteUrl = (value) => {
  const canonicalPath = resolveCanonicalPath(value);
  return ABSOLUTE_URL_PATTERN.test(canonicalPath)
    ? canonicalPath
    : `${PUBLIC_SITE}${canonicalPath}`;
};

export const buildKeywordString = (keywords) => {
  if (!keywords) return null;
  if (Array.isArray(keywords)) {
    return keywords.join(", ");
  }
  return keywords;
};

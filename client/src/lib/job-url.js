const RESERVED_STATIC_ROUTES = new Set([
  "",
  "about",
  "contact",
  "fav-jobs",
  "image-tool",
  "pdf-tool",
  "policy",
  "private-jobs",
  "quiz-and-earn",
  "resume-maker",
  "terms",
  "typing-test",
  "view-all",
  "login",
  "register",
  "sections",
  "mobile",
  "post",
]);

export function normalizeJobPath(rawValue = "") {
  if (!rawValue) return null;
  let value = typeof rawValue === "string" ? rawValue.trim() : "";
  if (!value) return null;

  try {
    if (value.startsWith("http://") || value.startsWith("https://")) {
      const parsed = new URL(value);
      value = parsed.pathname + parsed.search + parsed.hash;
    }
  } catch (error) {
    // ignore parsing issues and use value as-is
  }

  if (!value.startsWith("/")) value = `/${value}`;
  value = value.replace(/\\+/g, "/");
  value = value.replace(/\/{2,}/g, "/");

  if (!value.endsWith("/")) {
    value = `${value}/`;
  }

  return value;
}

export function getJobSlugSegments(rawValue = "") {
  const normalized = normalizeJobPath(rawValue);
  if (!normalized) return [];
  return normalized.split("/").filter(Boolean);
}

export function buildJobHref(rawValue = "") {
  const canonical = buildCanonicalPath(rawValue);
  if (!canonical) return "#";
  const encodedSegments = canonical
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(decodeURIComponentSafe(segment)));
  return `/${encodedSegments.join("/")}/`;
}

export function pathFromSlugSegments(slug = []) {
  const segments = Array.isArray(slug) ? slug : [slug];
  if (!segments.length) return null;
  const decoded = segments
    .map((segment) => decodeURIComponentSafe(segment))
    .filter(Boolean);
  if (!decoded.length) return null;
  return normalizeJobPath(`/${decoded.join("/")}/`);
}

export function needsJobsPrefix(rawValue = "") {
  const normalized = normalizeJobPath(rawValue);
  if (!normalized) return true;
  const firstSegment = normalized.split("/").filter(Boolean)[0];
  if (!firstSegment) return true;
  return RESERVED_STATIC_ROUTES.has(firstSegment);
}

export function buildCanonicalPath(rawValue = "") {
  const normalized = normalizeJobPath(rawValue);
  if (!normalized) return null;
  if (needsJobsPrefix(normalized)) {
    const segments = normalized.split("/").filter(Boolean);
    return `/jobs/${segments.join("/")}/`;
  }
  return normalized;
}

export function resolveJobDetailHref({ url, id }) {
  if (url) {
    return buildJobHref(url);
  }
  if (id) {
    return `/post?id=${encodeURIComponent(id)}`;
  }
  return "#";
}

function decodeURIComponentSafe(value = "") {
  try {
    return decodeURIComponent(value);
  } catch (error) {
    return value;
  }
}

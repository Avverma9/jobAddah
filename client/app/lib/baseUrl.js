function normalizeBaseUrl(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.replace(/\/+$/g, "");
}

const explicitBaseUrl =
  normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_API_BASE_URL) ||
  normalizeBaseUrl(process.env.SITE_API_BASE_URL);

const defaultBaseUrl =
  process.env.NODE_ENV === "production"
    ? "https://sarkariafsar.com/api/site"
    : "http://localhost:5000/api/site";

const baseUrl = explicitBaseUrl || defaultBaseUrl;

export default baseUrl;

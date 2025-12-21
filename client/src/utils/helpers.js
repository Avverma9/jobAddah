/**
 * Common utility helper functions used across the app
 */

/**
 * Extract path from URL (removes domain)
 * @param {string} url - Full URL or path
 * @returns {string} - Clean path
 */
export const extractPath = (url) => {
  if (!url) return "";
  try {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      const urlObj = new URL(url);
      return urlObj.pathname;
    }
    return url.startsWith("/") ? url : `/${url}`;
  } catch {
    return url.startsWith("/") ? url : `/${url}`;
  }
};

/**
 * Generate post link from ID or URL
 * Priority: url > link > _id > id
 * @param {string|object} idOrUrl - ID, URL string, or object with url/link/_id/id
 * @returns {string} - Post link path
 */
export const getPostLink = (idOrUrl) => {
  if (!idOrUrl) return "#";
  
  // If object, extract the appropriate field
  if (typeof idOrUrl === "object") {
    const val = idOrUrl.url || idOrUrl.link || idOrUrl._id || idOrUrl.id;
    return getPostLink(val);
  }
  
  const val = idOrUrl.toString().trim();
  
  // If it's a URL (full or path), use url parameter
  if (val.startsWith("http://") || val.startsWith("https://") || val.startsWith("/")) {
    const path = extractPath(val);
    return `/post?url=${encodeURIComponent(path)}`;
  }
  
  // For MongoDB ObjectId or other IDs, use id parameter
  return `/post?id=${val}`;
};

/**
 * Get post link from reminder object
 * @param {object} reminder - Reminder object
 * @returns {string} - Post link path
 */
export const getReminderLink = (reminder) => {
  if (!reminder) return "#";
  return getPostLink(reminder.url || reminder.link || reminder._id || reminder.id);
};

/**
 * Normalize job object to consistent format
 * @param {object} job - Raw job object from API
 * @returns {object} - Normalized job object
 */
export const normalizeJob = (job) => {
  const id = job?.link || job?.url || job?.id || job?._id;
  const title =
    job?.recruitment?.title || job?.title || job?.postTitle || "Job Post";
  const createdAt =
    job?.createdAt ||
    job?.recruitment?.createdAt ||
    job?.date ||
    job?.recruitment?.date ||
    job?.updatedAt ||
    null;

  return { ...job, id, title, createdAt };
};

/**
 * Format date for display in Indian locale
 * @param {string|Date} value - Date value
 * @returns {string} - Formatted date string
 */
export const formatDisplayDate = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/**
 * Format date for job cards (shorter format)
 * @param {string|Date} value - Date value
 * @returns {string} - Formatted date string
 */
export const formatJobDate = (value) => {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("en-IN", { 
      month: "short", 
      day: "numeric" 
    });
  } catch {
    return "";
  }
};

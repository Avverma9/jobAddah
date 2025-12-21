/**
 * Private Jobs API Service
 */
import api from "../util/apiClient";

/**
 * Fetch private job categories
 * @returns {Promise<Array>} - Array of category objects
 */
export const fetchPrivateCategories = async () => {
  try {
    const response = await api.post("/pvt-scrapper/get-categories");
    const categories = Array.isArray(response)
      ? response
      : response.categories || response.data || [];
    return categories;
  } catch (error) {
    console.error("Failed to load private job categories:", error);
    return [];
  }
};

/**
 * Fetch jobs for a specific category
 * @param {string} categoryUrl - Category URL to scrape
 * @returns {Promise<Array>} - Array of job objects
 */
export const fetchCategoryJobs = async (categoryUrl) => {
  try {
    const response = await api.post("/pvt-scrapper/scrape-category", {
      url: categoryUrl,
    });

    // Parse response - API returns different formats
    if (Array.isArray(response)) {
      return response;
    }
    if (Array.isArray(response?.jobs)) {
      return response.jobs;
    }
    if (Array.isArray(response?.data)) {
      return response.data;
    }
    if (Array.isArray(response?.sections)) {
      return response.sections;
    }
    return [];
  } catch (error) {
    console.warn("Failed to load jobs for category:", categoryUrl, error);
    return [];
  }
};

/**
 * Load all categories with their jobs concurrently
 * @param {Array} categories - Array of category objects
 * @param {number} concurrency - Number of concurrent requests
 * @param {Function} onCategoryLoaded - Callback when a category is loaded
 * @returns {Promise<Object>} - Object mapping category links to jobs
 */
export const loadAllCategoryJobs = async (
  categories,
  concurrency = 2,
  onCategoryLoaded
) => {
  const results = {};
  const links = categories.map((c) => c.link).filter(Boolean);
  
  if (links.length === 0) return results;

  let idx = 0;
  let cancelled = false;

  const worker = async () => {
    while (!cancelled && idx < links.length) {
      const currentIdx = idx++;
      const categoryUrl = links[currentIdx];

      if (!categoryUrl) continue;

      // Notify loading started
      if (onCategoryLoaded) {
        onCategoryLoaded(categoryUrl, { loading: true, jobs: [] });
      }

      const jobs = await fetchCategoryJobs(categoryUrl);
      
      results[categoryUrl] = { loading: false, jobs };
      
      // Notify loading completed
      if (onCategoryLoaded) {
        onCategoryLoaded(categoryUrl, { loading: false, jobs });
      }
    }
  };

  // Start concurrent workers
  await Promise.all(
    Array.from({ length: Math.min(concurrency, links.length) }).map(() => worker())
  );

  return results;
};

const baseUrl = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const searchQuery = process.env.SEARCH_QUERY || "ssc";

const fetchHtml = async (path) => {
  const res = await fetch(`${baseUrl}${path}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.status}`);
  }
  return res.text();
};

const countMatches = (html, pattern) => {
  const matches = html.match(pattern);
  return matches ? matches.length : 0;
};

const run = async () => {
  console.log(`Checking ${baseUrl}...`);

  const viewAllHtml = await fetchHtml("/view-all");
  if (viewAllHtml.includes("Loading posts")) {
    throw new Error("View-all still renders loading state.");
  }
  const viewAllCount = countMatches(viewAllHtml, /<li[^>]*class="group"/g);
  if (viewAllCount < 20) {
    throw new Error(`View-all rendered ${viewAllCount} items (expected >= 20).`);
  }
  console.log(`View-all OK (${viewAllCount} items).`);

  const searchHtml = await fetchHtml(`/search?q=${encodeURIComponent(searchQuery)}`);
  if (searchHtml.toLowerCase().includes("loading search")) {
    throw new Error("Search page still renders loading state.");
  }
  const searchCount = countMatches(searchHtml, /<li[^>]*class="group"/g);
  if (searchCount === 0) {
    throw new Error(`Search rendered 0 results for query "${searchQuery}".`);
  }
  console.log(`Search OK (${searchCount} items for "${searchQuery}").`);
};

run().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});

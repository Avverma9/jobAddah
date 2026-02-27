import { buildCanonicalKey } from "./lib/postFormatter";
import { getStoredJobLists } from "./lib/siteApi";
import { absoluteUrl } from "./lib/seo";

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function toValidDate(value, fallback = new Date()) {
  const date = new Date(value || "");
  return Number.isNaN(date.getTime()) ? fallback : date;
}

function createEntry(path, { changeFrequency, priority, lastModified } = {}) {
  return {
    url: absoluteUrl(path),
    changeFrequency,
    priority,
    lastModified: toValidDate(lastModified),
  };
}

function dedupeEntries(entries = []) {
  const seen = new Set();
  const result = [];

  asArray(entries).forEach((entry) => {
    const url = String(entry?.url || "");

    if (!url || seen.has(url)) {
      return;
    }

    seen.add(url);
    result.push(entry);
  });

  return result;
}

async function getPostEntries() {
  try {
    const payload = await getStoredJobLists();
    const jobLists = asArray(payload?.jobLists);
    const allPosts = jobLists.flatMap((list) => asArray(list?.postList));

    return allPosts
      .map((post) => {
        const title = String(post?.title || "").trim();
        const jobUrl = String(post?.jobUrl || "").trim();
        const canonicalKey = buildCanonicalKey({ title, jobUrl });

        if (!canonicalKey) {
          return null;
        }

        return createEntry(`/post/${canonicalKey}`, {
          changeFrequency: "hourly",
          priority: 0.8,
          lastModified: post?.fetchedAt || post?.updatedAt || post?.createdAt || new Date(),
        });
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

export default async function sitemap() {
  const now = new Date();
  const staticEntries = [
    createEntry("/", { changeFrequency: "hourly", priority: 1.0, lastModified: now }),
    createEntry("/jobs", { changeFrequency: "hourly", priority: 0.95, lastModified: now }),
    createEntry("/jobs/new-jobs", {
      changeFrequency: "hourly",
      priority: 0.9,
      lastModified: now,
    }),
    createEntry("/jobs/admissions", {
      changeFrequency: "daily",
      priority: 0.8,
      lastModified: now,
    }),
    createEntry("/results", { changeFrequency: "hourly", priority: 0.9, lastModified: now }),
    createEntry("/admit-cards", {
      changeFrequency: "hourly",
      priority: 0.9,
      lastModified: now,
    }),
  ];

  const postEntries = await getPostEntries();

  return dedupeEntries([...staticEntries, ...postEntries]);
}

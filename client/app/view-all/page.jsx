import ViewAllClient from "./ViewAllClient";
import { getBaseUrl } from "@/lib/server-url";

const PAGE_SIZE = 20;

async function fetchViewAllJobs(sectionLink) {
  try {
    const baseUrl = await getBaseUrl();
    // Use dedicated view-all API to fetch all jobs for the selected section
    const query = sectionLink
      ? `?link=${encodeURIComponent(sectionLink)}`
      : "";
    const res = await fetch(`${baseUrl}/api/gov-post/view-all${query}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const payload = await res.json();
    if (payload?.success && Array.isArray(payload.data)) {
      return payload.data;
    }
    if (sectionLink) {
      // Fallback to job-section endpoint if view-all returns empty
      const res2 = await fetch(
        `${baseUrl}/api/gov-post/job-section?link=${encodeURIComponent(
          sectionLink,
        )}`,
        { next: { revalidate: 300 } },
      );
      if (!res2.ok) return [];
      const payload2 = await res2.json();
      if (payload2?.success && Array.isArray(payload2.data)) return payload2.data;
    }
  } catch {
    return [];
  }
  return [];
}

export async function generateMetadata({ searchParams }) {
  const resolved = await searchParams;
  const sectionName = resolved?.name || "All Posts";
  const sectionLink = resolved?.link || "";
  const jobs = await fetchViewAllJobs(sectionLink);
  const shouldIndex = Boolean(jobs.length);

  return {
    title: `View All ${sectionName} - Latest Govt Jobs 2026 | JobsAddah`,
    description: `Browse all latest ${sectionName} notifications. Find your dream government job with JobsAddah.`,
    robots: shouldIndex ? "index,follow" : "noindex,follow",
  };
}

export default async function ViewAllPage({ searchParams }) {
  const resolved = await searchParams;
  const defaultName = "Latest Job";
  const defaultLink = "https://sarkariresult.com.cm/latest-jobs/";
  const sectionName = resolved?.name || defaultName;
  const sectionLink = resolved?.link || defaultLink;
  const jobs = await fetchViewAllJobs(sectionLink);
  const pageRaw = resolved?.page;
  const page = Math.max(1, Number.parseInt(pageRaw || "1", 10) || 1);
  const totalPages = Math.max(1, Math.ceil(jobs.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const paginatedJobs = jobs.slice(start, start + PAGE_SIZE);

  return (
    <ViewAllClient
      initialJobs={paginatedJobs}
      sectionName={sectionName}
      sectionLink={sectionLink}
      currentPage={page}
      totalPages={totalPages}
    />
  );
}

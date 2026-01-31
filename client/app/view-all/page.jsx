import ViewAllClient from "./ViewAllClient";

async function fetchViewAllJobs(sectionLink) {
  if (!sectionLink) return [];
  try {
    // Use dedicated view-all API to fetch all jobs for the selected section
    const res = await fetch(
      `/api/gov-post/view-all?link=${encodeURIComponent(sectionLink)}`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const payload = await res.json();
    if (payload?.success && Array.isArray(payload.data)) {
      return payload.data;
    }
    // Fallback to job-section endpoint if view-all returns empty
    const res2 = await fetch(
      `/api/gov-post/job-section?link=${encodeURIComponent(sectionLink)}`,
      { cache: "no-store" },
    );
    if (!res2.ok) return [];
    const payload2 = await res2.json();
    if (payload2?.success && Array.isArray(payload2.data)) return payload2.data;
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
  const shouldIndex = Boolean(sectionLink && jobs.length);

  return {
    title: `View All ${sectionName} - Latest Govt Jobs 2026 | JobsAddah`,
    description: `Browse all latest ${sectionName} notifications. Find your dream government job with JobsAddah.`,
    robots: shouldIndex ? "index,follow" : "noindex,follow",
  };
}

export default async function ViewAllPage({ searchParams }) {
  const resolved = await searchParams;
  const sectionName = resolved?.name || "All Posts";
  const sectionLink = resolved?.link || "";
  const jobs = await fetchViewAllJobs(sectionLink);

  return (
    <ViewAllClient
      initialJobs={jobs}
      sectionName={sectionName}
      sectionLink={sectionLink}
    />
  );
}

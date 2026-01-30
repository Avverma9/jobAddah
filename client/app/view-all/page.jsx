import ViewAllClient from "./ViewAllClient";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
  /\/$/,
  "",
);

async function fetchViewAllJobs(sectionLink) {
  if (!sectionLink) return [];
  try {
    const res = await fetch(
      `${SITE_URL}/api/gov-post/view-all?link=${encodeURIComponent(sectionLink)}`,
      { next: { revalidate: 600 } },
    );
    if (!res.ok) return [];
    const payload = await res.json();
    if (payload?.success && Array.isArray(payload.data)) {
      return payload.data;
    }
  } catch {
    return [];
  }
  return [];
}

export async function generateMetadata({ searchParams }) {
  const sectionName = searchParams?.name || "All Posts";
  const sectionLink = searchParams?.link || "";
  const jobs = await fetchViewAllJobs(sectionLink);
  const shouldIndex = Boolean(sectionLink && jobs.length);

  return {
    title: `View All ${sectionName} - Latest Govt Jobs 2026 | JobsAddah`,
    description: `Browse all latest ${sectionName} notifications. Find your dream government job with JobsAddah.`,
    robots: shouldIndex ? "index,follow" : "noindex,follow",
  };
}

export default async function ViewAllPage({ searchParams }) {
  const sectionName = searchParams?.name || "All Posts";
  const sectionLink = searchParams?.link || "";
  const jobs = await fetchViewAllJobs(sectionLink);

  return <ViewAllClient initialJobs={jobs} sectionName={sectionName} />;
}

import ViewAllClient from "./ViewAllClient";

export async function generateMetadata({ searchParams }) {
  const resolved = await searchParams;
  const sectionName = resolved?.name || "All Posts";

  return {
    title: `View All ${sectionName} - Latest Govt Jobs 2026 | JobsAddah`,
    description: `Browse all latest ${sectionName} notifications. Find your dream government job with JobsAddah.`,
    robots: "index,follow",
  };
}

export default async function ViewAllPage({ searchParams }) {
  const resolved = await searchParams;
  const defaultName = "Latest Job";
  const sectionName = resolved?.name || defaultName;
  const pageRaw = resolved?.page;
  const page = Math.max(1, Number.parseInt(pageRaw || "1", 10) || 1);
  return (
    <ViewAllClient
      sectionName={sectionName}
      initialPage={page}
    />
  );
}

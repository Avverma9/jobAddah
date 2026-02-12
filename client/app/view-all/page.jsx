import ViewAllClient from "./ViewAllClient";
import { getViewAllJobs } from "@/lib/server/getViewAllJobs";
import { toCategoryKey } from "@/lib/category-utils";

export async function generateMetadata({ searchParams }) {
  const resolved = await searchParams;
  const sectionName = resolved?.name || "All Posts";
  const category = resolved?.category
    ? toCategoryKey(resolved.category)
    : resolved?.name
      ? toCategoryKey(resolved.name)
      : "";
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://jobsaddah.com").replace(/\/$/, "");
  const qs = new URLSearchParams();
  if (sectionName && sectionName !== "All Posts") qs.set("name", sectionName);
  if (category) qs.set("category", category);
  const canonical = qs.size ? `${siteUrl}/view-all?${qs.toString()}` : `${siteUrl}/view-all`;

  return {
    title: `View All ${sectionName} - Latest Govt Jobs 2026 | JobsAddah`,
    description: `Browse all latest ${sectionName} notifications. Find your dream government job with JobsAddah.`,
    alternates: { canonical },
    robots: "noindex,follow",
  };
}

export default async function ViewAllPage({ searchParams }) {
  const resolved = await searchParams;
  const defaultName = "Latest Job";
  const category = resolved?.category
    ? toCategoryKey(resolved.category)
    : resolved?.name
      ? toCategoryKey(resolved.name)
      : "";
  const sectionName = resolved?.name || defaultName;
  const pageRaw = resolved?.page;
  const page = Math.max(1, Number.parseInt(pageRaw || "1", 10) || 1);
  const initialJobs = await getViewAllJobs(category);
  return (
    <ViewAllClient
      sectionName={sectionName}
      sectionCategory={category}
      initialJobs={initialJobs}
      initialPage={page}
    />
  );
}

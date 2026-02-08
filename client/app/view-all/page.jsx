import ViewAllClient from "./ViewAllClient";
import { getViewAllJobs } from "@/lib/server/getViewAllJobs";
import { cookies } from "next/headers";

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
  const cookieStore = await cookies();
  const cookieLink = cookieStore.get("view_all_link")?.value || "";
  const link = resolved?.link || cookieLink || "";
  const pageRaw = resolved?.page;
  const page = Math.max(1, Number.parseInt(pageRaw || "1", 10) || 1);
  const initialJobs = await getViewAllJobs(link);
  return (
    <ViewAllClient
      sectionName={sectionName}
      sectionLink={link}
      initialJobs={initialJobs}
      initialPage={page}
    />
  );
}

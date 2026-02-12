import JobSectionsClient from "./JobSectionsClient";
import { getJobSections } from "@/lib/server/getJobSections";

export async function generateMetadata({ searchParams } = {}) {
  const resolvedSearchParams = await searchParams;
  const data = await getJobSections();
  const hasCategories = Boolean(data?.categories?.length);
  const hasQueryParams =
    resolvedSearchParams && Object.keys(resolvedSearchParams).length > 0;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://jobsaddah.com").replace(/\/$/, "");

  return {
    title: "Sarkari Result 2026 | JobsAddah - Latest Govt Jobs, Admit Card",
    description:
      "Official JobsAddah Sarkari Result portal. Get latest government job updates, admit cards, results, and answer keys in one place.",
    robots: hasQueryParams ? "noindex,follow" : hasCategories ? "index,follow" : "noindex,follow",
    alternates: { canonical: `${siteUrl}/post` },
  };
}

export default async function JobSectionsPage() {
  const data = await getJobSections();
  return <JobSectionsClient initialData={data} />;
}

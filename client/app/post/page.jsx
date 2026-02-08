import JobSectionsClient from "./JobSectionsClient";
import { getBaseUrl } from "@/lib/server-url";

async function fetchJobSections() {
  try {
    const baseUrl = await getBaseUrl();
    // Relative URL keeps the fetch working across prod/preview/local without extra env
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000); // 10s guard to avoid build timeouts
    const res = await fetch(`${baseUrl}/api/gov-post/job-section`, {
      next: { revalidate: 600 },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const payload = await res.json();
    if (payload?.success && Array.isArray(payload.data) && payload.data.length) {
      return payload.data[0];
    }
  } catch {
    return null;
  }
  return null;
}

export async function generateMetadata({ searchParams } = {}) {
  const data = await fetchJobSections();
  const hasCategories = Boolean(data?.categories?.length);
  const hasQueryParams =
    searchParams && Object.keys(searchParams).length > 0;
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
  const data = await fetchJobSections();
  return <JobSectionsClient initialData={data} />;
}

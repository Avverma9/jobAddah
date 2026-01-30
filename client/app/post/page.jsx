import JobSectionsClient from "./JobSectionsClient";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
  /\/$/,
  "",
);

async function fetchJobSections() {
  try {
    const res = await fetch(`${SITE_URL}/api/gov-post/job-section`, {
      next: { revalidate: 600 },
    });
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

export async function generateMetadata() {
  const data = await fetchJobSections();
  const hasCategories = Boolean(data?.categories?.length);

  return {
    title: "Sarkari Result 2026 | JobsAddah - Latest Govt Jobs, Admit Card",
    description:
      "Official JobsAddah Sarkari Result portal. Get latest government job updates, admit cards, results, and answer keys in one place.",
    robots: hasCategories ? "index,follow" : "noindex,follow",
  };
}

export default async function JobSectionsPage() {
  const data = await fetchJobSections();
  return <JobSectionsClient initialData={data} />;
}

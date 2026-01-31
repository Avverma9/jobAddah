import JobSectionsClient from "./JobSectionsClient";

async function fetchJobSections() {
  try {
    // Relative URL keeps the fetch working across prod/preview/local without extra env
    const res = await fetch(`/api/gov-post/job-section`, {
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

import JobDetailServer from "@/components/job/JobDetailServer";
import { loadJobDetail } from "@/lib/job-detail-loader";
import { buildCanonicalPath, pathFromSlugSegments } from "@/lib/job-url";
import { notFound } from "next/navigation";
import { cache } from "react";

const getJobDetail = cache(async (slugSegments) => {
  const normalizedPath = pathFromSlugSegments(slugSegments);
  if (!normalizedPath) return null;
  const resolved = await loadJobDetail({ url: normalizedPath });
  if (resolved) return resolved;

  return {
    data: null,
    canonicalPath: buildCanonicalPath(normalizedPath),
    sourcePath: normalizedPath,
    rawDocument: null,
  };
});

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slugSegments = resolvedParams?.slug;
  const job = await getJobDetail(slugSegments);
  if (!job?.data) {
    return {};
  }

  const title = job.data.title ? `${job.data.title} — JobsAddah` : "Job Details";
  const description = job.data.shortDescription ||
    "Get full details about eligibility, important dates, fees, and official links.";

  return {
    title,
    description,
    alternates: {
      canonical: job.canonicalPath,
    },
    openGraph: {
      title,
      description,
      url: job.canonicalPath,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function JobSlugPage({ params }) {
  const resolvedParams = await params;
  const slugSegments = resolvedParams?.slug;
  const job = await getJobDetail(slugSegments);
  if (!job) {
    notFound();
  }

  const plainData = job.data ? JSON.parse(JSON.stringify(job.data)) : null;
  return (
    <JobDetailServer data={plainData} canonicalPath={job.canonicalPath} sourcePath={job.sourcePath} />
  );
}

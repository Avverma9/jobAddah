import JobDetailView from "@/components/job/JobDetailView";
import { loadJobDetail } from "@/lib/job-detail-loader";
import { pathFromSlugSegments } from "@/lib/job-url";
import { notFound } from "next/navigation";
import { cache } from "react";

const getJobDetail = cache(async (slugSegments) => {
  const normalizedPath = pathFromSlugSegments(slugSegments);
  if (!normalizedPath) return null;
  return loadJobDetail({ url: normalizedPath });
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
  if (!job?.data) {
    notFound();
  }

  return (
    <JobDetailView
      data={job.data}
      canonicalPath={job.canonicalPath}
      sourcePath={job.sourcePath}
    />
  );
}

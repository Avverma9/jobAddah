import { loadJobDetail } from "@/lib/job-detail-loader";
import { notFound, redirect } from "next/navigation";

export default async function LegacyPostPage({ searchParams = {} }) {
  const url = searchParams?.url || null;
  const id = searchParams?.id || null;

  if (!url && !id) {
    notFound();
  }

  const result = await loadJobDetail({ url, id });
  if (!result?.canonicalPath) {
    notFound();
  }

  redirect(result.canonicalPath);
}

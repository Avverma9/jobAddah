import { fetchPostByUrlOrId } from "@/lib/api/gov";
import { extractRecruitmentData } from "@/lib/post-helper";
import { buildCanonicalPath, normalizeJobPath } from "@/lib/job-url";

export async function loadJobDetail({ url, id }) {
  const document = await fetchPostByUrlOrId({ url, id });
  if (!document) return null;

  const sourcePath = normalizeJobPath(document.url || url);
  const canonicalPath = buildCanonicalPath(sourcePath);
  const data = extractRecruitmentData(document.data || document || {});

  return {
    data,
    canonicalPath,
    sourcePath,
    rawDocument: document,
  };
}

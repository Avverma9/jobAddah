import { getBaseUrl } from "@/lib/server-url";

export async function getJobSections() {
  try {
    const baseUrl = await getBaseUrl();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
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

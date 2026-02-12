import { getBaseUrl } from "@/lib/server-url";

export async function getViewAllJobs(category = "") {
  try {
    const baseUrl = await getBaseUrl();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const qs = category ? `?category=${encodeURIComponent(category)}` : "";
    const res = await fetch(`${baseUrl}/api/gov-post/view-all${qs}`, {
      next: { revalidate: 300 },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return [];
    const payload = await res.json();
    if (payload?.success && Array.isArray(payload.data)) {
      return payload.data;
    }
  } catch {
    return [];
  }
  return [];
}

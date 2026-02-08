import { getBaseUrl } from "@/lib/server-url";

export async function getTrendingJobs() {
  try {
    const baseUrl = await getBaseUrl();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(`${baseUrl}/api/gov-post/fav-post`, {
      next: { revalidate: 600 },
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

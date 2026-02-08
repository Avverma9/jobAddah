import { getBaseUrl } from "@/lib/server-url";

export async function getReminders(days = 5) {
  try {
    const baseUrl = await getBaseUrl();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(
      `${baseUrl}/api/gov-post/reminder?days=${encodeURIComponent(days)}`,
      {
        next: { revalidate: 600 },
        signal: controller.signal,
      },
    );
    clearTimeout(timer);
    if (!res.ok) return [];
    const payload = await res.json();
    if (payload?.success) {
      if (Array.isArray(payload.data)) return payload.data;
      if (Array.isArray(payload.reminders)) return payload.reminders;
    }
  } catch {
    return [];
  }
  return [];
}

import { getReminders } from '@/lib/api/gov'

export async function GET(request) {
  return getReminders(request)
}

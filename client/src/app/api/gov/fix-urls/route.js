import { fixAllUrls } from '@/lib/api/gov'

export async function POST(request) {
  return fixAllUrls(request)
}

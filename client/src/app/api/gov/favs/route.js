import { getFavPosts } from '@/lib/api/gov'

export async function GET(request) {
  return getFavPosts(request)
}

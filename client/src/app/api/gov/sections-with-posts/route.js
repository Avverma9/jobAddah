import { getSectionsWithPosts } from '@/lib/api/gov'

export async function GET(request) {
  return getSectionsWithPosts(request)
}

import { findByTitle } from '@/lib/api/gov'

export async function GET(request) {
  return findByTitle(request)
}

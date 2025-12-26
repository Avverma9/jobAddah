import { getGovPostDetails } from '@/lib/api/gov'

export async function GET(request) {
  return getGovPostDetails(request)
}

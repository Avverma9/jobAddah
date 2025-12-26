import { getGovJobSections } from '@/lib/api/gov'

export async function GET(request) {
  return getGovJobSections(request)
}

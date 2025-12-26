import { getGovPostListBySection } from '@/lib/api/gov'

export async function GET(request, context) {
  return getGovPostListBySection(request, context)
}

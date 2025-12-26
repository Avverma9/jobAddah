import { API_URL } from './constants'

export async function fetcher(path, opts) {
  const res = await fetch(`${API_URL}${path}`, opts)
  if (!res.ok) throw new Error('API error')
  return res.json()
}

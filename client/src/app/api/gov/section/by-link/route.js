import { NextResponse } from 'next/server'
import connect from '@/lib/mongodb'
import govPostList from '@/lib/models/gov/joblist'

const escapeRegex = (s) => String(s || '').replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const link = (body.url || '').trim()
    if (!link) {
      return NextResponse.json({ success: false, error: 'url is required in body' }, { status: 400 })
    }

    await connect()

    // find posts whose url starts with the provided link
    const posts = await govPostList
      .find({ url: { $regex: '^' + escapeRegex(link) } })
      .select('url jobs createdAt')
      .sort({ createdAt: -1 })
      .lean()

    const jobs = []
    posts.forEach((p) => {
      if (Array.isArray(p.jobs)) {
        p.jobs.forEach((j) => {
          if (!j || !j.title) return
          if (j.title === 'Privacy Policy' || j.title === 'Sarkari Result') return
          jobs.push({ title: j.title, link: j.link || p.url })
        })
      }
    })

    return NextResponse.json({ success: true, count: jobs.length, jobs }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 })
  }
}

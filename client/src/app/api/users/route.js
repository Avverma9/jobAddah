import { NextResponse } from 'next/server'
import connect from '@/lib/mongodb'
import User from '@/lib/models/user'

function makeToken(email) {
  return Buffer.from(`${email}:${Date.now()}`).toString('base64')
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const name = (body.name || '').trim()
    const email = (body.email || '').trim()
    const mobile = (body.mobile || '').trim()

    if (!name || !email || !mobile) return NextResponse.json({ success: false, error: 'Name, email and mobile are required' }, { status: 400 })

    await connect()

    let existing = await User.findOne({ email })
    if (existing) {
      // return existing user/token
      const token = makeToken(email)
      return NextResponse.json({ success: true, token, data: existing }, { status: 200 })
    }

    const user = new User({ name, email, mobile })
    await user.save()
    const token = makeToken(email)

    return NextResponse.json({ success: true, token, data: user }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 })
  }
}

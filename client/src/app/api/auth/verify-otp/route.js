import { NextResponse } from 'next/server'
import connect from '@/lib/mongodb'
import Otp from '@/lib/models/otp'
import User from '@/lib/models/user'

function makeToken(email) {
  return Buffer.from(`${email}:${Date.now()}`).toString('base64')
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = (body.email || '').trim()
    const code = String(body.code || '').trim()
    if (!email || !code) return NextResponse.json({ success: false, error: 'Email and code are required' }, { status: 400 })

    await connect()
    const record = await Otp.findOne({ email, code }).sort({ createdAt: -1 })
    if (!record) return NextResponse.json({ success: false, error: 'Invalid code' }, { status: 400 })
    if (record.expiresAt && record.expiresAt < new Date()) {
      return NextResponse.json({ success: false, error: 'OTP expired' }, { status: 400 })
    }

    // OTP valid - remove it
    await Otp.deleteMany({ email })

    // check user
    const user = await User.findOne({ email }).lean()
    if (user) {
      const token = makeToken(email)
      return NextResponse.json({ success: true, exists: true, token, data: user }, { status: 200 })
    }

    return NextResponse.json({ success: true, exists: false }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 })
  }
}

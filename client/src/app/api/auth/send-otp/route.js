import { NextResponse } from 'next/server'
import connect from '@/lib/mongodb'
import Otp from '@/lib/models/otp'

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = (body.email || '').trim()
    if (!email) return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })

    // basic email check
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email' }, { status: 400 })
    }

    const code = String(Math.floor(100000 + Math.random() * 900000))
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    await connect()

    // prevent abuse: throttle one OTP per 60 seconds
    const last = await Otp.findOne({ email }).sort({ createdAt: -1 })
    if (last && last.createdAt && (Date.now() - new Date(last.createdAt).getTime()) < 60 * 1000) {
      return NextResponse.json({ success: false, error: 'Please wait before requesting another code' }, { status: 429 })
    }

    await Otp.findOneAndUpdate({ email }, { code, expiresAt }, { upsert: true, new: true })

    // NOTE: implement actual email sending in production. For development, return the code.
    const payload = { success: true, message: 'OTP generated' }
    if (process.env.NODE_ENV !== 'production') payload.code = code

    return NextResponse.json(payload, { status: 200 })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 })
  }
}

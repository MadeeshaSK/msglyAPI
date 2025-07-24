import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { apiKey, phone, otp } = await request.json()
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      )
    }

    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Phone number and OTP are required' },
        { status: 400 }
      )
    }

    // In production, verify OTP against database
    // For demo, we'll accept any 6-digit number
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'Invalid OTP format' },
        { status: 400 }
      )
    }

    // Mock verification (80% success rate)
    const isValid = Math.random() > 0.2

    const response = {
      phone: phone,
      otp: otp,
      status: isValid ? 'verified' : 'invalid',
      timestamp: new Date().toISOString()
    }

    if (!isValid) {
      return NextResponse.json(
        { ...response, error: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }

    return NextResponse.json(response)

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
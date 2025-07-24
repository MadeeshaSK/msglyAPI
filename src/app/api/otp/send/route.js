import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { apiKey, phone } = await request.json()
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      )
    }

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    
    // In production, store OTP in database with expiration
    // For demo, we'll just return it
    
    const response = {
      id: Date.now().toString(),
      phone: phone,
      otp: otp, // In production, don't return OTP in response
      message: `Your verification code is: ${otp}`,
      status: 'sent',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
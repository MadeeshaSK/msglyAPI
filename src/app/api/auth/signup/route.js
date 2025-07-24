import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { email, password, phone, authType, name } = await request.json()
    
    // Basic validation
    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email or phone is required' },
        { status: 400 }
      )
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // In production, check if user already exists in database
    // and hash the password before storing

    const newUser = {
      id: Date.now().toString(),
      name: name || 'New User',
      email: email || `${phone}@phone.local`,
      phone: phone,
      role: 'user',
      apiKey: 'sk-new-' + Math.random().toString(36).substr(2, 9),
      quota: 1000,
      used: 0,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({
      user: newUser,
      message: 'Account created successfully'
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
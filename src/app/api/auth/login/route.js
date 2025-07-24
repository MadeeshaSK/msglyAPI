import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { email, password, phone, authType } = await request.json()
    
    // Simple mock authentication
    // In production, verify against your database
    const users = [
      {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        apiKey: 'sk-admin-' + Math.random().toString(36).substr(2, 9)
      },
      {
        id: '2', 
        email: 'user@example.com',
        name: 'Test User',
        role: 'user',
        apiKey: 'sk-user-' + Math.random().toString(36).substr(2, 9)
      }
    ]

    const user = users.find(u => 
      (authType === 'email' && u.email === email) ||
      (authType === 'phone' && u.phone === phone)
    )

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // In production, verify password hash
    if (password !== 'password123') {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        apiKey: user.apiKey
      },
      message: 'Login successful'
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
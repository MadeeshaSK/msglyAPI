import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const apiKey = searchParams.get('apiKey')
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key is required' },
      { status: 401 }
    )
  }

  // Mock user data - in production, fetch from database
  const userData = {
    id: '1',
    name: 'Test User',
    email: 'user@example.com',
    apiKey: apiKey,
    quota: 1000,
    used: 247,
    validity: '2024-12-31',
    balance: 85.50,
    logs: [
      { id: 1, time: '2024-01-15 14:30:22', type: 'SMS', number: '+1234567890', status: 'Success' },
      { id: 2, time: '2024-01-15 14:25:15', type: 'OTP', number: '+1234567891', status: 'Success' }
    ]
  }

  return NextResponse.json(userData)
}

export async function PUT(request) {
  try {
    const { apiKey, ...updateData } = await request.json()
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      )
    }

    // In production, update user in database
    console.log('Updating user data:', updateData)

    return NextResponse.json({
      message: 'User updated successfully',
      user: { ...updateData, apiKey }
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
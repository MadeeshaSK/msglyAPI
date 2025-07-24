import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const apiKey = searchParams.get('apiKey')
  const action = searchParams.get('action')
  
  if (!apiKey || !apiKey.includes('admin')) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    )
  }

  // Mock admin data
  if (action === 'users') {
    return NextResponse.json({
      users: [
        { id: 1, name: 'John Doe', email: 'john@example.com', quota: 1000, used: 247, status: 'active' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', quota: 2000, used: 1580, status: 'active' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', quota: 500, used: 89, status: 'inactive' },
        { id: 4, name: 'Alice Brown', email: 'alice@example.com', quota: 1500, used: 750, status: 'active' }
      ]
    })
  }

  if (action === 'stats') {
    return NextResponse.json({
      totalUsers: 1247,
      activeUsers: 892,
      totalRequests: 145820,
      successRate: 98.7,
      liveLogs: [
        { id: 1, time: '14:30:45', user: 'user_123', action: 'SMS_SEND', status: 'success' },
        { id: 2, time: '14:30:43', user: 'user_456', action: 'OTP_VERIFY', status: 'success' },
        { id: 3, time: '14:30:41', user: 'user_789', action: 'SMS_SEND', status: 'failed' },
        { id: 4, time: '14:30:39', user: 'user_321', action: 'OTP_SEND', status: 'success' }
      ]
    })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

export async function POST(request) {
  try {
    const { apiKey, action, ...data } = await request.json()
    
    if (!apiKey || !apiKey.includes('admin')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    if (action === 'updateUser') {
      // In production, update user in database
      console.log('Admin updating user:', data)
      return NextResponse.json({ message: 'User updated successfully' })
    }

    if (action === 'setServiceLevel') {
      // In production, update service level in database/config
      console.log('Service level changed to:', data.level)
      return NextResponse.json({ 
        message: `Service level set to ${data.level}`,
        level: data.level
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
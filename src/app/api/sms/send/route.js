import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { apiKey, phone, message, type = 'SMS' } = await request.json()
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      )
    }

    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      )
    }

    // Basic phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock success/failure (90% success rate)
    const isSuccess = Math.random() > 0.1
    
    const response = {
      id: Date.now().toString(),
      phone: phone,
      message: message,
      type: type,
      status: isSuccess ? 'sent' : 'failed',
      timestamp: new Date().toISOString(),
      cost: 0.05 // Mock cost per message
    }

    if (!isSuccess) {
      return NextResponse.json(
        { ...response, error: 'Failed to deliver message' },
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
// src/services/userService.js 

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

// Get User Profile
export const getUserProfile = async (apiKey) => {
  try {
    console.log('🔍 Getting user profile...')
    
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      }
    })
    
    const data = await response.json()
    console.log('🔍 Profile response:', data)
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch profile')
    }
    
    return {
      success: true,
      data: data.data
    }
  } catch (error) {
    console.error('❌ Get profile error:', error)
    throw new Error(error.message)
  }
}

// Update User Profile
export const updateUserProfile = async (apiKey, updates) => {
  try {
    console.log('🔍 Updating user profile...', updates)
    
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(updates)
    })
    
    const data = await response.json()
    console.log('🔍 Update profile response:', data)
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update profile')
    }
    
    return {
      success: true,
      data: data.data,
      message: data.message
    }
  } catch (error) {
    console.error('❌ Update profile error:', error)
    throw new Error(error.message)
  }
}

// Get Dashboard Data
export const getDashboardData = async (apiKey) => {
  try {
    console.log('🔍 Getting dashboard data...')
    
    const response = await fetch(`${API_BASE_URL}/user/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      }
    })
    
    const data = await response.json()
    console.log('🔍 Dashboard response:', data)
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch dashboard data')
    }
    
    return {
      success: true,
      data: data.data
    }
  } catch (error) {
    console.error('❌ Get dashboard data error:', error)
    throw new Error(error.message)
  }
}

// Get User Logs
export const getUserLogs = async (apiKey, options = {}) => {
  try {
    console.log('🔍 Getting user logs...', options)
    console.log('🔍 API Key:', apiKey?.substring(0, 10) + '...')
    
    const { page = 1, limit = 50 } = options
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    
    const url = `${API_BASE_URL}/user/logs?${queryParams}`
    console.log('🔍 Request URL:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      }
    })
    
    console.log('🔍 Logs response status:', response.status)
    
    const data = await response.json()
    console.log('🔍 Logs response data:', data)
    
    if (!response.ok) {
      console.error('❌ Logs API Error:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      })
      throw new Error(data.error || `HTTP ${response.status}: Failed to fetch logs`)
    }
    
    return {
      success: true,
      data: data.data || [],
      pagination: data.pagination || { page: 1, limit: 50, total: 0, hasMore: false }
    }
  } catch (error) {
    console.error('❌ Get logs error:', error)
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message
    })
    throw new Error(error.message)
  }
}

// Send Phone Direct Message
export const sendDirectMessage = async (apiKey, phone, message) => {
  try {
    console.log('🔍 Sending direct message...', { phone, message })
    console.log('🔍 API Key:', apiKey?.substring(0, 20) + '...')
    console.log('🔍 Request URL:', `${API_BASE_URL}/api/direct-message`)
    
    const requestBody = { phone, message }
    console.log('🔍 Request body:', requestBody)
    
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    }
    console.log('🔍 Request headers:', headers)
    
    const response = await fetch(`${API_BASE_URL}/api/direct-message`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
    })
    
    console.log('🔍 Response status:', response.status)
    console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()))
    
    // Try to get response as text first in case it's not JSON
    const responseText = await response.text()
    console.log('🔍 Raw response text:', responseText)
    
    let data
    try {
      data = JSON.parse(responseText)
      console.log('🔍 Parsed response data:', data)
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError)
      console.error('❌ Raw response was:', responseText)
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`)
    }
    
    if (!response.ok) {
      console.error('❌ API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        data: data,
        rawResponse: responseText
      })
      throw new Error(data.error || data.message || `HTTP ${response.status}: ${response.statusText}`)
    }
    
    return {
      success: true,
      message: data.message || 'Message sent successfully'
    }
  } catch (error) {
    console.error('❌ Send message error:', error)
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    throw new Error(error.message)
  }
}

// Send Phone OTP
export const sendOTP = async (apiKey, phone) => {
  try {
    console.log('🔍 Sending OTP...', { phone })
    
    const response = await fetch(`${API_BASE_URL}/api/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({ phone })
    })
    
    const data = await response.json()
    console.log('🔍 Send OTP response:', data)
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send OTP')
    }
    
    return {
      success: true,
      message: data.message || 'OTP sent successfully'
    }
  } catch (error) {
    console.error('❌ Send OTP error:', error)
    throw new Error(error.message)
  }
}

// Resend Phone OTP
export const resendOTP = async (apiKey, phone) => {
  try {
    console.log('🔍 Resending OTP...', { phone })
    
    const response = await fetch(`${API_BASE_URL}/api/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({ phone })
    })
    
    const data = await response.json()
    console.log('🔍 Resend OTP response:', data)
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to resend OTP')
    }
    
    return {
      success: true,
      message: data.message || 'OTP resent successfully'
    }
  } catch (error) {
    console.error('❌ Resend OTP error:', error)
    throw new Error(error.message)
  }
}

// Verify Phone OTP
export const verifyOTP = async (apiKey, phone, otp) => {
  try {
    console.log('🔍 Verifying OTP...', { phone, otp })
    
    const response = await fetch(`${API_BASE_URL}/api/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({ phone, otp })
    })
    
    const data = await response.json()
    console.log('🔍 Verify OTP response:', data)
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to verify OTP')
    }
    
    return {
      success: true,
      message: data.message || 'OTP verified successfully'
    }
  } catch (error) {
    console.error('❌ Verify OTP error:', error)
    throw new Error(error.message)
  }
}

// Send Email Direct Message
export const sendEmail = async (apiKey, email, subject, message) => {
  try {
    console.log('🔍 Sending email...', { email, subject, message })
    
    const response = await fetch(`${API_BASE_URL}/api/email-direct-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({ email, subject, message })
    })
    
    const data = await response.json()
    console.log('🔍 Send email response:', data)
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send email')
    }
    
    return {
      success: true,
      message: data.message || 'Email sent successfully'
    }
  } catch (error) {
    console.error('❌ Send email error:', error)
    throw new Error(error.message)
  }
}

// Send Email OTP
export const sendEmailOTP = async (apiKey, email) => {
  try {
    console.log('🔍 Sending email OTP...', { email })
    
    const response = await fetch(`${API_BASE_URL}/api/send-email-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({ email })
    })
    
    const data = await response.json()
    console.log('🔍 Send email OTP response:', data)
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send email OTP')
    }
    
    return {
      success: true,
      message: data.message || 'Email OTP sent successfully'
    }
  } catch (error) {
    console.error('❌ Send email OTP error:', error)
    throw new Error(error.message)
  }
}

export const resendEmailOTP = async (apiKey, email) => {
  try {
    console.log('🔍 Resending email OTP...', { email })
    
    const response = await fetch(`${API_BASE_URL}/api/resend-email-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({ email })
    })
    
    const data = await response.json()
    console.log('🔍 Resend email OTP response:', data)
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to resend email OTP')
    }
    
    return {
      success: true,
      message: data.message || 'Email OTP resent successfully'
    }
  } catch (error) {
    console.error('❌ Resend email OTP error:', error)
    throw new Error(error.message)
  }
}

// Verify Email OTP
export const verifyEmailOTP = async (apiKey, email, otp) => {
  try {
    console.log('🔍 Verifying email OTP...', { email, otp })
    
    const response = await fetch(`${API_BASE_URL}/api/verify-email-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({ email, otp })
    })
    
    const data = await response.json()
    console.log('🔍 Verify email OTP response:', data)
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to verify email OTP')
    }
    
    return {
      success: true,
      message: data.message || 'Email OTP verified successfully'
    }
  } catch (error) {
    console.error('❌ Verify email OTP error:', error)
    throw new Error(error.message)
  }
}


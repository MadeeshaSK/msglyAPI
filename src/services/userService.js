// src/services/userService.js 

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

// Get User Profile
export const getUserProfile = async (apiKey) => {
  try {
    console.log('🔍 Getting user profile...')
    
    const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
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
    
    const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
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
    
    const response = await fetch(`${API_BASE_URL}/api/user/dashboard`, {
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
    
    const { page = 1, limit = 50 } = options
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    
    const response = await fetch(`${API_BASE_URL}/api/user/logs?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      }
    })
    
    const data = await response.json()
    console.log('🔍 Logs response:', data)
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch logs')
    }
    
    return {
      success: true,
      data: data.data,
      pagination: data.pagination
    }
  } catch (error) {
    console.error('❌ Get logs error:', error)
    throw new Error(error.message)
  }
}

// Send Direct Message
export const sendDirectMessage = async (apiKey, phone, message) => {
  try {
    console.log('🔍 Sending direct message...', { phone, message })
    
    const response = await fetch(`${API_BASE_URL}/api/direct-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({ phone, message })
    })
    
    const data = await response.json()
    console.log('🔍 Send message response:', data)
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send message')
    }
    
    return {
      success: true,
      message: data.message || 'Message sent successfully'
    }
  } catch (error) {
    console.error('❌ Send message error:', error)
    throw new Error(error.message)
  }
}

// Send Email
export const sendEmail = async (apiKey, email, subject, message) => {
  try {
    console.log('🔍 Sending email...', { email, subject, message })
    
    const response = await fetch(`${API_BASE_URL}/api/send-email`, {
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

// Send OTP
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

// Verify OTP
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

// Resend OTP
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
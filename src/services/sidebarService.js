// src/services/sidebarService.js

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

// Get User Profile for Sidebar
export const getSidebarProfile = async (apiKey) => {
  try {
    
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      }
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch profile')
    }
    
    return {
      success: true,
      data: data.data
    }
  } catch (error) {
    throw new Error(error.message)
  }
}

// Update User Profile from Sidebar
export const updateSidebarProfile = async (apiKey, updates) => {
  try {
    
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(updates)
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update profile')
    }
    
    return {
      success: true,
      data: data.data,
      message: data.message
    }
  } catch (error) {
    throw new Error(error.message)
  }
}

// Check if email exists in system
export const checkEmailExists = async (apiKey, email) => {
  try {
    
    const response = await fetch(`${API_BASE_URL}/user/check-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({ email })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to check email')
    }
    
    return {
      success: true,
      exists: data.exists || false
    }
  } catch (error) {
    throw new Error(error.message)
  }
}

// Check if phone exists in system
export const checkPhoneExists = async (apiKey, phone) => {
  try {
    
    const response = await fetch(`${API_BASE_URL}/user/check-phone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({ phone })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to check phone')
    }
    
    return {
      success: true,
      exists: data.exists || false
    }
  } catch (error) {
    throw new Error(error.message)
  }
}

// Send Email Verification Code
export const sendEmailVerification = async (apiKey, email) => {
  try {
    
    const response = await fetch(`${API_BASE_URL}/api/send-email-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({ email })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send email verification')
    }
    
    return {
      success: true,
      message: data.message || 'Email verification sent successfully'
    }
  } catch (error) {
    throw new Error(error.message)
  }
}

// Send Phone Verification Code
export const sendPhoneVerification = async (apiKey, phone) => {
  try {
    
    const response = await fetch(`${API_BASE_URL}/api/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({ phone })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send phone verification')
    }
    
    return {
      success: true,
      message: data.message || 'Phone verification sent successfully'
    }
  } catch (error) {
    throw new Error(error.message)
  }
}

// Verify Email Code
export const verifyEmailCode = async (apiKey, email, code) => {
  try {
    
    const response = await fetch(`${API_BASE_URL}/api/verify-email-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({ email, otp: code })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to verify email code')
    }
    
    return {
      success: true,
      message: data.message || 'Email verified successfully'
    }
  } catch (error) {
    throw new Error(error.message)
  }
}

// Verify Phone Code
export const verifyPhoneCode = async (apiKey, phone, code) => {
  try {
    
    const response = await fetch(`${API_BASE_URL}/api/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({ phone, otp: code })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to verify phone code')
    }
    
    return {
      success: true,
      message: data.message || 'Phone verified successfully'
    }
  } catch (error) {
    throw new Error(error.message)
  }
}

// Upload Profile Picture
export const uploadProfilePicture = async (apiKey, imageFile) => {
    try {
      
      const formData = new FormData()
      formData.append('profilePicture', imageFile)
      
      const response = await fetch(`${API_BASE_URL}/user/profile/picture`, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey
        },
        body: formData
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload profile picture')
      }
      
      return {
        success: true,
        data: data.data,
        message: data.message
      }
    } catch (error) {
      throw new Error(error.message)
    }
}
  
  // Remove Profile Picture
  export const removeProfilePicture = async (apiKey) => {
    try {
      
      const response = await fetch(`${API_BASE_URL}/user/profile/picture`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove profile picture')
      }
      
      return {
        success: true,
        data: data.data,
        message: data.message
      }
    } catch (error) {
      throw new Error(error.message)
    }
}
  
// Delete User Account
export const deleteUserAccount = async (apiKey, userId) => {
    try {
      
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || apiKey 
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account')
      }
      
      return {
        success: true,
        message: data.message || 'Account deleted successfully'
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }
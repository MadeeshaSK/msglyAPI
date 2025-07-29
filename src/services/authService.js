// src/services/authService.js

import { 
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { auth, googleProvider } from './firebase'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const ADMIN_API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY

// Google Sign In
export const signInWithGoogle = async () => {
  let firebaseUser = null;
  
  try {
    console.log('🔍 Starting Google Sign In...')
    
    // 1. Authenticate with Google Firebase
    const result = await signInWithPopup(auth, googleProvider)
    firebaseUser = result.user

    console.log('✅ Firebase authentication successful:', firebaseUser.uid)

    // 2. Try to login with existing backend email-login API
    console.log('🔍 Attempting login with existing account...')
    
    const loginResponse = await fetch(`${API_BASE_URL}/auth/email-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_API_KEY
      },
      body: JSON.stringify({ 
        email: firebaseUser.email
      })
    })
    
    const loginData = await loginResponse.json()
    console.log('🔍 Backend login response:', loginData)
    
    if (loginResponse.ok && loginData.data) {
      // User exists, login successful
      console.log('✅ Login successful with existing account')
      
      return {
        firebaseUser,
        userData: {
          ...loginData.data,
          uid: firebaseUser.uid,
          firebaseUid: firebaseUser.uid
        }
      }
    } else {
      // User doesn't exist
      console.log('❌ Account not found, cleaning up Firebase authentication...')
      
      await Promise.all([
        signOut(auth).catch(e => console.warn('signOut failed:', e)),
        firebaseUser.delete().catch(e => console.warn('user.delete failed:', e))
      ])
      
      console.log('✅ Firebase cleanup completed')
      throw new Error('ACCOUNT_NOT_EXISTS')
    }

  } catch (error) {
    console.error('❌ Google sign in error:', error)
    
    if (firebaseUser || auth.currentUser) {
      console.log('🔍 Performing emergency Firebase cleanup...')
      try {
        await Promise.all([
          signOut(auth).catch(() => {}),
          (firebaseUser || auth.currentUser)?.delete().catch(() => {})
        ])
        
        if (auth.currentUser) {
          await auth.updateCurrentUser(null).catch(() => {})
        }
      } catch (cleanupError) {
        console.error('❌ Emergency cleanup failed:', cleanupError)
      }
    }
    
    if (error.message === 'ACCOUNT_NOT_EXISTS') {
      throw new Error('No account found with this Google email. Please sign up first or use a different sign-in method.')
    }
    
    if (error.code) {
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          throw new Error('Sign-in popup was closed. Please try again.')
        case 'auth/popup-blocked':
          throw new Error('Popup was blocked. Please allow popups and try again.')
        case 'auth/cancelled-popup-request':
          throw new Error('Only one sign-in attempt allowed at a time.')
        case 'auth/network-request-failed':
          throw new Error('Network error. Please check your internet connection.')
        default:
          throw new Error(`Firebase error (${error.code}): ${error.message}`)
      }
    }
    
    throw new Error(`Authentication failed: ${error.message}`)
  }
}

// Google Sign Up
export const signUpWithGoogle = async () => {
  let firebaseUser = null;
  
  try {
    console.log('🔍 Starting Google Sign Up...')
    
    // 1. Authenticate with Google Firebase
    const result = await signInWithPopup(auth, googleProvider)
    firebaseUser = result.user

    console.log('✅ Firebase authentication successful:', firebaseUser.uid)

    // 2. Create account using backend email-signup API
    console.log('🔍 Creating account via email-signup API...')
    
    const signupResponse = await fetch(`${API_BASE_URL}/auth/email-signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_API_KEY
      },
      body: JSON.stringify({ 
        email: firebaseUser.email,
        name: firebaseUser.displayName || 'Google User'
      })
    })
    
    const signupData = await signupResponse.json()
    console.log('🔍 Backend signup response:', signupData)
    
    if (!signupResponse.ok) {
      if (signupData.error && signupData.error.includes('already exists')) {
        // User already exists 
        console.log('❌ Account already exists, cleaning up Firebase authentication...')
        
        await Promise.all([
          signOut(auth).catch(e => console.warn('signOut failed:', e)),
          firebaseUser.delete().catch(e => console.warn('user.delete failed:', e))
        ])
        
        console.log('✅ Firebase cleanup completed')
        throw new Error('ACCOUNT_EXISTS')
      }
      throw new Error(signupData.error || 'Account creation failed')
    }
    
    if (!signupData.data) {
      // No data received 
      console.log('❌ No user data received, cleaning up Firebase authentication...')
      
      await Promise.all([
        signOut(auth).catch(e => console.warn('signOut failed:', e)),
        firebaseUser.delete().catch(e => console.warn('user.delete failed:', e))
      ])
      
      throw new Error('No user data received from backend')
    }
    
    console.log('✅ Account created successfully')
    
    return {
      firebaseUser,
      userData: {
        ...signupData.data,
        uid: firebaseUser.uid,
        firebaseUid: firebaseUser.uid
      }
    }

  } catch (error) {
    console.error('❌ Google sign up error:', error)

    if (firebaseUser || auth.currentUser) {
      console.log('🔍 Performing emergency Firebase cleanup...')
      try {
        await Promise.all([
          signOut(auth).catch(() => {}),
          (firebaseUser || auth.currentUser)?.delete().catch(() => {})
        ])
        
        if (auth.currentUser) {
          await auth.updateCurrentUser(null).catch(() => {})
        }
      } catch (cleanupError) {
        console.error('❌ Emergency cleanup failed:', cleanupError)
      }
    }
    
    if (error.message === 'ACCOUNT_EXISTS') {
      throw new Error('Account already exists with this Google email. Please sign in instead.')
    }
    
    if (error.code) {
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          throw new Error('Sign-in popup was closed. Please try again.')
        case 'auth/popup-blocked':
          throw new Error('Popup was blocked. Please allow popups and try again.')
        case 'auth/cancelled-popup-request':
          throw new Error('Only one sign-in attempt allowed at a time.')
        case 'auth/network-request-failed':
          throw new Error('Network error. Please check your internet connection.')
        default:
          throw new Error(`Firebase error (${error.code}): ${error.message}`)
      }
    }
    
    throw new Error(`Account creation failed: ${error.message}`)
  }
}

// Email Sign In
export const signInWithEmail = async (email, otp) => {
  try {
    console.log('🔍 Starting email sign in with backend...')
    
    // First verify OTP
    const verifyResponse = await fetch(`${API_BASE_URL}/auth/verify-email-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_API_KEY
      },
      body: JSON.stringify({ email, otp })
    })
    
    const verifyData = await verifyResponse.json()
    console.log('🔍 OTP verification response:', verifyData)
    
    if (!verifyResponse.ok) {
      throw new Error(verifyData.error || 'Invalid OTP code')
    }
    
    // After OTP verification, login with email
    const loginResponse = await fetch(`${API_BASE_URL}/auth/email-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_API_KEY
      },
      body: JSON.stringify({ email })
    })
    
    const userData = await loginResponse.json()
    console.log('🔍 Email login response:', userData)
    
    if (!loginResponse.ok) {
      throw new Error(userData.error || 'Failed to login')
    }
    
    return {
      firebaseUser: null,
      userData: userData.data
    }
  } catch (error) {
    console.error('❌ Email sign in error:', error)
    throw new Error(error.message)
  }
}

// Email Sign Up
export const signUpWithEmail = async (email, otp, name) => {
  try {
    console.log('🔍 Starting email sign up with backend...')
    
    // First verify OTP
    const verifyResponse = await fetch(`${API_BASE_URL}/auth/verify-email-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_API_KEY
      },
      body: JSON.stringify({ email, otp })
    })
    
    const verifyData = await verifyResponse.json()
    console.log('🔍 OTP verification response:', verifyData)
    
    if (!verifyResponse.ok) {
      throw new Error(verifyData.error || 'Invalid OTP code')
    }
    
    // After OTP verification, create account
    const signupResponse = await fetch(`${API_BASE_URL}/auth/email-signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_API_KEY
      },
      body: JSON.stringify({ email, name })
    })
    
    const userData = await signupResponse.json()
    console.log('🔍 Email signup response:', userData)
    
    if (!signupResponse.ok) {
      throw new Error(userData.error || 'Failed to create account')
    }
    
    return {
      firebaseUser: null,
      userData: userData.data
    }
  } catch (error) {
    console.error('❌ Email sign up error:', error)
    throw new Error(error.message)
  }
}

// Phone Sign In
export const signInWithPhone = async (phone, otp) => {
  try {
    console.log('🔍 Starting phone sign in...')
    
    // First verify OTP
    const verifyResponse = await fetch(`${API_BASE_URL}/auth/verify-phone-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_API_KEY
      },
      body: JSON.stringify({ phone, otp })
    })
    
    const verifyData = await verifyResponse.json()
    console.log('🔍 OTP verification response:', verifyData)
    
    if (!verifyResponse.ok) {
      throw new Error(verifyData.error || 'Invalid OTP code')
    }
    
    // After OTP verification, login with phone
    const loginResponse = await fetch(`${API_BASE_URL}/auth/phone-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_API_KEY
      },
      body: JSON.stringify({ phone })
    })
    
    const userData = await loginResponse.json()
    console.log('🔍 Phone login response:', userData)
    
    if (!loginResponse.ok) {
      throw new Error(userData.error || 'Failed to login')
    }
    
    return {
      firebaseUser: null,
      userData: userData.data
    }
  } catch (error) {
    console.error('❌ Phone sign in error:', error)
    throw new Error(error.message)
  }
}

// Phone Sign Up
export const signUpWithPhone = async (phone, otp, name) => {
  try {
    console.log('🔍 Starting phone sign up...')
    
    // First verify OTP
    const verifyResponse = await fetch(`${API_BASE_URL}/auth/verify-phone-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_API_KEY
      },
      body: JSON.stringify({ phone, otp })
    })
    
    const verifyData = await verifyResponse.json()
    console.log('🔍 OTP verification response:', verifyData)
    
    if (!verifyResponse.ok) {
      throw new Error(verifyData.error || 'Invalid OTP code')
    }
    
    // After OTP verification, create account
    const signupResponse = await fetch(`${API_BASE_URL}/auth/phone-signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_API_KEY
      },
      body: JSON.stringify({ phone, name })
    })
    
    const userData = await signupResponse.json()
    console.log('🔍 Phone signup response:', userData)
    
    if (!signupResponse.ok) {
      throw new Error(userData.error || 'Failed to create account')
    }
    
    return {
      firebaseUser: null,
      userData: userData.data
    }
  } catch (error) {
    console.error('❌ Phone sign up error:', error)
    throw new Error(error.message)
  }
}

// Send Phone OTP
export const sendPhoneOTP = async (phone) => {
  try {
    console.log('🔍 Sending OTP to:', phone)
    
    const response = await fetch(`${API_BASE_URL}/auth/send-phone-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_API_KEY
      },
      body: JSON.stringify({ phone })
    })
    
    const data = await response.json()
    console.log('🔍 Send OTP response:', data)
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send verification code')
    }
    
    return data
  } catch (error) {
    console.error('❌ Send OTP error:', error)
    throw new Error(error.message)
  }
}

// Resend Phone OTP
export const resendPhoneOTP = async (phone) => {
  try {
    console.log('🔍 Resending OTP to:', phone)
    
    const response = await fetch(`${API_BASE_URL}/auth/resend-phone-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_API_KEY
      },
      body: JSON.stringify({ phone })
    })
    
    const data = await response.json()
    console.log('🔍 Resend OTP response:', data)
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to resend verification code')
    }
    
    return data
  } catch (error) {
    console.error('❌ Resend OTP error:', error)
    throw new Error(error.message)
  }
}

// Send Email OTP
export const sendEmailOTP = async (email) => {
  try {
    console.log('🔍 Sending email OTP to:', email)
    
    const response = await fetch(`${API_BASE_URL}/auth/send-email-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_API_KEY
      },
      body: JSON.stringify({ email })
    })
    
    const data = await response.json()
    console.log('🔍 Send email OTP response:', data)
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send verification code')
    }
    
    return data
  } catch (error) {
    console.error('❌ Send email OTP error:', error)
    throw new Error(error.message)
  }
}

// Resend Email OTP
export const resendEmailOTP = async (email) => {
  try {
    console.log('🔍 Resending email OTP to:', email)
    
    const response = await fetch(`${API_BASE_URL}/auth/resend-email-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_API_KEY
      },
      body: JSON.stringify({ email })
    })
    
    const data = await response.json()
    console.log('🔍 Resend email OTP response:', data)
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to resend verification code')
    }
    
    return data
  } catch (error) {
    console.error('❌ Resend email OTP error:', error)
    throw new Error(error.message)
  }
}

// Verify Email OTP
export const verifyEmailOTP = async (email, otp) => {
  try {
    console.log('🔍 Verifying email OTP for:', email)
    
    const response = await fetch(`${API_BASE_URL}/auth/verify-email-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_API_KEY
      },
      body: JSON.stringify({ email, otp })
    })
    
    const data = await response.json()
    console.log('🔍 Verify email OTP response:', data)
    
    if (!response.ok) {
      throw new Error(data.error || 'Invalid verification code')
    }
    
    return data
  } catch (error) {
    console.error('❌ Verify email OTP error:', error)
    throw new Error(error.message)
  }
}

// Check if user exists
export const checkUserExists = async (email, phone) => {
  try {
    console.log('🔍 Checking if user exists:', { email, phone });
    
    let userData = null;
    
    if (email) {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-key': ADMIN_API_KEY
          }
        });
        
        if (response.ok) {
          const users = await response.json();
          userData = users.data?.find(user => user.email === email);
        }
      } catch (error) {
        console.log('Could not check user existence via admin endpoint');
      }
    }
    
    if (phone && !userData) {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-key': ADMIN_API_KEY
          }
        });
        
        if (response.ok) {
          const users = await response.json();
          userData = users.data?.find(user => user.phone === phone);
        }
      } catch (error) {
        console.log('Could not check user existence via admin endpoint');
      }
    }
    
    return {
      success: true,
      exists: !!userData,
      data: userData
    };
    
  } catch (error) {
    console.error('❌ Check user exists error:', error);
    return {
      success: false,
      exists: false,
      error: error.message
    };
  }
};

// Logout
export const logout = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    throw new Error('Failed to logout')
  }
}
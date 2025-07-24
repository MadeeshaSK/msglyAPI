import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth'
import { auth, googleProvider } from './firebase'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export const signInWithGoogle = async () => {
  try {
    console.log('🔍 Starting Google sign in...')
    const result = await signInWithPopup(auth, googleProvider)
    const firebaseUser = result.user
    
    console.log('✅ Firebase Google auth successful:', {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName
    })
    
    // Try to get existing user first - DON'T create if not found
    console.log('🔍 Checking if user exists in backend...')
    let userData = await getUserFromBackend(firebaseUser.uid, firebaseUser.email)
    
    if (!userData) {
      console.log('👤 User not found in backend - will need to handle this in the calling function')
      // Don't create user here - let the calling function decide based on mode (login vs signup)
      throw new Error('USER_NOT_FOUND_IN_BACKEND')
    } else {
      console.log('✅ Existing user found:', userData)
      return {
        firebaseUser,
        userData
      }
    }
    
  } catch (error) {
    console.error('❌ Google sign in error:', error)
    
    // If user not found in backend, we need to handle this differently
    if (error.message === 'USER_NOT_FOUND_IN_BACKEND') {
      throw error // Re-throw this specific error
    }
    
    throw new Error(error.message)
  }
}

export const signUpWithGoogle = async () => {
  try {
    console.log('🔍 Starting Google sign up...')
    const result = await signInWithPopup(auth, googleProvider)
    const firebaseUser = result.user
    
    console.log('✅ Firebase Google auth successful:', {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName
    })
    
    // Check if user already exists in backend
    console.log('🔍 Checking if user exists in backend...')
    let userData = await getUserFromBackend(firebaseUser.uid, firebaseUser.email)
    
    if (userData) {
      console.log('❌ User already exists in backend')
      throw new Error('USER_ALREADY_EXISTS_IN_BACKEND')
    }
    
    // User doesn't exist, create new user
    console.log('👤 Creating new Google user in backend...')
    userData = await createFirebaseUserInBackend({
      firebaseUid: firebaseUser.uid,
      name: firebaseUser.displayName || 'Google User',
      email: firebaseUser.email,
      phone: null,
      amount: 100,
      validity: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      role: 'user'
    })
    console.log('✅ User created successfully:', userData)
    
    return {
      firebaseUser,
      userData
    }
    
  } catch (error) {
    console.error('❌ Google sign up error:', error)
    
    // If user already exists in backend
    if (error.message === 'USER_ALREADY_EXISTS_IN_BACKEND') {
      throw error // Re-throw this specific error
    }
    
    throw new Error(error.message)
  }
}

export const signInWithEmail = async (email, password) => {
  try {
    console.log('🔍 Starting email sign in...')
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user
    
    console.log('✅ Firebase email auth successful')
    
    // Get user data from your backend
    let userData = await getUserFromBackend(firebaseUser.uid, firebaseUser.email)
    
    // If user doesn't exist in backend, create them
    if (!userData) {
      console.log('👤 User exists in Firebase but not in backend, creating user...')
      userData = await createFirebaseUserInBackend({
        firebaseUid: firebaseUser.uid,
        name: firebaseUser.displayName || email.split('@')[0], // Use email prefix as fallback name
        email: firebaseUser.email,
        phone: null,
        amount: 100,
        validity: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        role: 'user'
      })
      console.log('✅ User created successfully:', userData)
    }
    
    return {
      firebaseUser,
      userData
    }
  } catch (error) {
    console.error('❌ Email sign in error:', error)
    
    // Check if it's a Firebase auth error or backend error
    if (error.code) {
      throw new Error(getAuthErrorMessage(error.code))
    }
    
    throw new Error(error.message)
  }
}

export const signUpWithEmail = async (email, password, name) => {
  try {
    console.log('🔍 Starting email sign up...')
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user
    
    // Update Firebase profile
    await updateProfile(firebaseUser, {
      displayName: name
    })
    
    console.log('✅ Firebase email signup successful')
    
    // Create user in your backend
    const userData = await createFirebaseUserInBackend({
      firebaseUid: firebaseUser.uid,
      name: name,
      email: email,
      phone: null,
      amount: 100,
      validity: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      role: 'user'
    })
    
    return {
      firebaseUser,
      userData
    }
  } catch (error) {
    console.error('❌ Email sign up error:', error)
    
    // If user creation in backend fails but Firebase user was created,
    // we should delete the Firebase user to keep things consistent
    if (error.message.includes('backend') && userCredential?.user) {
      try {
        await userCredential.user.delete()
        console.log('🧹 Cleaned up Firebase user due to backend error')
      } catch (cleanupError) {
        console.error('❌ Failed to cleanup Firebase user:', cleanupError)
      }
    }
    
    throw new Error(getAuthErrorMessage(error.code) || error.message)
  }
}

// Phone authentication using your existing backend OTP API
export const signInWithPhone = async (phone, otp) => {
  try {
    console.log('🔍 Starting phone sign in...')
    
    // First verify OTP using admin authentication
    const verifyResponse = await fetch(`${API_BASE_URL}/api/auth/verify-phone-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY // Use admin key for authentication
      },
      body: JSON.stringify({ phone, otp })
    })
    
    const verifyData = await verifyResponse.json()
    console.log('🔍 OTP verification response:', verifyData)
    
    if (!verifyResponse.ok) {
      throw new Error(verifyData.error || 'Invalid OTP code')
    }
    
    // After OTP verification, get or create user data by phone
    const userResponse = await fetch(`${API_BASE_URL}/api/auth/phone-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY // Use admin key for authentication
      },
      body: JSON.stringify({ phone })
    })
    
    const userData = await userResponse.json()
    console.log('🔍 Phone user data response:', userData)
    
    if (!userResponse.ok) {
      throw new Error(userData.error || 'Failed to get user data')
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

export const sendPhoneOTP = async (phone) => {
  try {
    console.log('🔍 Sending OTP to:', phone)
    
    const response = await fetch(`${API_BASE_URL}/api/auth/send-phone-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY // Use admin key for authentication
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

// Add resend OTP function - same as sendPhoneOTP but with different messaging
export const resendPhoneOTP = async (phone) => {
  try {
    console.log('🔍 Resending OTP to:', phone)
    
    const response = await fetch(`${API_BASE_URL}/api/auth/send-phone-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY // Use admin key for authentication
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

export const logout = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    throw new Error('Failed to logout')
  }
}

// Backend API Functions with better error handling
const getUserFromBackend = async (firebaseUid, email) => {
  try {
    console.log('🔍 Getting user from backend:', { firebaseUid, email })
    console.log('🔍 API URL:', `${API_BASE_URL}/api/auth/get-user`)
    
    const response = await fetch(`${API_BASE_URL}/api/auth/get-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ firebaseUid, email })
    })
    
    console.log('🔍 Backend response status:', response.status)
    
    if (response.status === 404) {
      console.log('👤 User not found in backend')
      return null
    }
    
    // Get response text first to handle both JSON and HTML responses
    const responseText = await response.text()
    
    // Check if response is HTML (error page)
    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
      console.error('❌ API endpoint returned HTML:', responseText.substring(0, 200))
      return null // Treat as user not found instead of throwing error
    }
    
    // Try to parse as JSON
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error('❌ Invalid JSON response:', responseText.substring(0, 100))
      return null
    }
    
    console.log('🔍 Backend response data:', data)
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get user data')
    }
    
    return data.data
  } catch (error) {
    console.error('❌ Get user from backend error:', error)
    return null
  }
}

const createFirebaseUserInBackend = async (userData) => {
  try {
    console.log('🔍 Creating user in backend:', userData)
    console.log('🔍 API URL:', `${API_BASE_URL}/api/auth/create-firebase-user`)
    
    const response = await fetch(`${API_BASE_URL}/api/auth/create-firebase-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })
    
    console.log('🔍 Create user response status:', response.status)
    console.log('🔍 Create user response headers:', Object.fromEntries(response.headers.entries()))
    
    // Get response text first to handle both JSON and HTML responses
    const responseText = await response.text()
    console.log('🔍 Raw response:', responseText.substring(0, 500))
    
    // Check if response is HTML (error page)
    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
      throw new Error(`API endpoint returned HTML instead of JSON. Status: ${response.status}. This usually means the endpoint doesn't exist or there's a server error.`)
    }
    
    // Try to parse as JSON
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      throw new Error(`Invalid JSON response from server: ${responseText.substring(0, 100)}...`)
    }
    
    console.log('🔍 Create user response data:', data)
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: Failed to create user in backend database`)
    }
    
    return data.data
  } catch (error) {
    console.error('❌ Create user in backend error:', error)
    
    // Provide more specific error messages
    if (error.message.includes('fetch')) {
      throw new Error(`Network error: Cannot connect to backend server at ${API_BASE_URL}`)
    }
    
    throw new Error(`Backend error: ${error.message}`)
  }
}

// Add this function to your authService.js
export const checkUserExists = async (email, phone, authType) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/check-user-exists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, phone, authType })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to check user existence')
    }
    
    return data
  } catch (error) {
    console.error('❌ Check user exists error:', error)
    throw new Error(error.message)
  }
}

// Helper function to get user-friendly error messages
const getAuthErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email'
    case 'auth/wrong-password':
      return 'Incorrect password'
    case 'auth/email-already-in-use':
      return 'Email is already registered'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters'
    case 'auth/invalid-email':
      return 'Invalid email address'
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed'
    case 'auth/cancelled-popup-request':
      return 'Only one popup request is allowed at a time'
    default:
      return 'Authentication failed. Please try again.'
  }
}
'use client'
import { useState, useEffect } from 'react'
import { X, Mail, Phone, Eye, EyeOff, Loader2, RefreshCw, Clock } from 'lucide-react'
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signInWithGoogle,
  signUpWithGoogle,  
  signInWithPhone, 
  sendPhoneOTP,
  checkUserExists
} from '@/lib/authService'

export default function AuthModal({ mode, onClose, onLogin, onSwitchMode }) {
  const [authType, setAuthType] = useState('email')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [phoneStep, setPhoneStep] = useState('phone') // 'phone' or 'otp'
  
  // Phone OTP specific states
  const [attempts, setAttempts] = useState(0)
  const [maxAttempts] = useState(3)
  const [resendTimer, setResendTimer] = useState(0)
  const [canResend, setCanResend] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendAttempts, setResendAttempts] = useState(0)
  const [maxResendAttempts] = useState(3)
  const [phoneError, setPhoneError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otp: ''
  })

  // Countdown timer for resend
  useEffect(() => {
    let interval = null
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(timer => {
          if (timer <= 1) {
            setCanResend(true)
            return 0
          }
          return timer - 1
        })
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [resendTimer])

  const startResendTimer = () => {
    setResendTimer(60) // 60 seconds
    setCanResend(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
  
    try {
      if (authType === 'email') {
        // Check if user exists before attempting login/signup
        const userCheck = await checkUserExists(formData.email, null, 'email')
        
        if (mode === 'login') {
          // For login, user must exist
          if (!userCheck.exists) {
            throw new Error('No account found with this email. Please register first.')
          }
          
          const result = await signInWithEmail(formData.email, formData.password)
          
          const userData = {
            id: result.userData.id,
            firebaseUid: result.firebaseUser?.uid,
            name: result.userData.name,
            email: result.userData.email,
            phone: result.userData.phone,
            role: result.userData.role || 'user',
            apiKey: result.userData.apiKey,
            amount: result.userData.amount,
            validity: result.userData.validity
          }
          
          onLogin(userData)
          onClose()
          
        } else {
          // For signup, user must not exist
          if (userCheck.exists) {
            throw new Error('Account already exists with this email.')
          }
          
          // Signup validation
          if (formData.password !== formData.confirmPassword) {
            throw new Error('Passwords do not match')
          }
          if (!formData.name.trim()) {
            throw new Error('Name is required')
          }
          
          const result = await signUpWithEmail(formData.email, formData.password, formData.name)
          
          const userData = {
            id: result.userData.id,
            firebaseUid: result.firebaseUser?.uid,
            name: result.userData.name,
            email: result.userData.email,
            phone: result.userData.phone,
            role: result.userData.role || 'user',
            apiKey: result.userData.apiKey,
            amount: result.userData.amount,
            validity: result.userData.validity
          }
          
          onLogin(userData)
          onClose()
        }
        
      } else if (authType === 'phone') {
        if (phoneStep === 'phone') {
          // Enhanced phone validation before sending OTP
          const phoneValidationError = validatePhoneNumber(formData.phone)
          if (phoneValidationError) {
            throw new Error(phoneValidationError)
          }
          
          // Additional check for minimum length
          const digitsOnly = formData.phone.replace(/\D/g, '')
          if (digitsOnly.length < 10) {
            throw new Error('Please enter a complete phone number')
          }
          
          // Check if phone number looks complete for common formats
          if (formData.phone.startsWith('+94') && digitsOnly.length !== 11) {
            throw new Error('Sri Lankan phone numbers should be 11 digits (+94XXXXXXXXX)')
          }
          if (formData.phone.startsWith('+1') && digitsOnly.length !== 11) {
            throw new Error('US/Canada phone numbers should be 11 digits (+1XXXXXXXXXX)')
          }
          if (formData.phone.startsWith('+44') && (digitsOnly.length < 12 || digitsOnly.length > 13)) {
            throw new Error('UK phone numbers should be 12-13 digits')
          }
          
          // Check if user exists before sending OTP
          const userCheck = await checkUserExists(null, formData.phone, 'phone')
          
          if (mode === 'login') {
            // For login, user must exist
            if (!userCheck.exists) {
              throw new Error('No account found with this phone number. Please register first.')
            }
          } else {
            // For signup, user must not exist
            if (userCheck.exists) {
              throw new Error('Account already exists with this phone number. Please log in instead.')
            }
          }
          
          // Send OTP
          await sendPhoneOTP(formData.phone)
          setPhoneStep('otp')
          setAttempts(0)
          startResendTimer()
        } else {
          // Check attempt limit
          if (attempts >= maxAttempts) {
            throw new Error(`Maximum ${maxAttempts} attempts reached. Please try again later.`)
          }
  
          try {
            // Verify OTP and login
            const result = await signInWithPhone(formData.phone, formData.otp)
            
            const userData = {
              id: result.userData.id,
              firebaseUid: null,
              name: result.userData.name,
              email: result.userData.email,
              phone: result.userData.phone,
              role: result.userData.role || 'user',
              apiKey: result.userData.apiKey,
              amount: result.userData.amount,
              validity: result.userData.validity
            }
            
            onLogin(userData)
            onClose()
          } catch (otpError) {
            const newAttempts = attempts + 1
            setAttempts(newAttempts)
            
            if (newAttempts >= maxAttempts) {
              throw new Error(`Invalid OTP. Maximum attempts (${maxAttempts}) reached. Please request a new OTP.`)
            } else {
              throw new Error(`Invalid OTP. ${maxAttempts - newAttempts} attempts remaining.`)
            }
          }
        }
      }
      
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!canResend || resendLoading) return
    
    // Check resend attempts limit
    if (resendAttempts >= maxResendAttempts) {
      setError(`Maximum ${maxResendAttempts} resend attempts reached. Please try again later.`)
      return
    }
    
    setResendLoading(true)
    setError('')
  
    try {
      await sendPhoneOTP(formData.phone)
      setAttempts(0) // Reset verification attempts on resend
      setResendAttempts(prev => prev + 1) // Increment resend attempts
      setFormData(prev => ({ ...prev, otp: '' })) // Clear OTP field
      startResendTimer()
      setError('') // Clear any previous errors
    } catch (error) {
      setError(error.message)
    } finally {
      setResendLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
  
    try {
      let result
      
      if (mode === 'login') {
        // Use login function
        try {
          result = await signInWithGoogle()
        } catch (error) {
          if (error.message === 'USER_NOT_FOUND_IN_BACKEND') {
            throw new Error('No account found with this Google email. Please register first.')
          }
          throw error
        }
      } else {
        // Use signup function
        try {
          result = await signUpWithGoogle()
        } catch (error) {
          if (error.message === 'USER_ALREADY_EXISTS_IN_BACKEND') {
            throw new Error('Account already exists with this Google email.')
          }
          throw error
        }
      }
      
      const userData = {
        id: result.userData.id,
        firebaseUid: result.firebaseUser.uid,
        name: result.userData.name,
        email: result.userData.email,
        phone: result.userData.phone,
        role: result.userData.role || 'user',
        apiKey: result.userData.apiKey,
        amount: result.userData.amount,
        validity: result.userData.validity
      }
      
      onLogin(userData)
      onClose()
      
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const resetPhoneStep = () => {
    setPhoneStep('phone')
    setFormData(prev => ({ ...prev, otp: '' }))
    setAttempts(0)
    setResendAttempts(0) // Reset resend attempts
    setResendTimer(0)
    setCanResend(false)
    setPhoneError('') 
    setError('')
  }

  const switchMode = () => {
    setError('')
    setPhoneError('') 
    setPhoneStep('phone')
    setAttempts(0)
    setResendTimer(0)
    setCanResend(false)
    setResendAttempts(0)
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      otp: ''
    })
    // Call the parent function to switch mode
    if (onSwitchMode) {
      onSwitchMode()
    }
  }


  const validatePhoneNumber = (phone) => {
    // Remove all non-digit characters except +
    const cleanPhone = phone.replace(/[^\d+]/g, '')
    
    // Check if it starts with +
    if (!cleanPhone.startsWith('+')) {
      return 'Phone number must start with country code (+)'
    }
    
    // Check length (should be between 10-15 digits including country code)
    const digits = cleanPhone.replace(/\D/g, '')
    if (digits.length < 10) {
      return 'Phone number is too short'
    }
    if (digits.length > 15) {
      return 'Phone number is too long'
    }
    
    // Check for common country codes
    const commonCodes = ['+1', '+44', '+91', '+86', '+49', '+33', '+39', '+7', '+81', '+55', '+52', '+34', '+61', '+27', '+20', '+62', '+60', '+65', '+66', '+84', '+94']
    const hasValidCode = commonCodes.some(code => cleanPhone.startsWith(code))
    
    if (!hasValidCode) {
      return 'Please use a valid country code (e.g., +1, +94, +44)'
    }
    
    return null // No error
  }
  
  // Add this phone change handler
  const handlePhoneChange = (e) => {
    let value = e.target.value
    
    // Auto-format: if user starts typing without +, add it
    if (value.length === 1 && value !== '+') {
      value = '+' + value
    }
    
    // Only allow numbers, +, spaces, hyphens, parentheses
    const cleanValue = value.replace(/[^0-9+\s\-\(\)]/g, '')
    
    setFormData({...formData, phone: cleanValue})
    
    // Validate in real-time
    if (cleanValue.length > 3) {
      const error = validatePhoneNumber(cleanValue)
      setPhoneError(error || '')
    } else {
      setPhoneError('')
    }
  }
  
  const handleOTPChange = (e) => {
    const value = e.target.value.toLowerCase() // Convert to lowercase for simple words
    // Allow letters and numbers, limit to 6 characters
    const cleanValue = value.replace(/[^a-z0-9]/g, '').slice(0, 6)
    setFormData(prev => ({ ...prev, otp: cleanValue }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass w-full max-w-md rounded-2xl p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white"
          disabled={loading}
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Auth Type Selector */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => {
              setAuthType('email')
              resetPhoneStep()
            }}
            disabled={loading}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
              authType === 'email' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white/10 text-white/70'
            }`}
          >
            <Mail className="w-4 h-4 inline mr-2" />
            Email
          </button>
          <button
            onClick={() => {
              setAuthType('phone')
              resetPhoneStep()
            }}
            disabled={loading}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
              authType === 'phone' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white/10 text-white/70'
            }`}
          >
            <Phone className="w-4 h-4 inline mr-2" />
            Phone
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {authType === 'email' ? (
            <>
              {mode === 'signup' && (
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-4 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-blue-400 focus:outline-none"
                  required
                  disabled={loading}
                />
              )}
              
              <input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-4 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-blue-400 focus:outline-none"
                required
                disabled={loading}
              />

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full p-4 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-blue-400 focus:outline-none pr-12"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {mode === 'signup' && (
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full p-4 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-blue-400 focus:outline-none"
                  required
                  disabled={loading}
                />
              )}
            </>
          ) : (
            <>
              {phoneStep === 'phone' ? (
                <div>
                  <input
                    type="tel"
                    placeholder="Enter your phone number (+1234567890)"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className={`w-full p-4 bg-white/10 border rounded-lg text-white placeholder-white/60 focus:outline-none ${
                      phoneError 
                        ? 'border-red-500 focus:border-red-400' 
                        : 'border-white/30 focus:border-blue-400'
                    }`}
                    required
                    disabled={loading}
                  />
                  {phoneError && (
                    <p className="text-red-400 text-sm mt-1">{phoneError}</p>
                  )}
                  
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-white/80 text-sm mb-2">
                      Enter the 6-character code sent to
                    </p>
                    <p className="text-white font-medium">{formData.phone}</p>
                  </div>
                  
                  <input
                    type="text"
                    placeholder="enter 6-character code"
                    value={formData.otp}
                    onChange={handleOTPChange}
                    className="w-full p-4 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-blue-400 focus:outline-none text-center text-lg tracking-widest font-mono"
                    required
                    disabled={loading || attempts >= maxAttempts}
                    maxLength={6}
                    autoComplete="off"
                  />
                  
                  {/* Attempts counter */}
                  <div className="flex justify-between text-xs text-white/60">
                    <span>Verification: {attempts}/{maxAttempts}</span>
                    <span>Resend: {resendAttempts}/{maxResendAttempts}</span>
                  </div>
                  {/* Resend button and timer */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={resetPhoneStep}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                      disabled={loading}
                    >
                      Change phone number
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      {resendTimer > 0 ? (
                        <div className="flex items-center text-white/60 text-sm">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{resendTimer}s</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOTP}
                          disabled={!canResend || resendLoading || resendAttempts >= maxResendAttempts}
                          className="flex items-center text-blue-400 hover:text-blue-300 text-sm disabled:text-white/40 disabled:cursor-not-allowed"
                        >
                          {resendLoading ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4 mr-1" />
                          )}
                          {resendAttempts >= maxResendAttempts ? 'Max resends reached' : 'Resend'}
                        </button>
                      )}
                    </div>
                  </div>

                  {attempts >= maxAttempts && (
                    <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
                      <p className="text-yellow-200 text-sm text-center">
                        Maximum attempts reached. Please request a new code.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading || (authType === 'phone' && phoneStep === 'otp' && attempts >= maxAttempts)}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {authType === 'phone' ? (
                  phoneStep === 'phone' ? 'Send Code' : 'Verify & Login'
                ) : (
                  mode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </>
            )}
          </button>
        </form>

        {authType === 'email' && (
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black/20 text-white/60">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full mt-4 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Google</span>
                </>
              )}
            </button>
          </div>
        )}

        <p className="text-center text-white/60 text-sm mt-6">
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={switchMode}
            className="text-blue-400 hover:text-blue-300"
            disabled={loading}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
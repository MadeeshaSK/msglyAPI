// src/components/AuthModal.js

'use client'
import { useState, useEffect } from 'react'
import { X, Mail, Phone, Loader2, RefreshCw, Clock, ArrowLeft } from 'lucide-react'
import { 
  // Firebase-based Google auth only
  signInWithGoogle,
  signUpWithGoogle,
  
  // Backend API auth for email and phone
  signInWithEmail, 
  signUpWithEmail,
  signInWithPhone, 
  signUpWithPhone,
  sendPhoneOTP,
  resendPhoneOTP,
  sendEmailOTP,
  resendEmailOTP,
  
  checkUserExists

} from '../services/authService'

export default function AuthModal({ mode, onClose, onLogin, onSwitchMode }) {
  const [authType, setAuthType] = useState('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [phoneStep, setPhoneStep] = useState('phone') 
  const [emailStep, setEmailStep] = useState('email')
  
  // OTP specific states
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
    setResendTimer(60) 
    setCanResend(false)
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
  
    try {
      if (authType === 'email') {
        if (emailStep === 'email') {
          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(formData.email)) {
            throw new Error('Please enter a valid email address')
          }
          
          // For signup, validate name
          if (mode === 'signup' && !formData.name.trim()) {
            throw new Error('Name is required')
          }
          
          // Check if user exists before attempting login/signup
          const userCheck = await checkUserExists(formData.email, null)
          
          if (mode === 'login') {
            if (!userCheck.exists) {
              throw new Error('No account found with this email. Please register first.')
            }
          } else {
            if (userCheck.exists) {
              throw new Error('Account already exists with this email. Please sign in instead.')
            }
          }
          
          // Send email OTP
          await sendEmailOTP(formData.email)
          setEmailStep('otp')
          setAttempts(0)
          startResendTimer()
        } else {
          // Verify OTP and complete authentication
          if (attempts >= maxAttempts) {
            throw new Error(`Maximum ${maxAttempts} attempts reached. Please try again later.`)
          }

          if (!formData.otp || formData.otp.length !== 6) {
            throw new Error('Please enter the complete 6-character code')
          }

          try {
            let result
            if (mode === 'login') {
              result = await signInWithEmail(formData.email, formData.otp)
            } else {
              result = await signUpWithEmail(formData.email, formData.otp, formData.name)
            }
            
            const userData = {
              id: result.userData.id,
              firebaseUid: null,
              name: result.userData.name,
              email: result.userData.email,
              phone: result.userData.phone,
              role: result.userData.role || 'user',
              apiKey: result.userData.apiKey,
              amount: result.userData.amount || 0,
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
        
      } else if (authType === 'phone') {
        if (phoneStep === 'phone') {
          // Enhanced phone validation before sending OTP
          const phoneValidationError = validatePhoneNumber(formData.phone)
          if (phoneValidationError) {
            throw new Error(phoneValidationError)
          }
          
          const digitsOnly = formData.phone.replace(/\D/g, '')
          if (digitsOnly.length < 10) {
            throw new Error('Please enter a complete phone number')
          }
          
          // For signup, validate name
          if (mode === 'signup' && !formData.name.trim()) {
            throw new Error('Name is required')
          }
          
          // Check if user exists before sending OTP
          const userCheck = await checkUserExists(null, formData.phone)
          
          if (mode === 'login') {
            if (!userCheck.exists) {
              throw new Error('No account found with this phone number. Please register first.')
            }
          } else {
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

          if (!formData.otp || formData.otp.length !== 6) {
            throw new Error('Please enter the complete 6-character code')
          }
  
          try {
            let result
            if (mode === 'login') {
              result = await signInWithPhone(formData.phone, formData.otp)
            } else {
              result = await signUpWithPhone(formData.phone, formData.otp, formData.name)
            }
            
            const userData = {
              id: result.userData.id,
              firebaseUid: null,
              name: result.userData.name,
              email: result.userData.email,
              phone: result.userData.phone,
              role: result.userData.role || 'user',
              apiKey: result.userData.apiKey,
              amount: result.userData.amount || 0,
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

  // Resend OTP handler
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
      if (authType === 'phone') {
        await resendPhoneOTP(formData.phone)
      } else if (authType === 'email') {
        await resendEmailOTP(formData.email)
      }
      
      setAttempts(0) 
      setResendAttempts(prev => prev + 1) 
      setFormData(prev => ({ ...prev, otp: '' })) 
      startResendTimer()
      setError('') 
    } catch (error) {
      setError(error.message)
    } finally {
      setResendLoading(false)
    }
  }
  
  // Handle Google login/signup
  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
  
    try {
      
      let result
      if (mode === 'login') {
        result = await signInWithGoogle()
      } else {
        result = await signUpWithGoogle()
      }
      
      // Validate required data
      if (!result.firebaseUser || !result.userData) {
        throw new Error('Invalid authentication result: missing user data')
      }
      
      // Ensure userData has all required fields with proper fallbacks
      const userData = {
        id: result.userData.id || result.userData.uid || result.firebaseUser.uid,
        firebaseUid: result.firebaseUser.uid,
        name: result.userData.name || result.firebaseUser.displayName || 'Google User',
        email: result.userData.email || result.firebaseUser.email,
        phone: result.userData.phone || null,
        role: result.userData.role || 'user',
        apiKey: result.userData.apiKey || null,
        amount: result.userData.amount || 0,
        validity: result.userData.validity || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
      
      // Validate essential fields
      if (!userData.id || !userData.email) {
        throw new Error('Invalid user data: missing required fields')
      }
      
      onLogin(userData)
      onClose()
      
    } catch (error) {
      
      let errorMessage = 'Authentication failed. Please try again.'
      
      if (error && error.message) {
        if (error.message.includes('No account found') && mode === 'login') {
          errorMessage = 'No account found with this Google email. Please sign up first or use a different sign-in method.'
        } else if (error.message.includes('Account already exists') && mode === 'signup') {
          errorMessage = 'Account already exists with this Google email. Please sign in instead.'
        } else if (error.message.includes('popup-closed-by-user') || error.message.includes('popup was closed')) {
          errorMessage = 'Google sign-in was cancelled. Please try again and complete the process.'
        } else if (error.message.includes('popup-blocked')) {
          errorMessage = 'Popup was blocked. Please allow popups for this site and try again.'
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection and try again.'
        } else {
          errorMessage = error.message
        }
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Reset phone step to initial state
  const resetPhoneStep = () => {
    setPhoneStep('phone')
    setFormData(prev => ({ ...prev, otp: '' }))
    setAttempts(0)
    setResendAttempts(0)
    setResendTimer(0)
    setCanResend(false)
    setPhoneError('') 
    setError('')
  }

  const resetEmailStep = () => {
    setEmailStep('email')
    setFormData(prev => ({ ...prev, otp: '' }))
    setAttempts(0)
    setResendAttempts(0)
    setResendTimer(0)
    setCanResend(false)
    setError('')
  }

  const switchMode = () => {
    setError('')
    setPhoneError('') 
    setPhoneStep('phone')
    setEmailStep('email')
    setAttempts(0)
    setResendTimer(0)
    setCanResend(false)
    setResendAttempts(0)
    setFormData({
      name: '',
      email: '',
      phone: '',
      otp: ''
    })
    
    if (onSwitchMode) {
      onSwitchMode()
    }
  }

  // Validate phone number format
  const validatePhoneNumber = (phone) => {
    const cleanPhone = phone.replace(/[^\d+]/g, '')
    
    if (!cleanPhone.startsWith('+')) {
      return 'Phone number must start with country code (+)'
    }
    
    const digits = cleanPhone.replace(/\D/g, '')
    if (digits.length < 10) {
      return 'Phone number is too short'
    }
    if (digits.length > 15) {
      return 'Phone number is too long'
    }
    
    const commonCodes = ['+1', '+44', '+91', '+86', '+49', '+33', '+39', '+7', '+81', '+55', '+52', '+34', '+61', '+27', '+20', '+62', '+60', '+65', '+66', '+84', '+94']
    const hasValidCode = commonCodes.some(code => cleanPhone.startsWith(code))
    
    if (!hasValidCode) {
      return 'Please use a valid country code (e.g., +1, +94, +44)'
    }
    
    return null
  }
  
  // Handle phone number input change
  const handlePhoneChange = (e) => {
    let value = e.target.value
    
    if (value.length === 1 && value !== '+') {
      value = '+' + value
    }
    
    const cleanValue = value.replace(/[^0-9+\s\-\(\)]/g, '')
    
    setFormData({...formData, phone: cleanValue})
    
    if (cleanValue.length > 3) {
      const error = validatePhoneNumber(cleanValue)
      setPhoneError(error || '')
    } else {
      setPhoneError('')
    }
  }
  
  // Handle OTP input change
  const handleOTPChange = (e) => {
    const value = e.target.value.toLowerCase()
    const cleanValue = value.replace(/[^a-z0-9]/g, '').slice(0, 6)
    setFormData(prev => ({ ...prev, otp: cleanValue }))
  }

  // Render the modal
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass w-full max-w-md rounded-2xl p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
          disabled={loading}
        >
          <X className="w-6 h-6" />
        </button>

        <div>
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
                resetEmailStep()
              }}
              disabled={loading}
              className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                authType === 'email' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </button>
            <button
              onClick={() => {
                setAuthType('phone')
                resetPhoneStep()
                resetEmailStep()
              }}
              disabled={loading}
              className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                authType === 'phone' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <Phone className="w-4 h-4 inline mr-2" />
              Phone
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {authType === 'email' ? (
              <>
                {emailStep === 'email' && (
                  <>
                    {mode === 'signup' && (
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full p-4 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-blue-400 focus:outline-none transition-colors"
                        required
                        disabled={loading}
                      />
                    )}
                    
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value.toLowerCase().trim()})}
                      className="w-full p-4 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-blue-400 focus:outline-none transition-colors"
                      required
                      disabled={loading}
                    />
                  </>
                )}

                {emailStep === 'otp' && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-white/80 text-sm mb-2">
                        Enter the 6-character code sent to
                      </p>
                      <p className="text-white font-medium">{formData.email}</p>
                    </div>
                    
                    <input
                      type="text"
                      placeholder="enter 6-character code"
                      value={formData.otp}
                      onChange={handleOTPChange}
                      className="w-full p-4 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-blue-400 focus:outline-none text-center text-lg tracking-widest font-mono transition-colors"
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
                        onClick={resetEmailStep}
                        className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                        disabled={loading}
                      >
                        <ArrowLeft className="w-4 h-4 inline mr-1" />
                        Change email
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
                            className="flex items-center text-blue-400 hover:text-blue-300 text-sm disabled:text-white/40 disabled:cursor-not-allowed transition-colors"
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
            ) : (
              <>
                {phoneStep === 'phone' ? (
                  <>
                    {mode === 'signup' && (
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full p-4 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-blue-400 focus:outline-none transition-colors"
                        required
                        disabled={loading}
                      />
                    )}
                    
                    <div>
                      <input
                        type="tel"
                        placeholder="Enter your phone number (+1234567890)"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        className={`w-full p-4 bg-white/10 border rounded-lg text-white placeholder-white/60 focus:outline-none transition-colors ${
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
                  </>
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
                      className="w-full p-4 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-blue-400 focus:outline-none text-center text-lg tracking-widest font-mono transition-colors"
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
                        className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                        disabled={loading}
                      >
                        <ArrowLeft className="w-4 h-4 inline mr-1" />
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
                            className="flex items-center text-blue-400 hover:text-blue-300 text-sm disabled:text-white/40 disabled:cursor-not-allowed transition-colors"
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
              disabled={loading || (phoneStep === 'otp' && attempts >= maxAttempts) || (authType === 'email' && emailStep === 'otp' && attempts >= maxAttempts) || (authType === 'phone' && phoneError)}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {authType === 'phone' ? (
                    phoneStep === 'phone' ? 'Send Code' : 'Verify & ' + (mode === 'login' ? 'Login' : 'Sign Up')
                  ) : authType === 'email' ? (
                    emailStep === 'email' ? 'Send Code' : 'Verify & ' + (mode === 'login' ? 'Login' : 'Sign Up')
                  ) : (
                    mode === 'login' ? 'Sign In' : 'Create Account'
                  )}
                </>
              )}
            </button>
          </form>

          {/* Google Sign In - Only for email auth */}
          {authType === 'email' && emailStep === 'email' && (
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
              className="text-blue-400 hover:text-blue-300 transition-colors"
              disabled={loading}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
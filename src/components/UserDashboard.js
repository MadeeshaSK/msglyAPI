// src/components/UserDashboard.js

'use client'
import { useState, useEffect } from 'react'
import { User, Key, Activity, Send, RotateCcw, Shield, Settings, LogOut, X, Mail, Phone, RefreshCw, BarChart3, FileText, CreditCard } from 'lucide-react'
import Sidebar from './Sidebar'
import { 
  getDashboardData,
  getUserLogs,
  sendDirectMessage,
  sendEmail,
  sendOTP,
  verifyOTP,
  resendOTP,
  sendEmailOTP,
  verifyEmailOTP,
  resendEmailOTP
} from '../services/userService'
import PaymentModal from './PaymentModal'

export default function UserDashboard({ user, onLogout }) {

  // State variables
  const [showSidebar, setShowSidebar] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [message, setMessage] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [emailAddress, setEmailAddress] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailOtpCode, setEmailOtpCode] = useState('')
  const [simulatorMode, setSimulatorMode] = useState('sms') 
  const [viewMode, setViewMode] = useState('analytics') 
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [canResend, setCanResend] = useState(false)
  const [resendAttempts, setResendAttempts] = useState(0)
  const [maxResendAttempts] = useState(3)
  const [otpAttempts, setOtpAttempts] = useState(0)
  const [maxOtpAttempts] = useState(3)
  const [emailResendTimer, setEmailResendTimer] = useState(0)
  const [canEmailResend, setCanEmailResend] = useState(false)
  const [emailResendAttempts, setEmailResendAttempts] = useState(0)
  const [emailOtpAttempts, setEmailOtpAttempts] = useState(0)
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarType, setSnackbarType] = useState('') 
  const [logs, setLogs] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  
  // Individual loading states for each button
  const [loadingStates, setLoadingStates] = useState({
    sendMessage: false,
    sendEmail: false,
    sendOTP: false,
    verifyOTP: false,
    resendOTP: false,
    sendEmailOTP: false,
    verifyEmailOTP: false,
    resendEmailOTP: false
  })

  // User data from backend
  const [userStats, setUserStats] = useState({
    apiKey: user.apiKey,
    requestQuota: 0,
    usedQuota: 0,
    remainingQuota: 0,
    validity: '',
    role: user.role || 'user',
    successfulRequests: 0,
    failedRequests: 0,
    totalRequests: 0,
    todayUsage: {
      sms: 0,
      otp: 0,
      email: 0,
      total: 0,
      successRate: 0
    }
  })

  // Helper function to set individual loading states
  const setLoading = (action, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [action]: isLoading
    }))
  }

  // Fetch user dashboard data using userService
  const fetchUserData = async () => {
    setRefreshing(true)
    try {
      const result = await getDashboardData(user.apiKey)
      
      if (result.success) {
        const dashboardData = result.data
        console.log('🔍 Dashboard data received:', dashboardData)
        
        // Use the correct data structure from your API response
        const userUsageStats = dashboardData.user.usageStats || {}
        const summary = dashboardData.summary || {}
        
        setUserStats({
          apiKey: dashboardData.user.apiKey,
          requestQuota: dashboardData.user.amount || 0,
          usedQuota: summary.quotaUsed || userUsageStats.totalRequests || 0,
          remainingQuota: summary.quotaRemaining || dashboardData.user.amount || 0,
          validity: dashboardData.user.validity ? new Date(dashboardData.user.validity).toLocaleDateString() : 'N/A',
          role: dashboardData.user.role,
          // Fixed mapping from your API response
          successfulRequests: summary.quotaUsed || userUsageStats.successfulRequests || 0,
          failedRequests: summary.failedRequests || userUsageStats.failedRequests || 0,
          totalRequests: summary.totalRequests || userUsageStats.totalRequests || 0,
          todayUsage: {
            sms: dashboardData.todayUsage?.sms || 0,
            otp: dashboardData.todayUsage?.otp || 0,
            email: dashboardData.todayUsage?.email || 0,
            total: dashboardData.todayUsage?.total || 0,
            successRate: dashboardData.todayUsage?.successRate || 0
          }
        })
        
        setError('')
      }
    } catch (error) {
      console.error('❌ Error fetching user data:', error)
      setError(`Dashboard error: ${error.message}`)
    } finally {
      setRefreshing(false)
    }
  }

  // Fetch request logs using userService
  const fetchLogs = async () => {
    try {
      console.log('📝 Fetching request logs...')
      
      const result = await getUserLogs(user.apiKey, { page: 1, limit: 50 })
      console.log('📝 Logs result received:', result)
      
      if (result.success) {
        if (result.data && Array.isArray(result.data) && result.data.length > 0) {
          // Transform the logs data to match our frontend format
          const formattedLogs = result.data.map((log, index) => {
            return {
              id: log.id || `log_${Date.now()}_${index}`,
              timestamp: log.timestamp ? new Date(log.timestamp) : new Date(),
              type: log.type || 'UNKNOWN',
              target: log.target || 'N/A',
              status: log.status || 'Unknown',
              message: log.message || ''
            }
          })
          
          setLogs(formattedLogs)
          console.log(`📝 Successfully loaded ${formattedLogs.length} log entries`)
        } else {
          console.log('📝 No logs found - empty array or no data')
          setLogs([])
        }
      } else {
        console.log('📝 Logs request unsuccessful')
        setLogs([])
      }
    } catch (error) {
      console.error('❌ Error fetching logs:', error)
      setLogs([])
    }
  }

  // Initialize dashboard data
  useEffect(() => {
    fetchUserData()
    fetchLogs()
  }, [])

  useEffect(() => {
    if (successMessage) {
      setSnackbarMessage(successMessage)
      setSnackbarType('success')
      setShowSnackbar(true)
      
      const timer = setTimeout(() => {
        setShowSnackbar(false)
        setTimeout(() => {
          setSuccessMessage('')
          setSnackbarMessage('')
        }, 300) // Wait for animation to complete
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])
  
  useEffect(() => {
    if (error) {
      setSnackbarMessage(error)
      setSnackbarType('error')
      setShowSnackbar(true)
      
      const timer = setTimeout(() => {
        setShowSnackbar(false)
        setTimeout(() => {
          setError('')
          setSnackbarMessage('')
        }, 300) // Wait for animation to complete
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

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

  useEffect(() => {
    let interval = null
    if (emailResendTimer > 0) {
      interval = setInterval(() => {
        setEmailResendTimer(timer => {
          if (timer <= 1) {
            setCanEmailResend(true)
            return 0
          }
          return timer - 1
        })
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [emailResendTimer])
  
  const startResendTimer = () => {
    setResendTimer(60) // 60 seconds
    setCanResend(false)
  }

  const startEmailResendTimer = () => {
    setEmailResendTimer(60) // 60 seconds
    setCanEmailResend(false)
  }

  // Handlers for sending messages, OTPs, and emails
  const sendDirectMessageHandler = async () => {
    if (!phoneNumber || !message) {
      setError('Please enter both phone number and message')
      return
    }
  
    setLoading('sendMessage', true)
    setError('')
    setSuccessMessage('')
    
    try {
      const result = await sendDirectMessage(user.apiKey, phoneNumber, message)
      
      if (result.success) {
        setPhoneNumber('')
        setMessage('')
        setSuccessMessage(result.message)
        setError('')
        fetchUserData()
        fetchLogs()
      }
    } catch (error) {
      console.error('❌ Send message error:', error)
      setError(error.message)
    } finally {
      setLoading('sendMessage', false)
    }
  }

  const sendEmailHandler = async () => {
    if (!emailAddress || !emailSubject || !message) {
      setError('Please enter email address, subject, and message')
      return
    }
  
    setLoading('sendEmail', true)
    setError('')
    setSuccessMessage('')
    
    try {
      const result = await sendEmail(user.apiKey, emailAddress, emailSubject, message)
      
      if (result.success) {
        setEmailAddress('')
        setEmailSubject('')
        setMessage('')
        setSuccessMessage(result.message)
        setError('')
        fetchUserData()
        fetchLogs()
      }
    } catch (error) {
      console.error('❌ Send email error:', error)
      setError(error.message)
    } finally {
      setLoading('sendEmail', false)
    }
  }

  const sendOTPHandler = async () => {
    if (!phoneNumber) {
      setError('Please enter phone number')
      return
    }
  
    setLoading('sendOTP', true)
    setError('')
    setSuccessMessage('')
    
    try {
      const result = await sendOTP(user.apiKey, phoneNumber)
      
      if (result.success) {
        setOtpCode('')
        setSuccessMessage(result.message)
        setError('')
        setOtpAttempts(0)
        setResendAttempts(1)
        startResendTimer()
        fetchUserData()
        fetchLogs()
      }
    } catch (error) {
      console.error('❌ Send OTP error:', error)
      setError(error.message)
    } finally {
      setLoading('sendOTP', false)
    }
  }

  const verifyOTPHandler = async () => {
    if (!phoneNumber || !otpCode) {
      setError('Please enter both phone number and OTP code')
      return
    }
  
    if (otpAttempts >= maxOtpAttempts) {
      setError(`Maximum ${maxOtpAttempts} verification attempts reached. Please request a new OTP.`)
      return
    }
  
    setLoading('verifyOTP', true)
    setError('')
    setSuccessMessage('')
    
    try {
      const result = await verifyOTP(user.apiKey, phoneNumber, otpCode)
      
      if (result.success) {
        setOtpCode('')
        setSuccessMessage(result.message)
        setError('')
        setOtpAttempts(0)
        fetchLogs()
      }
    } catch (error) {
      const newAttempts = otpAttempts + 1
      setOtpAttempts(newAttempts)
      
      if (newAttempts >= maxOtpAttempts) {
        setError(`Invalid OTP. Maximum attempts (${maxOtpAttempts}) reached. Please request a new OTP.`)
      } else {
        setError(`Invalid OTP. ${maxOtpAttempts - newAttempts} attempts remaining.`)
      }
    } finally {
      setLoading('verifyOTP', false)
    }
  }

  const resendOTPHandler = async () => {
    if (!canResend || loadingStates.resendOTP) return
    
    if (resendAttempts >= maxResendAttempts) {
      setError(`Maximum ${maxResendAttempts} resend attempts reached. Please try again later.`)
      return
    }
  
    setLoading('resendOTP', true)
    setError('')
    setSuccessMessage('')
    
    try {
      const result = await resendOTP(user.apiKey, phoneNumber)
      
      if (result.success) {
        setOtpAttempts(0)
        setResendAttempts(prev => prev + 1)
        setOtpCode('')
        startResendTimer()
        setSuccessMessage(result.message)
        setError('')
        fetchUserData()
        fetchLogs()
      }
    } catch (error) {
      console.error('❌ Resend OTP error:', error)
      setError(error.message)
    } finally {
      setLoading('resendOTP', false)
    }
  }

  const sendEmailOTPHandler = async () => {
    if (!emailAddress) {
      setError('Please enter email address')
      return
    }
  
    setLoading('sendEmailOTP', true)
    setError('')
    setSuccessMessage('')
    
    try {
      const result = await sendEmailOTP(user.apiKey, emailAddress)
      
      if (result.success) {
        setEmailOtpCode('')
        setSuccessMessage(result.message)
        setError('')
        setEmailOtpAttempts(0)
        setEmailResendAttempts(1)
        startEmailResendTimer()
        fetchUserData()
        fetchLogs()
      }
    } catch (error) {
      console.error('❌ Send email OTP error:', error)
      setError(error.message)
    } finally {
      setLoading('sendEmailOTP', false)
    }
  }

  const verifyEmailOTPHandler = async () => {
    if (!emailAddress || !emailOtpCode) {
      setError('Please enter both email address and OTP code')
      return
    }
  
    if (emailOtpAttempts >= maxOtpAttempts) {
      setError(`Maximum ${maxOtpAttempts} verification attempts reached. Please request a new email OTP.`)
      return
    }
  
    setLoading('verifyEmailOTP', true)
    setError('')
    setSuccessMessage('')
    
    try {
      const result = await verifyEmailOTP(user.apiKey, emailAddress, emailOtpCode)
      
      if (result.success) {
        setEmailOtpCode('')
        setSuccessMessage(result.message)
        setError('')
        setEmailOtpAttempts(0)
        fetchLogs()
      }
    } catch (error) {
      const newAttempts = emailOtpAttempts + 1
      setEmailOtpAttempts(newAttempts)
      
      if (newAttempts >= maxOtpAttempts) {
        setError(`Invalid email OTP. Maximum attempts (${maxOtpAttempts}) reached. Please request a new OTP.`)
      } else {
        setError(`Invalid email OTP. ${maxOtpAttempts - newAttempts} attempts remaining.`)
      }
    } finally {
      setLoading('verifyEmailOTP', false)
    }
  }

  const resendEmailOTPHandler = async () => {
    if (!canEmailResend || loadingStates.resendEmailOTP) return
    
    if (emailResendAttempts >= maxResendAttempts) {
      setError(`Maximum ${maxResendAttempts} email resend attempts reached. Please try again later.`)
      return
    }
  
    setLoading('resendEmailOTP', true)
    setError('')
    setSuccessMessage('')
    
    try {
      const result = await resendEmailOTP(user.apiKey, emailAddress)
      
      if (result.success) {
        setEmailOtpAttempts(0)
        setEmailResendAttempts(prev => prev + 1)
        setEmailOtpCode('')
        startEmailResendTimer()
        setSuccessMessage(result.message)
        setError('')
        fetchUserData()
        fetchLogs()
      }
    } catch (error) {
      console.error('❌ Resend email OTP error:', error)
      setError(error.message)
    } finally {
      setLoading('resendEmailOTP', false)
    }
  }

  const copyApiKey = () => {
    navigator.clipboard.writeText(userStats.apiKey)
    setSuccessMessage('API Key copied to clipboard!')
  }

  const handleRefresh = () => {
    setError('')
    fetchUserData()
    fetchLogs()
  }

  const handleProfileUpdate = (updatedProfile) => {
    console.log('Profile updated:', updatedProfile)
    fetchUserData()
  }

  const handlePaymentSuccess = (result) => {
    setSuccessMessage(result.message)
    fetchUserData()
  }

  // Determine account plan
  const accountPlan = userStats.requestQuota > 100 ? 'Paid Plan' : 'Free Plan'
  const planColor = userStats.requestQuota > 100 ? 'text-purple-400' : 'text-blue-400'

  // Render the user dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="glass border-b border-white/10">
        <div className="px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-white flex items-center space-x-2">
            <span>
              msgly<span className="text-blue-400">API</span>
            </span>
            <img
              src="/favicon.png" 
              alt="Logo"
              className="w-10 h-10" 
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-white/80 text-sm">
              Welcome, <span className="text-white font-medium">{user.name}</span>
            </div>
            <button
              onClick={() => setShowSidebar(true)}
              className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="glass p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-white/60 text-sm">API Key</p>
                <p className="text-white font-mono text-sm cursor-pointer hover:text-blue-300" 
                   onClick={copyApiKey}
                   title="Click to copy">
                  {userStats.apiKey.substring(0, 20)}...
                </p>
              </div>
              <Key className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="glass p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Remaining Quota</p>
                <p className="text-white text-2xl font-bold">{userStats.remainingQuota}</p>
                <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-400 h-2 rounded-full" 
                    style={{ width: `${userStats.requestQuota > 0 ? ((userStats.remainingQuota / userStats.requestQuota) * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
              <Activity className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="glass p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Valid Until</p>
                <p className="text-white text-lg font-semibold">{userStats.validity}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="glass p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Account Plan</p>
                <p className={`text-lg font-semibold ${planColor}`}>{accountPlan}</p>
              </div>
              <Settings className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
        <button 
          onClick={() => setShowPaymentModal(true)}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <CreditCard className="w-5 h-5" />
          <span>Buy Quota</span>
        </button>
          <button 
            onClick={() => setSimulatorMode(simulatorMode === 'sms' ? 'email' : 'sms')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            {simulatorMode === 'sms' ? <Mail className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
            <span>{simulatorMode === 'sms' ? 'Switch to Email' : 'Switch to SMS'}</span>
          </button>
          <button 
            onClick={() => setViewMode(viewMode === 'analytics' ? 'logs' : 'analytics')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            {viewMode === 'analytics' ? <FileText className="w-5 h-5" /> : <BarChart3 className="w-5 h-5" />}
            <span>{viewMode === 'analytics' ? 'View Request Logs' : 'View Analytics'}</span>
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Message Simulator */}
          <div className="glass p-6 rounded-xl">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            {simulatorMode === 'sms' ? <Phone className="w-6 h-6 mr-2" /> : <Mail className="w-6 h-6 mr-2" />}
            {simulatorMode === 'sms' ? 'SMS Simulator' : 'Email Simulator'}
          </h3>
            <div className="space-y-4">
              {simulatorMode === 'sms' ? (
                <>
                  <input
                    type="tel"
                    placeholder="Phone Number (+1234567890)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={Object.values(loadingStates).some(loading => loading)}
                    className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-blue-400 focus:outline-none disabled:opacity-50"
                  />

                  <textarea
                    placeholder="Your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    disabled={Object.values(loadingStates).some(loading => loading)}
                    className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-blue-400 focus:outline-none resize-none disabled:opacity-50"
                  />

                  <button
                    onClick={sendDirectMessageHandler}
                    disabled={loadingStates.sendMessage}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                    <span>{loadingStates.sendMessage ? 'Sending...' : 'Send Direct Message'}</span>
                  </button>

                  <div className="border-t border-white/20 pt-4">
                    <h4 className="text-white font-medium mb-3">OTP Operations</h4>
                    
                    <div className="flex space-x-2 mb-3">
                      <button
                        onClick={sendOTPHandler}
                        disabled={loadingStates.sendOTP || resendAttempts > 0}
                        className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        <Shield className="w-5 h-5" />
                        <span>{loadingStates.sendOTP ? 'Sending...' : 'Send OTP'}</span>
                      </button>
                      
                      <button
                        onClick={resendOTPHandler}
                        disabled={!canResend || loadingStates.resendOTP || resendAttempts >= maxResendAttempts}
                        className="flex-1 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        <RotateCcw className="w-5 h-5" />
                        <span>
                          {loadingStates.resendOTP ? 'Resending...' : 
                          resendAttempts >= maxResendAttempts ? 'Max Reached' :
                          resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend'}
                        </span>
                      </button>
                    </div>

                    {/* Attempts counter */}
                    <div className="flex justify-between text-xs text-white/60 mb-3">
                      <span>Verification: {otpAttempts}/{maxOtpAttempts}</span>
                      <span>Resend: {resendAttempts}/{maxResendAttempts}</span>
                    </div>

                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Enter OTP code"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        maxLength={6}
                        disabled={Object.values(loadingStates).some(loading => loading) || otpAttempts >= maxOtpAttempts}
                        className="flex-1 p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-blue-400 focus:outline-none disabled:opacity-50"
                      />
                      <button
                        onClick={verifyOTPHandler}
                        disabled={loadingStates.verifyOTP || otpAttempts >= maxOtpAttempts || 
                          resendAttempts === 0 }
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {loadingStates.verifyOTP ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>

                    {/* Max attempts warning */}
                    {otpAttempts >= maxOtpAttempts && (
                      <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mt-3">
                        <p className="text-yellow-200 text-sm text-center">
                          Maximum verification attempts reached. Please request a new OTP.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <input
                    type="email"
                    placeholder="Email Address (user@example.com)"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    disabled={Object.values(loadingStates).some(loading => loading)}
                    className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-blue-400 focus:outline-none disabled:opacity-50"
                  />

                  <input
                    type="text"
                    placeholder="Email Subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    disabled={Object.values(loadingStates).some(loading => loading)}
                    className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-blue-400 focus:outline-none disabled:opacity-50"
                  />

                  <textarea
                    placeholder="Your email message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    disabled={Object.values(loadingStates).some(loading => loading)}
                    className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-blue-400 focus:outline-none resize-none disabled:opacity-50"
                  />

                  <button
                    onClick={sendEmailHandler}
                    disabled={loadingStates.sendEmail}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Mail className="w-5 h-5" />
                    <span>{loadingStates.sendEmail ? 'Sending...' : 'Send Email'}</span>
                  </button>

                  <div className="border-t border-white/20 pt-4">
                    <h4 className="text-white font-medium mb-3">Email OTP Operations</h4>
                    
                    <div className="flex space-x-2 mb-3">
                      <button
                        onClick={sendEmailOTPHandler}
                        disabled={loadingStates.sendEmailOTP || emailResendAttempts > 0}
                        className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        <Shield className="w-5 h-5" />
                        <span>{loadingStates.sendEmailOTP ? 'Sending...' : 'Send Email OTP'}</span>
                      </button>
                      
                      <button
                        onClick={resendEmailOTPHandler}
                        disabled={!canEmailResend || loadingStates.resendEmailOTP || emailResendAttempts >= maxResendAttempts}
                        className="flex-1 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        <RotateCcw className="w-5 h-5" />
                        <span>
                          {loadingStates.resendEmailOTP ? 'Resending...' : 
                          emailResendAttempts >= maxResendAttempts ? 'Max Reached' :
                          emailResendTimer > 0 ? `Resend (${emailResendTimer}s)` : 'Resend'}
                        </span>
                      </button>
                    </div>

                    {/* Email attempts counter */}
                    <div className="flex justify-between text-xs text-white/60 mb-3">
                      <span>Email Verification: {emailOtpAttempts}/{maxOtpAttempts}</span>
                      <span>Email Resend: {emailResendAttempts}/{maxResendAttempts}</span>
                    </div>

                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Enter email OTP code"
                        value={emailOtpCode}
                        onChange={(e) => setEmailOtpCode(e.target.value)}
                        maxLength={6}
                        disabled={Object.values(loadingStates).some(loading => loading) || emailOtpAttempts >= maxOtpAttempts}
                        className="flex-1 p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-blue-400 focus:outline-none disabled:opacity-50"
                      />
                      <button
                        onClick={verifyEmailOTPHandler}
                        disabled={loadingStates.verifyEmailOTP || emailOtpAttempts >= maxOtpAttempts || 
                          emailResendAttempts === 0 }
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {loadingStates.verifyEmailOTP ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>

                    {/* Max attempts warning for email OTP */}
                    {emailOtpAttempts >= maxOtpAttempts && (
                      <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mt-3">
                        <p className="text-yellow-200 text-sm text-center">
                          Maximum email verification attempts reached. Please request a new email OTP.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Analytics or Request Logs */}
          <div className="glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center">
                {viewMode === 'analytics' ? (
                  <>
                    <BarChart3 className="w-6 h-6 mr-2" />
                    Usage Analytics
                  </>
                ) : (
                  <>
                    <FileText className="w-6 h-6 mr-2" />
                    Request Logs
                  </>
                )}
              </h3>
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-3 py-1 bg-white/10 text-white/70 rounded text-sm hover:bg-white/20 transition-colors flex items-center space-x-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
            
            {viewMode === 'analytics' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-white/60 text-sm">Total Requests</p>
                    <p className="text-white text-2xl font-bold">{userStats.totalRequests}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-white/60 text-sm">Success Rate</p>
                    <p className="text-green-400 text-2xl font-bold">
                      {userStats.totalRequests > 0 ? 
                        Math.round((userStats.successfulRequests / userStats.totalRequests) * 100) : 0}%
                    </p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-white/60 text-sm">Successful</p>
                    <p className="text-green-400 text-xl font-bold">{userStats.successfulRequests}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-white/60 text-sm">Failed</p>
                    <p className="text-red-400 text-xl font-bold">{userStats.failedRequests}</p>
                  </div>
                </div>
                
                <div className="border-t border-white/10 pt-4">
                  <h4 className="text-white font-medium mb-3">Today's Usage</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/60">SMS Sent</span>
                      <span className="text-white font-medium">{userStats.todayUsage.sms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">OTP Sent</span>
                      <span className="text-white font-medium">{userStats.todayUsage.otp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Emails Sent</span>
                      <span className="text-white font-medium">{userStats.todayUsage.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Success Rate</span>
                      <span className="text-green-400 font-medium">{userStats.todayUsage.successRate}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left text-white/60 py-2">Time</th>
                      <th className="text-left text-white/60 py-2">Type</th>
                      <th className="text-left text-white/60 py-2">Target</th>
                      <th className="text-left text-white/60 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="py-3 text-white/80 font-mono text-xs">
                          {log.timestamp.toLocaleTimeString()}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            log.type === 'SMS' || log.type === 'DIRECT_MESSAGE' ? 'bg-blue-600/20 text-blue-300' : 
                            log.type === 'OTP' || log.type === 'OTP_SEND' || log.type === 'OTP_VERIFY' ? 'bg-purple-600/20 text-purple-300' :
                            log.type === 'EMAIL' ? 'bg-green-600/20 text-green-300' :
                            'bg-gray-600/20 text-gray-300'
                          }`}>
                            {log.type}
                          </span>
                        </td>
                        <td className="py-3 text-white/80 font-mono text-xs">
                          {log.target || 'N/A'}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            log.status === 'Success' ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {logs.length === 0 && (
                  <div className="text-center text-white/60 py-8">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No requests yet</p>
                    <p className="text-sm">Start sending messages to see logs here</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Additional Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-8">
          {/* Today's Usage Summary */}
          <div className="glass p-6 rounded-xl">
            <h4 className="text-lg font-semibold text-white mb-4">Today&apos;s Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60">Total Requests</span>
                <span className="text-white font-medium">{userStats.todayUsage.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">SMS Sent</span>
                <span className="text-white font-medium">{userStats.todayUsage.sms}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">OTP Operations</span>
                <span className="text-white font-medium">{userStats.todayUsage.otp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Emails Sent</span>
                <span className="text-white font-medium">{userStats.todayUsage.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Success Rate</span>
                <span className="text-green-400 font-medium">{userStats.todayUsage.successRate}%</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="glass p-6 rounded-xl">
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <div className="space-y-2">
              <a 
                href="https://github.com/MadeeshaSK/msgsend?tab=readme-ov-file#-enhanced-otp-sms-system"
                className="block w-full text-left p-2 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                📖 API Documentation
              </a>
              <button 
                onClick={() => setError('Bulk Messaging coming soon!')}
                className="w-full text-left p-2 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                🔧 Bulk Messaging
              </button>
              <a 
                href="/?tab=contact"
                className="block w-full text-left p-2 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                💬 Support Center
              </a>
            </div>
          </div>

          {/* Account Status */}
          <div className="glass p-6 rounded-xl">
            <h4 className="text-lg font-semibold text-white mb-4">Account Status</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-white">Service {userStats.remainingQuota > 0 ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${userStats.requestQuota > 100 ? 'bg-purple-400' : 'bg-blue-400'}`}></div>
                <span className="text-white">{accountPlan}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span className="text-white">Usage {userStats.todayUsage.total > 100 ? 'High' : 'Low'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Snackbar */}
      {snackbarMessage && (
        <div className={`fixed bottom-6 left-6 z-50 transition-all duration-300 ease-in-out transform ${
          showSnackbar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}>
          <div className={`glass rounded-lg p-4 max-w-md shadow-xl border ${
            snackbarType === 'success' 
              ? 'border-green-500/50 bg-green-500/20' 
              : 'border-red-500/50 bg-red-500/20'
          }`}>
            <p className={`text-base ${
              snackbarType === 'success' ? 'text-green-200' : 'text-red-200'
            }`}>
              {snackbarType === 'success' ? '✅ ' : '❌ '}{snackbarMessage}
            </p>
          </div>
        </div>
      )}

      {/* Sidebar */}
      {showSidebar && (
        <Sidebar
          user={user}
          onClose={() => setShowSidebar(false)}
          onLogout={onLogout}
          onProfileUpdate={handleProfileUpdate}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          userStats={userStats}
          onSuccess={handlePaymentSuccess}
          user={user}
        />
      )}
    </div>
  )
}
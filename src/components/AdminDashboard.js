// src/components/AdminDashboard.js

'use client'
import { useState, useEffect, useRef } from 'react'
import { Users, Settings, User, X, Home, BarChart3, MessageSquare, Bell, Loader2, AlertCircle, LogOut, Power, PowerOff, RefreshCw } from 'lucide-react'
import { adminDashboardService } from '../services/adminDashboardService'
import HomeTab from './admin/HomeTab'
import AnalyticsTab from './admin/AnalyticsTab'
import ChatsTab from './admin/ChatsTab'
import NotificationsTab from './admin/NotificationsTab'

export default function AdminDashboard({ user = { name: 'Admin User' }, onLogout = () => {} }) {
  const [showSidebar, setShowSidebar] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState({
    users: [],
    usersPagination: {},
    serverStatus: 'offline',
    serverMessage: 'Server Offline',
    stats: {},
    health: null,
    otpStatus: { enabled: false }
  })
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarType, setSnackbarType] = useState('')
  const [currentProfilePicture, setCurrentProfilePicture] = useState(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showOtpToggleConfirm, setShowOtpToggleConfirm] = useState(false)
  const [pendingOtpAction, setPendingOtpAction] = useState(null) // 'enable' or 'disable'
  const [otpServerLoading, setOtpServerLoading] = useState(false)
  
  // Auto-refresh functionality
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30) // seconds
  const [lastRefresh, setLastRefresh] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const refreshTimer = useRef(null)

  useEffect(() => {
    if (snackbarMessage && snackbarType) {
      setShowSnackbar(true)
      
      const timer = setTimeout(() => {
        setShowSnackbar(false)
        setTimeout(() => {
          setSnackbarMessage('')
          setSnackbarType('')
        }, 300)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [snackbarMessage, snackbarType])
  
  // Add this function to handle snackbar messages (around line 45)
  const showSnackbarMessage = (message, type = 'success') => {
    setSnackbarMessage(message)
    setSnackbarType(type)
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshTimer.current = setInterval(() => {
        quickRefresh()
      }, refreshInterval * 1000)

      return () => {
        if (refreshTimer.current) {
          clearInterval(refreshTimer.current)
        }
      }
    } else {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current)
      }
    }
  }, [autoRefresh, refreshInterval])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current)
      }
    }
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await adminDashboardService.getDashboardData()
      
      if (result.success) {
        setDashboardData(result.data)
        setLastRefresh(new Date())
      }
      
      // Fetch admin profile separately since it's not in dashboard data
      await fetchAdminProfile()
    } catch (error) {
      setError(error.message)
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Quick refresh for status updates without full reload
  const quickRefresh = async () => {
    try {
      setIsRefreshing(true)
      const statusResult = await adminDashboardService.quickStatusCheck()
      
      if (statusResult.success) {
        setDashboardData(prevData => ({
          ...prevData,
          serverStatus: statusResult.serverStatus,
          serverMessage: statusResult.serverMessage,
          health: {
            ...prevData.health,
            ...statusResult.health,
            otpServerEnabled: statusResult.otpServerEnabled
          },
          otpStatus: {
            ...prevData.otpStatus,
            enabled: statusResult.otpServerEnabled
          }
        }))
        setLastRefresh(new Date())
      }
    } catch (error) {
      console.error('Quick refresh failed:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const fetchAdminProfile = async () => {
    try {
      // If user object has an ID, fetch their profile
      if (user && (user.id || user.apiKey)) {
        const profileResult = await adminDashboardService.getAdminProfile(user.id || user.apiKey)
        if (profileResult.success && profileResult.data) {
          setCurrentProfilePicture(profileResult.data.profilePicture || null)
        }
      }
    } catch (error) {
      console.log('Could not fetch admin profile:', error.message)
      // Don't show error to user, just log it
    }
  }

  const getServerStatusColor = () => {
    switch(dashboardData.serverStatus) {
      case 'online': return 'text-green-400'
      case 'offline': return 'text-red-400'
      case 'maintenance': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getServerStatusBgColor = () => {
    switch(dashboardData.serverStatus) {
      case 'online': return 'bg-green-500'
      case 'offline': return 'bg-red-500'
      case 'maintenance': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  // Handle OTP server toggle
  const handleOtpServerToggle = async () => {
    if (!dashboardData.health) return

    const isCurrentlyEnabled = dashboardData.health.otpServerEnabled
    const action = isCurrentlyEnabled ? 'disable' : 'enable'
    
    setPendingOtpAction(action)
    setShowOtpToggleConfirm(true)
  }

  const confirmOtpServerToggle = async () => {
    if (!pendingOtpAction) return

    try {
      setOtpServerLoading(true)
      setShowOtpToggleConfirm(false)
      
      const result = await adminDashboardService.toggleOtpServer(pendingOtpAction === 'enable')
      
      if (result.success) {
        showSnackbarMessage(
          `API Server ${pendingOtpAction === 'enable' ? 'enabled' : 'disabled'} successfully!`, 
          'success'
        )
        // Quick refresh to update status immediately
        await quickRefresh()
      } else {
        showSnackbarMessage(`Failed to ${pendingOtpAction} API server`, 'error')
      }
    } catch (error) {
      showSnackbarMessage(`Error: ${error.message}`, 'error')
    } finally {
      setOtpServerLoading(false)
      setPendingOtpAction(null)
    }
  }

  const cancelOtpServerToggle = () => {
    setShowOtpToggleConfirm(false)
    setPendingOtpAction(null)
  }

  const handleLogout = () => {
    setShowLogoutConfirm(false)
    setShowSidebar(false)
    // Clear refresh timer on logout
    if (refreshTimer.current) {
      clearInterval(refreshTimer.current)
    }
    onLogout()
  }

  const handleManualRefresh = async () => {
    await loadDashboardData()
    showSnackbarMessage('Dashboard refreshed successfully!', 'success')
  }

  const formatLastRefresh = () => {
    if (!lastRefresh) return 'Never'
    const now = new Date()
    const diff = Math.floor((now - lastRefresh) / 1000)
    
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return `${Math.floor(diff / 3600)}h ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error && dashboardData.users.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white text-lg mb-4">Failed to load dashboard</p>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const renderActiveTab = () => {
    switch(activeTab) {
      case 'home':
        return <HomeTab 
          dashboardData={dashboardData} 
          onRefresh={loadDashboardData}
          onShowSnackbar={showSnackbarMessage}
        />
      case 'analysis':
        return <AnalyticsTab dashboardData={dashboardData} />
      case 'chats':
        return <ChatsTab />
      case 'notifications':
        return <NotificationsTab dashboardData={dashboardData} />
      default:
        return <HomeTab 
          dashboardData={dashboardData} 
          onRefresh={loadDashboardData}
          onShowSnackbar={showSnackbarMessage}
        />
    }
  }

  const handleProfileUpdate = (updatedProfile) => {
    if (updatedProfile && updatedProfile.profilePicture !== undefined) {
      setCurrentProfilePicture(updatedProfile.profilePicture)
    }
  
    if (updatedProfile && updatedProfile.user && updatedProfile.user.profilePicture !== undefined) {
      setCurrentProfilePicture(updatedProfile.user.profilePicture)
    }
  
    loadDashboardData()
  }

  const Sidebar = ({ user, onClose }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
      <div className="w-80 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 h-full p-6 glass overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Admin Settings</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white/5 p-4 rounded-lg">
            <p className="text-white/60 text-sm">Logged in as</p>
            <p className="text-white font-medium">{user.name}</p>
          </div>

          {/* Auto-refresh Settings */}
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white/60 text-sm">Auto Refresh</p>
                <p className="text-white/80 text-xs">
                  Last: {formatLastRefresh()}
                  {isRefreshing && <span className="text-yellow-400 ml-1">(updating...)</span>}
                </p>
              </div>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`relative inline-flex items-center cursor-pointer`}
              >
                <div className={`w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/20 ${
                  autoRefresh ? 'bg-purple-600' : 'bg-white/20'
                } transition-colors`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                    autoRefresh ? 'translate-x-5' : 'translate-x-0.5'
                  } mt-0.5`}></div>
                </div>
              </button>
            </div>
            
            {autoRefresh && (
              <div className="mt-3">
                <p className="text-white/60 text-xs mb-2">Refresh every:</p>
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="w-full bg-white/10 text-white text-sm rounded px-2 py-1 border border-white/20 focus:border-purple-400 focus:outline-none"
                >
                  <option value={10}>10 seconds</option>
                  <option value={30}>30 seconds</option>
                  <option value={60}>1 minute</option>
                  <option value={300}>5 minutes</option>
                </select>
              </div>
            )}
            
            <button
              onClick={handleManualRefresh}
              disabled={loading}
              className="w-full mt-3 py-2 bg-purple-600/50 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Manual Refresh</span>
            </button>
          </div>

          {/* OTP Server Toggle */}
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-white/60 text-sm">API Server</p>
                <p className="text-white/80 text-xs">
                  Status: {dashboardData.health?.otpServerEnabled ? 
                    <span className="text-green-400">Enabled</span> : 
                    <span className="text-red-400">Disabled</span>
                  }
                </p>
              </div>
              <button
                onClick={handleOtpServerToggle}
                disabled={otpServerLoading || !dashboardData.health}
                className={`relative inline-flex items-center cursor-pointer ${
                  otpServerLoading ? 'opacity-50' : ''
                }`}
              >
                <div className={`w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/20 ${
                  dashboardData.health?.otpServerEnabled ? 'bg-purple-600' : 'bg-white/20'
                } transition-colors`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                    dashboardData.health?.otpServerEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  } mt-0.5`}>
                    {otpServerLoading && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {!showLogoutConfirm ? (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-200 text-sm text-center">
                  Are you sure you want to logout?
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      <header className="glass border-b border-white/10">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">
              msgly<span className="text-purple-400">API</span>
            </h1>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getServerStatusBgColor()} animate-pulse`}></div>
              <span className={`text-sm font-medium ${getServerStatusColor()}`}>
                {dashboardData.serverMessage || 'Server Status Unknown'}
              </span>
              {isRefreshing && (
                <RefreshCw className="w-3 h-3 text-blue-400 animate-spin ml-1" title="Refreshing..." />
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-white font-bold text-lg">
              Admin<span className="text-purple-400">Panel</span>
            </div>
            <button
              onClick={() => setShowSidebar(true)}
              className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white hover:bg-purple-700 transition-colors overflow-hidden"
            >
              {currentProfilePicture ? (
                <img 
                  src={currentProfilePicture} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="glass p-6 rounded-xl mb-8">
          
          <div className="flex space-x-4">
            {[
              { key: 'home', icon: Home, label: 'Home' },
              { key: 'analysis', icon: BarChart3, label: 'Analysis' },
              { key: 'chats', icon: MessageSquare, label: 'Chats' },
              { key: 'notifications', icon: Bell, label: 'Notifications' }
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                  activeTab === key
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {renderActiveTab()}
      </div>

      {showSidebar && (
        <Sidebar
          user={user}
          onClose={() => setShowSidebar(false)}
          onProfileUpdate={handleProfileUpdate}
          currentProfilePicture={currentProfilePicture}
        />
      )}

      {/* OTP Server Toggle Confirmation Modal */}
      {showOtpToggleConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="glass p-6 rounded-xl max-w-md w-full mx-4">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                pendingOtpAction === 'enable' ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                {pendingOtpAction === 'enable' ? (
                  <Power className="w-8 h-8 text-green-400" />
                ) : (
                  <PowerOff className="w-8 h-8 text-red-400" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {pendingOtpAction === 'enable' ? 'Enable API Server' : 'Disable API Server'}
              </h3>
              <p className="text-white/70 mb-6">
                Are you sure you want to {pendingOtpAction} the OTP server? 
                {pendingOtpAction === 'disable' && ' This will stop all OTP/SMS/Email operations.'}
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={cancelOtpServerToggle}
                  className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmOtpServerToggle}
                  className={`flex-1 py-3 text-white rounded-lg transition-colors ${
                    pendingOtpAction === 'enable' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {pendingOtpAction === 'enable' ? 'Enable' : 'Disable'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

    </div>
  )
}
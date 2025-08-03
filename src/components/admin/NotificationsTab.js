// src/components/admin/notificationsTab.js

'use client'
import { useState, useEffect } from 'react'
import { Bell, Send, Search, Settings, Mail, MessageSquare, Users, Clock, RefreshCw, AlertCircle } from 'lucide-react'
import { notificationsTabService } from '../../services/admin/notificationTabService'

export default function NotificationsTab({ dashboardData }) {
  const [newNotification, setNewNotification] = useState('')
  const [notificationSubject, setNotificationSubject] = useState('')
  const [notificationSearchTerm, setNotificationSearchTerm] = useState('')
  const [notifyEnabledOnly, setNotifyEnabledOnly] = useState(false)
  const [notifyAllUsers, setNotifyAllUsers] = useState(true)
  const [notificationType, setNotificationType] = useState('both') 
  const [notificationHistory, setNotificationHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarType, setSnackbarType] = useState('')

  useEffect(() => {
    loadNotificationHistory()
  }, [])

  // Snackbar useEffects 
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
        }, 300) 
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
        }, 300) 
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Get notification history
  const loadNotificationHistory = async () => {
    try {
      setLoading(true)
      const result = await notificationsTabService.getNotificationHistory()
      if (result.success) {
        setNotificationHistory(result.data)
      }
    } catch (error) {
      setError(`Failed to load notification history: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Send notification
  const handleSendNotification = async () => {
    if (!newNotification.trim()) {
      setError('Please enter a notification message')
      return
    }

    if (notificationType === 'email' && !notificationSubject.trim()) {
      setError('Please enter a subject for email notifications')
      return
    }

    if (!notifyAllUsers && !notifyEnabledOnly) {
      setError('Please select notification recipients')
      return
    }

    const recipientCount = getRecipientCount()
    if (recipientCount === 0) {
      setError('No users match the selected criteria')
      return
    }

    if (recipientCount > 50) {
      const confirm = window.confirm(`You are about to send notifications to ${recipientCount} users. Are you sure you want to continue?`)
      if (!confirm) return
    }

    try {
      setSending(true)
      const result = await notificationsTabService.sendNotification({
        message: newNotification,
        subject: notificationSubject,
        notifyEnabledOnly,
        notifyAllUsers,
        notificationType
      }, dashboardData)
      
      if (result.success) {
        setNewNotification('')
        setNotificationSubject('')
        
        setTimeout(() => {
          loadNotificationHistory()
        }, 1000)
        
        let successMsg = result.message
        if (result.details?.errors?.length > 0) {
          successMsg += ` (${result.details.errors.length} failed)`
        }
        setSuccessMessage(successMsg)
      }
    } catch (error) {
      setError(`Failed to send notification: ${error.message}`)
    } finally {
      setSending(false)
    }
  }

  // templete select
  const handleTemplateSelect = (template) => {
    setNewNotification(template.message)
    if (template.subject && (notificationType === 'email' || notificationType === 'both')) {
      setNotificationSubject(template.subject)
    }
  }

  const getRecipientCount = () => {
    if (!dashboardData?.users?.length) return 0
    
    const users = dashboardData.users
    
    if (notifyAllUsers) {
      if (notificationType === 'email') {
        return users.filter(u => u.email).length
      } else if (notificationType === 'sms') {
        return users.filter(u => u.phone).length
      } else {
        return users.filter(u => u.email || u.phone).length
      }
    } else if (notifyEnabledOnly) {
      if (notificationType === 'email') {
        return users.filter(u => u.emailNotifications && u.email).length
      } else if (notificationType === 'sms') {
        return users.filter(u => u.smsNotifications && u.phone).length
      } else { 
        return users.filter(u => 
          (u.emailNotifications && u.email) || 
          (u.smsNotifications && u.phone)
        ).length
      }
    }
    return 0
  }

  const getNotificationTypeText = () => {
    if (notificationType === 'email') return 'email'
    if (notificationType === 'sms') return 'SMS'
    return 'email and SMS'
  }

  const filteredNotifications = notificationHistory.filter(n =>
    n.message.toLowerCase().includes(notificationSearchTerm.toLowerCase())
  )

  const templates = notificationsTabService.getTemplates()

  return (
    <>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Notification History */}
        <div className="glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <Bell className="w-6 h-6 mr-2" />
              Notification History
            </h3>
            <button
              onClick={loadNotificationHistory}
              disabled={loading}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-50"
              title="Refresh History"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <div className="relative mb-4">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={notificationSearchTerm}
              onChange={(e) => setNotificationSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-purple-400 focus:outline-none"
            />
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center text-white/60 py-8">
                <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin opacity-50" />
                <p>Loading notifications...</p>
              </div>
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div key={notification.id} className="bg-white/5 p-3 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      notification.type === 'warning' ? 'bg-yellow-400' :
                      notification.type === 'success' ? 'bg-green-400' : 
                      notification.type === 'error' ? 'bg-red-400' : 'bg-blue-400'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm break-words">{notification.message}</p>
                      <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                        <p className="text-white/60 text-xs">{notification.time}</p>
                        <div className="text-white/60 text-xs flex items-center space-x-2">
                          <span>{notification.users} user{notification.users !== 1 ? 's' : ''}</span>
                          {notification.method && (
                            <span className="px-2 py-1 bg-white/10 rounded text-xs">
                              {notification.method}
                            </span>
                          )}
                        </div>
                      </div>
                      {notification.userId && (
                        <p className="text-white/40 text-xs mt-1 truncate">ID: {notification.userId}</p>
                      )}
                      {notification.status === 'failed' && (
                        <div className="flex items-center mt-1">
                          <AlertCircle className="w-3 h-3 text-red-400 mr-1" />
                          <p className="text-red-400 text-xs">Failed to send</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-white/60 py-8">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No notification logs found</p>
                <p className="text-xs mt-1">Sent messages will appear here from user logs</p>
              </div>
            )}
          </div>
        </div>

        {/* Send Notification */}
        <div className="glass p-6 rounded-xl">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Send className="w-6 h-6 mr-2" />
            Send Notification
          </h3>
          
          <div className="space-y-4">
            {/* Notification Type Selection */}
            <div>
              <label className="block text-white/60 text-sm mb-2">Notification Method</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setNotificationType('email')}
                  className={`p-2 rounded-lg text-sm flex items-center justify-center space-x-1 transition-all ${
                    notificationType === 'email' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </button>
                <button
                  onClick={() => setNotificationType('sms')}
                  className={`p-2 rounded-lg text-sm flex items-center justify-center space-x-1 transition-all ${
                    notificationType === 'sms' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>SMS</span>
                </button>
                <button
                  onClick={() => setNotificationType('both')}
                  className={`p-2 rounded-lg text-sm flex items-center justify-center space-x-1 transition-all ${
                    notificationType === 'both' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Both</span>
                </button>
              </div>
            </div>

            {/* Subject field for emails */}
            {(notificationType === 'email' || notificationType === 'both') && (
              <div>
                <label className="block text-white/60 text-sm mb-2">
                  Email Subject {(notificationType === 'email' || notificationType === 'both') && 
                  <span className="text-red-400">*</span>}
                </label>
                <input
                  type="text"
                  value={notificationSubject}
                  onChange={(e) => setNotificationSubject(e.target.value)}
                  placeholder="Enter email subject..."
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-purple-400 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-white/60 text-sm mb-2">
                Message <span className="text-red-400">*</span>
              </label>
              <textarea
                value={newNotification}
                onChange={(e) => setNewNotification(e.target.value)}
                placeholder="Enter your notification message..."
                className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-purple-400 focus:outline-none resize-none"
                rows={4}
              />
              <p className="text-white/40 text-xs mt-1">
                {newNotification.length}/500 characters
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Send to notification-enabled users only</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyEnabledOnly}
                    onChange={(e) => {
                      setNotifyEnabledOnly(e.target.checked)
                      if (e.target.checked) setNotifyAllUsers(false)
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Send to all users</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyAllUsers}
                    onChange={(e) => {
                      setNotifyAllUsers(e.target.checked)
                      if (e.target.checked) setNotifyEnabledOnly(false)
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>

            <div className="bg-white/5 p-3 rounded-lg">
              <p className="text-white/60 text-sm">Recipients</p>
              <p className="text-white font-medium">
                {getRecipientCount()} users will receive this notification via {getNotificationTypeText()}
              </p>
              {getRecipientCount() > 50 && (
                <p className="text-yellow-400 text-xs mt-1">
                  ⚠️ Large batch - you'll be asked to confirm before sending
                </p>
              )}
            </div>

            <button
              onClick={handleSendNotification}
              disabled={!newNotification.trim() || sending || getRecipientCount() === 0 || 
                       ((notificationType === 'email' || notificationType === 'both') && !notificationSubject.trim())}
              className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-white/10 disabled:text-white/40 flex items-center justify-center space-x-2"
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Notification</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Templates & Stats */}
        <div className="glass p-6 rounded-xl">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Settings className="w-6 h-6 mr-2" />
            Templates & Stats
          </h3>
          
          <div className="space-y-4">
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-white/60 text-sm mb-3">Quick Templates</p>
              <div className="space-y-2">
                {templates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => handleTemplateSelect(template)}
                    className="w-full text-left p-3 bg-white/5 rounded text-white/80 text-sm hover:bg-white/10 transition-colors border border-white/10 hover:border-white/20"
                  >
                    <div className="font-medium">{template.name}</div>
                    <div className="text-white/60 text-xs mt-1 truncate">{template.message.substring(0, 60)}...</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-white/60 text-sm mb-3">Current Stats</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-sm flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Total Users
                  </span>
                  <span className="text-white font-medium">{dashboardData?.users?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-sm flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Enabled
                  </span>
                  <span className="text-white font-medium">
                    {dashboardData?.users?.filter(u => u.emailNotifications && u.email).length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-sm flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    SMS Enabled
                  </span>
                  <span className="text-white font-medium">
                    {dashboardData?.users?.filter(u => u.smsNotifications && u.phone).length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-sm flex items-center">
                    <Bell className="w-4 h-4 mr-2" />
                    Total Sent
                  </span>
                  <span className="text-white font-medium">{notificationHistory.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-sm flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Last Activity
                  </span>
                  <span className="text-white font-medium">
                    {notificationHistory.length > 0 ? notificationHistory[0].time : 'Never'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-white/60 text-sm mb-3">Service Status</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-blue-400" />
                    <span className="text-white/80 text-sm">Email Service</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-xs">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-green-400" />
                    <span className="text-white/80 text-sm">SMS Service</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-xs">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Snackbar (same as UserDashboard) */}
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
    </>
  )
}
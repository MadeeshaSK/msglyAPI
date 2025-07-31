// src/components/admin/NotificationsTab.js

'use client'
import { useState, useEffect } from 'react'
import { Bell, Send, Search, Settings } from 'lucide-react'
import { notificationsTabService } from '../../services/admin/NotificationTabService'

export default function NotificationsTab({ dashboardData }) {
  const [newNotification, setNewNotification] = useState('')
  const [notificationSearchTerm, setNotificationSearchTerm] = useState('')
  const [notifyEnabledOnly, setNotifyEnabledOnly] = useState(false)
  const [notifyAllUsers, setNotifyAllUsers] = useState(true)
  const [notificationHistory, setNotificationHistory] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadNotificationHistory()
  }, [])

  const loadNotificationHistory = async () => {
    try {
      setLoading(true)
      const result = await notificationsTabService.getNotificationHistory()
      if (result.success) {
        setNotificationHistory(result.data)
      }
    } catch (error) {
      console.error('Failed to load notification history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendNotification = async () => {
    if (newNotification.trim()) {
      try {
        const result = await notificationsTabService.sendNotification({
          message: newNotification,
          notifyEnabledOnly,
          notifyAllUsers
        })
        
        if (result.success) {
          setNewNotification('')
          await loadNotificationHistory()
          alert('Notification sent!')
        }
      } catch (error) {
        alert(`Failed to send notification: ${error.message}`)
      }
    }
  }

  const filteredNotifications = notificationHistory.filter(n =>
    n.message.toLowerCase().includes(notificationSearchTerm.toLowerCase())
  )

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="glass p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Bell className="w-6 h-6 mr-2" />
          Notification History
        </h3>
        
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
          {filteredNotifications.map((notification) => (
            <div key={notification.id} className="bg-white/5 p-3 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  notification.type === 'warning' ? 'bg-yellow-400' :
                  notification.type === 'info' ? 'bg-blue-400' :
                  notification.type === 'success' ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                <div className="flex-1">
                  <p className="text-white text-sm">{notification.message}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-white/60 text-xs">{notification.time}</p>
                    <p className="text-white/60 text-xs">{notification.users} users</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Send className="w-6 h-6 mr-2" />
          Send Notification
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">Notification Message</label>
            <textarea
              value={newNotification}
              onChange={(e) => setNewNotification(e.target.value)}
              placeholder="Enter your notification message..."
              className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-purple-400 focus:outline-none resize-none"
              rows={4}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">Send to notification-enabled users only</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyEnabledOnly}
                  onChange={(e) => setNotifyEnabledOnly(e.target.checked)}
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
                  onChange={(e) => setNotifyAllUsers(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>

          <div className="bg-white/5 p-3 rounded-lg">
            <p className="text-white/60 text-sm">Recipients</p>
            <p className="text-white font-medium">
              {notifyAllUsers ? `All users (${dashboardData.users.length})` : 
               notifyEnabledOnly ? `Enabled users (${dashboardData.users.filter(u => u.emailNotifications).length})` : 
               'No users selected'}
            </p>
          </div>

          <button
            onClick={handleSendNotification}
            disabled={!newNotification.trim()}
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-white/10 disabled:text-white/40 flex items-center justify-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Send Notification</span>
          </button>
        </div>
      </div>

      <div className="glass p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Settings className="w-6 h-6 mr-2" />
          Notification Settings
        </h3>
        
        <div className="space-y-4">
          <div className="bg-white/5 p-4 rounded-lg">
            <p className="text-white/60 text-sm mb-2">Notification Templates</p>
            <div className="space-y-2">
              {[
                'System Maintenance',
                'New Feature Announcement',
                'Payment Reminder',
                'Account Security Alert'
              ].map((template, index) => (
                <button
                  key={index}
                  onClick={() => setNewNotification(`Template: ${template}`)}
                  className="w-full text-left p-2 bg-white/5 rounded text-white/80 text-sm hover:bg-white/10 transition-colors"
                >
                  {template}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-lg">
            <p className="text-white/60 text-sm mb-2">Quick Stats</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/80 text-sm">Total Users</span>
                <span className="text-white font-medium">{dashboardData.users.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80 text-sm">Notifications Enabled</span>
                <span className="text-white font-medium">{dashboardData.users.filter(u => u.emailNotifications).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80 text-sm">Last Sent</span>
                <span className="text-white font-medium">2 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
// src/services/admin/NotificationTabService.js

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const ADMIN_API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY

const notificationsTabService = {
  async getNotificationHistory() {
    try {
      return {
        success: true,
        data: [
          { id: 1, message: 'Server maintenance scheduled for tonight', type: 'warning', time: '2 hours ago', users: 1247 },
          { id: 2, message: 'New feature: Enhanced SMS delivery', type: 'info', time: '1 day ago', users: 892 },
          { id: 3, message: 'Payment system updated successfully', type: 'success', time: '2 days ago', users: 1247 },
          { id: 4, message: 'High API usage detected', type: 'warning', time: '3 days ago', users: 45 },
          { id: 5, message: 'Welcome to our new users!', type: 'info', time: '1 week ago', users: 1247 }
        ]
      }
    } catch (error) {
      console.error('Get notification history error:', error)
      throw new Error(error.message)
    }
  },

  async sendNotification(notificationData) {
    try {
      const { message, notifyEnabledOnly, notifyAllUsers } = notificationData
      
      console.log('Sending notification:', {
        message,
        notifyEnabledOnly,
        notifyAllUsers
      })
      
      return {
        success: true,
        message: 'Notification sent successfully'
      }
    } catch (error) {
      console.error('Send notification error:', error)
      throw new Error(error.message)
    }
  },

  async getNotificationTemplates() {
    try {
      return {
        success: true,
        data: [
          'System Maintenance',
          'New Feature Announcement',
          'Payment Reminder',
          'Account Security Alert'
        ]
      }
    } catch (error) {
      console.error('Get notification templates error:', error)
      throw new Error(error.message)
    }
  }
}

export { notificationsTabService }
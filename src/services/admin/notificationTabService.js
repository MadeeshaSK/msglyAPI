// src/services/admin/NotificationTabService.js

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const ADMIN_API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY

const notificationsTabService = {
  // Replace the getNotificationHistory function with this:
async getNotificationHistory(userId = null) {
  try {
    const logUserId = userId || 'current'; // Use 'current' for current user or specific userId
    console.log('🔍 Getting notification history for user:', logUserId)
    
    // Always use panel endpoint - pass userId to get specific user's logs
    const endpoint = `${API_BASE_URL}/panel/logs${userId ? `/${userId}` : ''}?limit=100`
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_API_KEY
      }
    })
    
    const data = await response.json()
    console.log('🔍 Logs response:', data)
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch logs')
    }
    
    const logs = data.data || []
    
    // Filter logs to only show notification-related entries
    const notifications = logs
      .filter(log => 
        log.type === 'notification' || 
        log.type === 'email_sent' || 
        log.type === 'sms_sent' ||
        log.action?.includes('notification') ||
        log.action?.includes('email') ||
        log.action?.includes('sms') ||
        log.message?.includes('sent') ||
        log.message?.includes('Email sent') ||
        log.message?.includes('SMS sent')
      )
      .map(log => ({
        id: log.id || log._id || Date.now() + Math.random(),
        message: log.message || log.details || log.description || 'Notification sent',
        type: this.getNotificationType(log),
        time: this.formatTime(new Date(log.timestamp || log.createdAt || log.date)),
        users: log.recipientCount || log.userCount || 1,
        method: log.method || this.getMethodFromLog(log),
        userId: log.userId,
        timestamp: log.timestamp || log.createdAt || log.date,
        status: log.status || 'sent'
      }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    
    console.log('🔍 Filtered notifications:', notifications.length)
    
    return {
      success: true,
      data: notifications
    }
  } catch (error) {
    console.error('❌ Get notification history error:', error)
    return {
      success: true,
      data: [] // Return empty array on error
    }
  }
},

  // Determine notification type from log entry
  getNotificationType(log) {
    if (log.status === 'failed' || log.error) return 'error'
    if (log.type === 'email_sent' || log.action?.includes('email')) return 'info'
    if (log.type === 'sms_sent' || log.action?.includes('sms')) return 'success'
    if (log.type === 'notification') return 'info'
    if (log.level === 'warning') return 'warning'
    if (log.level === 'error') return 'error'
    return 'info'
  },

  // Get method from log entry
  getMethodFromLog(log) {
    if (log.type === 'email_sent' || log.action?.includes('email') || log.message?.includes('email')) return 'Email'
    if (log.type === 'sms_sent' || log.action?.includes('sms') || log.message?.includes('sms')) return 'SMS'
    if (log.method) return log.method
    if (log.type === 'notification') return 'Notification'
    return 'System'
  },

  // Format time for display
  formatTime(date) {
    if (!date || isNaN(new Date(date))) return 'Unknown time'
    
    const now = new Date()
    const logDate = new Date(date)
    const diff = now - logDate
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} min ago`
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`
    return logDate.toLocaleDateString()
  },

  // Send notification to users using existing endpoints
  async sendNotification(notificationData, dashboardData) {
    try {
      const { message, subject, notifyEnabledOnly, notifyAllUsers, notificationType = 'both' } = notificationData
      
      console.log('🔍 Sending notification:', {
        message,
        notifyEnabledOnly,
        notifyAllUsers,
        notificationType,
        subject
      })

      if (!dashboardData?.users?.length) {
        throw new Error('No users found in dashboard data')
      }

      const allUsers = dashboardData.users
      console.log('🔍 Total users found:', allUsers.length)

      // Filter users based on selection criteria
      let targetUsers = []
      
      if (notifyAllUsers) {
        targetUsers = allUsers
      } else if (notifyEnabledOnly) {
        targetUsers = allUsers.filter(user => {
          if (notificationType === 'email') return user.emailNotifications
          if (notificationType === 'sms') return user.smsNotifications  
          return user.emailNotifications || user.smsNotifications
        })
      }

      console.log('🔍 Target users count:', targetUsers.length)

      if (targetUsers.length === 0) {
        throw new Error('No users match the selected criteria')
      }

      // Separate users by notification type and availability
      const emailUsers = targetUsers.filter(user => 
        user.email && 
        (notificationType === 'email' || notificationType === 'both') &&
        (notifyAllUsers || user.emailNotifications)
      )
      
      const smsUsers = targetUsers.filter(user => 
        user.phone && 
        (notificationType === 'sms' || notificationType === 'both') &&
        (notifyAllUsers || user.smsNotifications)
      )

      console.log('🔍 Email recipients:', emailUsers.length)
      console.log('🔍 SMS recipients:', smsUsers.length)

      let emailsSent = 0
      let smsSent = 0
      const errors = []

      // Send email notifications
      if (emailUsers.length > 0) {
        console.log('📧 Sending email notifications...')
        
        for (const user of emailUsers) {
          try {
            await this.sendEmailNotification(user.email, subject || 'Notification', message)
            emailsSent++
            
            // Small delay to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 200))
          } catch (error) {
            console.error(`❌ Failed to send email to ${user.email}:`, error)
            errors.push(`Email to ${user.email}: ${error.message}`)
          }
        }
      }

      // Send SMS notifications
      if (smsUsers.length > 0) {
        console.log('📱 Sending SMS notifications...')
        
        for (const user of smsUsers) {
          try {
            await this.sendSMSNotification(user.phone, message)
            smsSent++
            
            // Small delay to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 200))
          } catch (error) {
            console.error(`❌ Failed to send SMS to ${user.phone}:`, error)
            errors.push(`SMS to ${user.phone}: ${error.message}`)
          }
        }
      }

      const totalSent = emailsSent + smsSent
      let resultMessage = `Notification sent successfully to ${totalSent} users`
      
      if (emailsSent > 0 && smsSent > 0) {
        resultMessage += ` (${emailsSent} emails, ${smsSent} SMS)`
      } else if (emailsSent > 0) {
        resultMessage += ` via email`
      } else if (smsSent > 0) {
        resultMessage += ` via SMS`
      }

      if (errors.length > 0) {
        resultMessage += `, ${errors.length} failed`
      }

      return {
        success: true,
        message: resultMessage,
        details: {
          emailsSent,
          smsSent,
          totalSent,
          totalUsers: targetUsers.length,
          errors
        }
      }
    } catch (error) {
      console.error('❌ Send notification error:', error)
      throw new Error(error.message)
    }
  },

  // Send email using existing email-direct-message endpoint
  async sendEmailNotification(email, subject, message) {
    try {
      console.log('📧 Sending email notification to:', email)
      
      const response = await fetch(`${API_BASE_URL}/api/email-direct-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ADMIN_API_KEY
        },
        body: JSON.stringify({
          email,
          subject,
          message
        })
      })
      
      const data = await response.json()
      console.log('📧 Email response:', data)
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to send email')
      }
      
      return {
        success: true,
        message: data.message || 'Email sent successfully'
      }
    } catch (error) {
      console.error('❌ Send email error:', error)
      throw new Error(error.message)
    }
  },

  // Send SMS using existing direct-message endpoint
  async sendSMSNotification(phone, message) {
    try {
      console.log('📱 Sending SMS notification to:', phone)
      
      const response = await fetch(`${API_BASE_URL}/api/direct-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ADMIN_API_KEY
        },
        body: JSON.stringify({
          phone,
          message
        })
      })
      
      const data = await response.json()
      console.log('📱 SMS response:', data)
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to send SMS')
      }
      
      return {
        success: true,
        message: data.message || 'SMS sent successfully'
      }
    } catch (error) {
      console.error('❌ Send SMS error:', error)
      throw new Error(error.message)
    }
  },

  // Get predefined templates
  getTemplates() {
    return [
      {
        name: 'System Maintenance',
        subject: 'Scheduled System Maintenance',
        message: 'We will be performing scheduled maintenance tonight from 10 PM to 2 AM. Services may be temporarily unavailable during this time. We apologize for any inconvenience.'
      },
      {
        name: 'New Feature',
        subject: 'New Feature Available!',
        message: 'We\'re excited to announce a new feature that will enhance your experience. Log in to your dashboard to check it out and let us know what you think!'
      },
      {
        name: 'Payment Reminder',
        subject: 'Payment Reminder',
        message: 'This is a friendly reminder that your payment is due soon. Please ensure your account is up to date to avoid any service interruptions. Thank you!'
      },
      {
        name: 'Security Alert',
        subject: 'Important Security Notice',
        message: 'We detected unusual activity on your account. Please review your recent activity and contact our support team immediately if you notice anything suspicious.'
      },
      {
        name: 'Welcome Message',
        subject: 'Welcome to Our Platform!',
        message: 'Welcome! We\'re thrilled to have you on board. If you have any questions or need assistance getting started, our support team is here to help.'
      }
    ]
  }
}

export { notificationsTabService }
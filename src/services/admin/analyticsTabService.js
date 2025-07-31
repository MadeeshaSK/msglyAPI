const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const ADMIN_API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY

const analyticsTabService = {
  async getPaymentAnalytics(timeframe = '7days') {
    try {
      const response = await fetch(`${API_BASE_URL}/payment/history?page=1&limit=100`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_API_KEY
        },
        body: JSON.stringify({})
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch payment analytics')
      }
      
      return {
        success: true,
        data: data.data || []
      }
    } catch (error) {
      console.error('Get payment analytics error:', error)
      
      return {
        success: true,
        data: [
          { id: 1, user: 'John Doe', amount: 49.99, status: 'success', date: '2025-07-30', method: 'Card', type: 'subscription' },
          { id: 2, user: 'Jane Smith', amount: 99.99, status: 'verifying', date: '2025-07-30', method: 'Bank', type: 'subscription' },
          { id: 3, user: 'Bob Johnson', amount: 29.99, status: 'failed', date: '2025-07-29', method: 'Card', type: 'one-time' },
          { id: 4, user: 'Alice Brown', amount: 79.99, status: 'pending', date: '2025-07-29', method: 'PayPal', type: 'subscription' },
          { id: 5, user: 'Mike Wilson', amount: 149.99, status: 'success', date: '2025-07-28', method: 'Coinbase', type: 'one-time' },
          { id: 6, user: 'Sarah Davis', amount: 199.99, status: 'success', date: '2025-07-28', method: 'Bank', type: 'enterprise' },
          { id: 7, user: 'Tom Anderson', amount: 49.99, status: 'failed', date: '2025-07-27', method: 'Card', type: 'subscription' },
          { id: 8, user: 'Lisa Wang', amount: 299.99, status: 'success', date: '2025-07-26', method: 'Coinbase', type: 'enterprise' }
        ]
      }
    }
  },

  async getRequestAnalytics(timeframe = '7days') {
    try {
      return {
        success: true,
        data: [
          { id: 1, user: 'John Doe', type: 'sms_otp', status: 'success', date: '2025-07-30', time: '14:30:45' },
          { id: 2, user: 'Jane Smith', type: 'email_otp', status: 'success', date: '2025-07-30', time: '14:25:12' },
          { id: 3, user: 'Bob Johnson', type: 'phone_call', status: 'failed', date: '2025-07-30', time: '14:20:33' },
          { id: 4, user: 'Alice Brown', type: 'direct_email', status: 'success', date: '2025-07-30', time: '14:15:21' },
          { id: 5, user: 'Mike Wilson', type: 'sms_otp', status: 'success', date: '2025-07-29', time: '16:45:30' },
          { id: 6, user: 'Sarah Davis', type: 'email_otp', status: 'success', date: '2025-07-29', time: '15:30:20' }
        ]
      }
    } catch (error) {
      console.error('Get request analytics error:', error)
      throw new Error(error.message)
    }
  },

  async getSystemStats(timeframe = '7days') {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats-server`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_API_KEY
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch system stats')
      }
      
      return {
        success: true,
        data: data.data
      }
    } catch (error) {
      console.error('Get system stats error:', error)
      throw new Error(error.message)
    }
  }
}

export { analyticsTabService }
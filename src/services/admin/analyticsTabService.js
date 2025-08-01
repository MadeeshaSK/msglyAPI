// src/services/admin/analyticsTabService.js

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const ADMIN_API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY

const analyticsTabService = {
  async getPaymentAnalytics(timeframe = '7days') {
    try {
      // Calculate date range based on timeframe
      const endDate = new Date()
      const startDate = new Date()
      
      switch(timeframe) {
        case '7days':
          startDate.setDate(endDate.getDate() - 7)
          break
        case '30days':
          startDate.setDate(endDate.getDate() - 30)
          break
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
        default:
          startDate.setDate(endDate.getDate() - 7)
      }

      // Use the same endpoint as HomeTab but with date filtering
      const queryParams = new URLSearchParams({
        page: '1',
        limit: '1000', // Get all payments for analytics
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      })

      const response = await fetch(`${API_BASE_URL}/panel/payments?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_API_KEY
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        console.error('Payment analytics API error:', data.error)
        // Return empty array if API fails, don't throw error
        return {
          success: true,
          data: []
        }
      }
      
      return {
        success: true,
        data: data.data || []
      }
    } catch (error) {
      console.error('Get payment analytics error:', error)
      // Return empty array instead of throwing error to prevent UI crashes
      return {
        success: true,
        data: []
      }
    }
  },

  async getRequestAnalytics(timeframe = '7days') {
    try {
      // Calculate date range based on timeframe
      const endDate = new Date()
      const startDate = new Date()
      
      switch(timeframe) {
        case '7days':
          startDate.setDate(endDate.getDate() - 7)
          break
        case '30days':
          startDate.setDate(endDate.getDate() - 30)
          break
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
        default:
          startDate.setDate(endDate.getDate() - 7)
      }

      // Use the same endpoint as HomeTab but with date filtering
      const queryParams = new URLSearchParams({
        page: '1',
        limit: '1000', // Get all logs for analytics
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      })

      const response = await fetch(`${API_BASE_URL}/panel/logs?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_API_KEY
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        console.error('Request analytics API error:', data.error)
        // Return empty array if API fails
        return {
          success: true,
          data: []
        }
      }
      
      return {
        success: true,
        data: data.data || []
      }
    } catch (error) {
      console.error('Get request analytics error:', error)
      // Return empty array instead of throwing error
      return {
        success: true,
        data: []
      }
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
        console.error('System stats API error:', data.error)
        return {
          success: true,
          data: {}
        }
      }
      
      return {
        success: true,
        data: data.data || {}
      }
    } catch (error) {
      console.error('Get system stats error:', error)
      return {
        success: true,
        data: {}
      }
    }
  },

  // Additional analytics methods
  async getUserStats(timeframe = '7days') {
    try {
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      
      switch(timeframe) {
        case '7days':
          startDate.setDate(endDate.getDate() - 7)
          break
        case '30days':
          startDate.setDate(endDate.getDate() - 30)
          break
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
        default:
          startDate.setDate(endDate.getDate() - 7)
      }

      const queryParams = new URLSearchParams({
        page: '1',
        limit: '1000',
        status: 'all'
      })

      const response = await fetch(`${API_BASE_URL}/panel/users?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_API_KEY
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        console.error('User stats API error:', data.error)
        return {
          success: true,
          data: []
        }
      }
      
      // Filter users by creation date if available
      let users = data.data || []
      if (users.length > 0 && users[0].createdAt) {
        users = users.filter(user => {
          const userDate = new Date(user.createdAt)
          return userDate >= startDate && userDate <= endDate
        })
      }
      
      return {
        success: true,
        data: users
      }
    } catch (error) {
      console.error('Get user stats error:', error)
      return {
        success: true,
        data: []
      }
    }
  },

  // Get detailed analytics for a specific timeframe
  async getDetailedAnalytics(timeframe = '7days') {
    try {
      const [payments, requests, users, systemStats] = await Promise.all([
        this.getPaymentAnalytics(timeframe),
        this.getRequestAnalytics(timeframe),
        this.getUserStats(timeframe),
        this.getSystemStats(timeframe)
      ])

      return {
        success: true,
        data: {
          payments: payments.data,
          requests: requests.data,
          users: users.data,
          system: systemStats.data,
          timeframe: timeframe,
          generatedAt: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('Get detailed analytics error:', error)
      return {
        success: false,
        data: null,
        error: error.message
      }
    }
  },

  // Analytics helper methods
  calculatePaymentTrends(payments, previousPayments = []) {
    const currentTotal = payments.reduce((sum, p) => sum + (parseFloat(p.priceUSD || p.amount || 0)), 0)
    const previousTotal = previousPayments.reduce((sum, p) => sum + (parseFloat(p.priceUSD || p.amount || 0)), 0)
    
    const trend = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0
    
    return {
      current: currentTotal,
      previous: previousTotal,
      trend: trend,
      isPositive: trend >= 0
    }
  },

  calculateUserGrowth(users, timeframe) {
    // Group users by date
    const usersByDate = {}
    users.forEach(user => {
      if (user.createdAt) {
        const date = new Date(user.createdAt).toDateString()
        usersByDate[date] = (usersByDate[date] || 0) + 1
      }
    })

    const dates = Object.keys(usersByDate).sort()
    const growth = dates.map(date => ({
      date,
      count: usersByDate[date],
      cumulative: dates.slice(0, dates.indexOf(date) + 1)
        .reduce((sum, d) => sum + usersByDate[d], 0)
    }))

    return {
      daily: usersByDate,
      growth: growth,
      total: users.length
    }
  },

  // Get conversion rates
  getConversionRates(payments, users) {
    const totalUsers = users.length
    const payingUsers = new Set(payments.filter(p => p.status === 'success').map(p => p.userId || p.user)).size
    
    return {
      paymentConversion: totalUsers > 0 ? (payingUsers / totalUsers) * 100 : 0,
      payingUsers: payingUsers,
      totalUsers: totalUsers
    }
  }
}

export { analyticsTabService }
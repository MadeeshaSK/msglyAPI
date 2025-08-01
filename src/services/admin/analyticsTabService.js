// src/services/admin/analyticsTabService.js

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const ADMIN_API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY

const analyticsTabService = {
  async getPaymentAnalytics(timeframe = '7days') {
    try {
      // Enhanced date range calculation
      const { startDate, endDate } = this.calculateDateRange(timeframe)
  
      let queryParams
      if (timeframe === 'alltime') {
        // For all time, don't include date filters
        queryParams = new URLSearchParams({
          page: '1',
          limit: '10000' // Increased limit for all time
        })
      } else {
        queryParams = new URLSearchParams({
          page: '1',
          limit: '10000',
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        })
      }
  
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
        return {
          success: true,
          data: []
        }
      }
      
      // Client-side filtering for precise time ranges (especially for hour/24hour filters)
      let filteredData = data.data || []
      if (timeframe !== 'alltime' && filteredData.length > 0) {
        filteredData = filteredData.filter(payment => {
          if (!payment.createdAt && !payment.created_at && !payment.date) return true
          
          const paymentDate = new Date(payment.createdAt || payment.created_at || payment.date)
          return paymentDate >= startDate && paymentDate <= endDate
        })
      }
      
      return {
        success: true,
        data: filteredData
      }
    } catch (error) {
      console.error('Get payment analytics error:', error)
      return {
        success: true,
        data: []
      }
    }
  },
  

  async getRequestAnalytics(timeframe = '7days') {
    try {
      const { startDate, endDate } = this.calculateDateRange(timeframe)
  
      let queryParams
      if (timeframe === 'alltime') {
        queryParams = new URLSearchParams({
          page: '1',
          limit: '10000'
        })
      } else {
        queryParams = new URLSearchParams({
          page: '1',
          limit: '10000',
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        })
      }
  
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
        return {
          success: true,
          data: []
        }
      }
      
      // Client-side filtering for precise time ranges
      let filteredData = data.data || []
      if (timeframe !== 'alltime' && filteredData.length > 0) {
        filteredData = filteredData.filter(request => {
          if (!request.createdAt && !request.created_at && !request.timestamp && !request.date) return true
          
          const requestDate = new Date(request.createdAt || request.created_at || request.timestamp || request.date)
          return requestDate >= startDate && requestDate <= endDate
        })
      }
      
      return {
        success: true,
        data: filteredData
      }
    } catch (error) {
      console.error('Get request analytics error:', error)
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
      const { startDate, endDate } = this.calculateDateRange(timeframe)
  
      // Add date parameters to query params (same as payments and logs)
      let queryParams
      if (timeframe === 'alltime') {
        queryParams = new URLSearchParams({
          page: '1',
          limit: '10000',
          status: 'all'
        })
      } else {
        queryParams = new URLSearchParams({
          page: '1',
          limit: '10000',
          status: 'all',
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        })
      }
  
      console.log('Fetching users with params:', queryParams.toString())
  
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
      
      console.log('Users fetched from API:', data.data?.length || 0, 'for timeframe:', timeframe)
      
      return {
        success: true,
        data: data.data || []
      }
    } catch (error) {
      console.error('Get user stats error:', error)
      return {
        success: true,
        data: []
      }
    }
  },
  
  calculateDateRange(timeframe) {
    const endDate = new Date()
    const startDate = new Date()
    
    // Handle custom date ranges
    if (timeframe.startsWith('custom_')) {
      const [, startDateStr, endDateStr] = timeframe.split('_')
      return {
        startDate: new Date(startDateStr + 'T00:00:00'),
        endDate: new Date(endDateStr + 'T23:59:59')
      }
    }
    
    switch(timeframe) {
      case '1hour':
        startDate.setHours(endDate.getHours() - 1)
        break
      case '24hours':
        startDate.setHours(endDate.getHours() - 24)
        break
      case '7days':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30days':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '365days':
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
      case 'alltime':
        // For all time, set start date to a very early date
        startDate.setFullYear(2020, 0, 1)
        break
      default:
        startDate.setDate(endDate.getDate() - 7)
    }
    
    return { startDate, endDate }
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
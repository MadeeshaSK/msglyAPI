// src/services/adminDashboardService.js

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const ADMIN_API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY

const adminDashboardService = {
  async getDashboardData() {
    try {
      const [statsResponse, usersResponse, healthResponse, otpStatusResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/stats-server`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-key': ADMIN_API_KEY
          }
        }),
        fetch(`${API_BASE_URL}/admin/users?page=1&limit=100`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-key': ADMIN_API_KEY
          }
        }),
        fetch(`${API_BASE_URL}/admin/health-server`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-key': ADMIN_API_KEY
          }
        }),
        // Add OTP status check to dashboard data fetch
        fetch(`${API_BASE_URL}/admin/otp-server/status`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-key': ADMIN_API_KEY
          }
        })
      ])

      const [statsData, usersData, healthData, otpStatusData] = await Promise.all([
        statsResponse.json(),
        usersResponse.json(),
        healthResponse.json(),
        otpStatusResponse.json()
      ])

      // Get OTP server status
      const otpServerEnabled = otpStatusData.success ? otpStatusData.data.enabled : false

      // Enhanced server status logic
      let serverStatus = 'offline'
      let serverMessage = 'Server Offline'
      
      if (healthData.success && healthData.data && healthData.data.working) {
        if (otpServerEnabled) {
          serverStatus = 'online'
          serverMessage = 'Server Online'
        } else {
          serverStatus = 'maintenance'
          serverMessage = 'Server Offline'
        }
      }

      return {
        success: true,
        data: {
          stats: statsData.data,
          users: usersData.data || [],
          usersPagination: usersData.pagination,
          health: {
            ...healthData.data,
            otpServerEnabled: otpServerEnabled
          },
          serverStatus: serverStatus,
          serverMessage: serverMessage,
          otpStatus: otpStatusData.success ? otpStatusData.data : { enabled: false, error: 'Failed to check status' }
        }
      }
    } catch (error) {
      console.error('Get admin dashboard data error:', error)
      // If any request fails, server is considered offline
      return {
        success: true,
        data: {
          stats: {},
          users: [],
          usersPagination: {},
          health: null,
          serverStatus: 'offline',
          serverMessage: 'Server Offline',
          otpStatus: { enabled: false, error: 'Connection failed' }
        }
      }
    }
  },

  async refreshData() {
    return this.getDashboardData()
  },

  async getAdminProfile(apiKey) {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch admin profile')
      }

      return {
        success: true,
        data: data.data
      }
    } catch (error) {
      console.error('Get admin profile error:', error)
      // Don't throw error, just return empty result
      return {
        success: false,
        data: null
      }
    }
  },

  // Toggle OTP server on or off
  async toggleOtpServer(enable) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/otp-server/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_API_KEY
        },
        body: JSON.stringify({
          enabled: enable
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${enable ? 'enable' : 'disable'} OTP server`)
      }

      return {
        success: true,
        data: data.data,
        message: data.message || `OTP server ${enable ? 'enabled' : 'disabled'} successfully`
      }
    } catch (error) {
      console.error('Toggle OTP server error:', error)
      throw new Error(error.message)
    }
  },

  // Get current OTP server status
  async getOtpServerStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/otp-server/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_API_KEY
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch OTP server status')
      }

      return {
        success: true,
        data: data.data
      }
    } catch (error) {
      console.error('Get OTP server status error:', error)
      return {
        success: false,
        data: { enabled: false, error: error.message }
      }
    }
  },

  // Quick status check for auto-refresh
  async quickStatusCheck() {
    try {
      const [healthResponse, otpStatusResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/health-server`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-key': ADMIN_API_KEY
          }
        }),
        fetch(`${API_BASE_URL}/admin/otp-server/status`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-key': ADMIN_API_KEY
          }
        })
      ])

      const [healthData, otpStatusData] = await Promise.all([
        healthResponse.json(),
        otpStatusResponse.json()
      ])

      const otpServerEnabled = otpStatusData.success ? otpStatusData.data.enabled : false

      let serverStatus = 'offline'
      let serverMessage = 'Server Offline'
      
      if (healthData.success && healthData.data && healthData.data.working) {
        if (otpServerEnabled) {
          serverStatus = 'online'
          serverMessage = 'Server Online'
        } else {
          serverStatus = 'maintenance'
          serverMessage = 'Server Offline'
        }
      }

      return {
        success: true,
        serverStatus,
        serverMessage,
        otpServerEnabled,
        health: healthData.data
      }
    } catch (error) {
      console.error('Quick status check error:', error)
      return {
        success: false,
        serverStatus: 'offline',
        serverMessage: 'Server Offline',
        otpServerEnabled: false,
        health: null
      }
    }
  }
}

export { adminDashboardService }
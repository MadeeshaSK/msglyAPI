// src/services/adminDashboardService.js

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const ADMIN_API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY

const adminDashboardService = {
  async getDashboardData() {
    try {
      const [statsResponse, usersResponse, healthResponse] = await Promise.all([
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
        })
      ])

      const [statsData, usersData, healthData] = await Promise.all([
        statsResponse.json(),
        usersResponse.json(),
        healthResponse.json()
      ])

      return {
        success: true,
        data: {
          stats: statsData.data,
          users: usersData.data || [],
          usersPagination: usersData.pagination,
          health: healthData.data,
          serverStatus: healthData.success ? 'online' : 'offline'
        }
      }
    } catch (error) {
      console.error('Get admin dashboard data error:', error)
      throw new Error(error.message)
    }
  },

  async refreshData() {
    return this.getDashboardData()
  }
}

export { adminDashboardService }
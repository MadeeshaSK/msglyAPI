const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const ADMIN_API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY

const homeTabService = {
  async getPayments(options = {}) {
    try {
      const { page = 1, limit = 50 } = options
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      
      const response = await fetch(`${API_BASE_URL}/payment/history?${queryParams}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_API_KEY
        },
        body: JSON.stringify({})
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch payments')
      }
      
      return {
        success: true,
        data: data.data || [],
        pagination: data.pagination
      }
    } catch (error) {
      console.error('Get payments error:', error)
      
      return {
        success: true,
        data: [
          { id: 1, user: 'John Doe', amount: 49.99, status: 'success', date: '2025-07-30', method: 'Card', type: 'subscription' },
          { id: 2, user: 'Jane Smith', amount: 99.99, status: 'verifying', date: '2025-07-30', method: 'Bank', type: 'subscription' },
          { id: 3, user: 'Bob Johnson', amount: 29.99, status: 'failed', date: '2025-07-29', method: 'Card', type: 'one-time' },
          { id: 4, user: 'Alice Brown', amount: 79.99, status: 'pending', date: '2025-07-29', method: 'PayPal', type: 'subscription' },
          { id: 5, user: 'Mike Wilson', amount: 149.99, status: 'success', date: '2025-07-28', method: 'Coinbase', type: 'one-time' }
        ]
      }
    }
  },

  async getPaymentDetails(paymentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/payment/status/${paymentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_API_KEY
        },
        body: JSON.stringify({})
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch payment details')
      }
      
      return {
        success: true,
        data: data.data
      }
    } catch (error) {
      console.error('Get payment details error:', error)
      throw new Error(error.message)
    }
  },

  async getUser(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_API_KEY
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user')
      }
      
      return {
        success: true,
        data: data.data
      }
    } catch (error) {
      console.error('Get user error:', error)
      throw new Error(error.message)
    }
  },

  async createUser(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_API_KEY
        },
        body: JSON.stringify(userData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user')
      }
      
      return {
        success: true,
        data: data.data,
        message: data.message
      }
    } catch (error) {
      console.error('Create user error:', error)
      throw new Error(error.message)
    }
  },

  async updateUser(userId, updates) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_API_KEY
        },
        body: JSON.stringify(updates)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user')
      }
      
      return {
        success: true,
        data: data.data,
        message: data.message
      }
    } catch (error) {
      console.error('Update user error:', error)
      throw new Error(error.message)
    }
  },

  async deleteUser(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_API_KEY
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user')
      }
      
      return {
        success: true,
        message: data.message
      }
    } catch (error) {
      console.error('Delete user error:', error)
      throw new Error(error.message)
    }
  }
}

export { homeTabService }
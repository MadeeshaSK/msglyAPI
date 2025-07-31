// src/services/admin/homeTabService.js

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const ADMIN_API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY

const homeTabService = {
  // User Management
  async getAllUsers(options = {}) {
    try {
      const { page = 1, limit = 50, status = 'all' } = options
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status
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
        throw new Error(data.error || 'Failed to fetch users')
      }
      
      return {
        success: true,
        data: data.data || [],
        pagination: data.pagination
      }
    } catch (error) {
      console.error('Get all users error:', error)
      throw new Error(error.message)
    }
  },

  async searchUserByPhone(phone) {
    try {
      const response = await fetch(`${API_BASE_URL}/panel/users/phone/${encodeURIComponent(phone)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_API_KEY
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        if (response.status === 404) {
          return { success: true, data: null }
        }
        throw new Error(data.error || 'Failed to search user by phone')
      }
      
      return {
        success: true,
        data: data.data
      }
    } catch (error) {
      console.error('Search user by phone error:', error)
      throw new Error(error.message)
    }
  },

  async searchUserByEmail(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/panel/users/email/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_API_KEY
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        if (response.status === 404) {
          return { success: true, data: null }
        }
        throw new Error(data.error || 'Failed to search user by email')
      }
      
      return {
        success: true,
        data: data.data
      }
    } catch (error) {
      console.error('Search user by email error:', error)
      throw new Error(error.message)
    }
  },

  async searchUserByApiKey(apikey) {
    try {
      const response = await fetch(`${API_BASE_URL}/panel/users/apikey/${encodeURIComponent(apikey)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_API_KEY
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        if (response.status === 404) {
          return { success: true, data: null }
        }
        throw new Error(data.error || 'Failed to search user by API key')
      }
      
      return {
        success: true,
        data: data.data
      }
    } catch (error) {
      console.error('Search user by API key error:', error)
      throw new Error(error.message)
    }
  },

  async getUser(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/panel/users/${userId}`, {
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

  async updateUser(userId, updates) {
    try {
      const response = await fetch(`${API_BASE_URL}/panel/users/${userId}`, {
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
      const response = await fetch(`${API_BASE_URL}/panel/users/${userId}`, {
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
  },

  // Payment Management
  async getAllPayments(options = {}) {
    try {
      const { page = 1, limit = 50, status, method } = options
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      
      if (status && status !== 'all') queryParams.append('status', status)
      if (method && method !== 'all') queryParams.append('method', method)
      
      const response = await fetch(`${API_BASE_URL}/panel/payments?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_API_KEY
        }
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
      console.error('Get all payments error:', error)
      throw new Error(error.message)
    }
  },

  async getUserPayments(userId, options = {}) {
    try {
      const { page = 1, limit = 50, status, method } = options
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      
      if (status && status !== 'all') queryParams.append('status', status)
      if (method && method !== 'all') queryParams.append('method', method)
      
      const response = await fetch(`${API_BASE_URL}/panel/payments/${userId}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_API_KEY
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user payments')
      }
      
      return {
        success: true,
        data: data.data || [],
        pagination: data.pagination
      }
    } catch (error) {
      console.error('Get user payments error:', error)
      throw new Error(error.message)
    }
  },

  async changeBankTransferStatus(payment, statusData) {
    try {
      // Try different possible ID fields from the payment object
      const possibleIds = [
        payment.id,
        payment.orderId, 
        payment.order_id,
        payment.paymentId,
        payment.payment_id,
        payment.transactionId,
        payment.transaction_id
      ].filter(Boolean) // Remove null/undefined values
      
      console.log('=== PAYMENT STATUS UPDATE DEBUG ===')
      console.log('Payment object:', JSON.stringify(payment, null, 2))
      console.log('Possible IDs to try:', possibleIds)
      console.log('Status data:', JSON.stringify(statusData, null, 2))
      
      if (possibleIds.length === 0) {
        throw new Error('No valid payment ID found in payment object')
      }
      
      // Get the correct amount - prioritize LKR over USD
      const paymentAmount = payment.priceLKR || 
                           payment.priceLkr || 
                           payment.price_lkr || 
                           payment.amountLKR || 
                           payment.amountLkr ||
                           payment.amount ||
                           (payment.priceUsd || payment.priceUSD || payment.price_usd || 0) * 300 // Convert USD to LKR if needed
      
      console.log('Using payment amount (LKR):', paymentAmount)
      
      // Prepare request data based on status
      const requestData = {
        status: statusData.status,
        transactionReference: statusData.transactionReference || `TRX_${Date.now()}`,
        verifiedAmount: parseFloat(paymentAmount)
      }
      
      // Add rejection reason for failed status
      if (statusData.status === 'failed') {
        requestData.rejectionReason = statusData.reason || 'Payment rejected by admin'
      }
      
      console.log('Final request data:', JSON.stringify(requestData, null, 2))
      
      // Try each possible ID until one works
      for (const orderId of possibleIds) {
        try {
          const url = `${API_BASE_URL}/panel/payments/bank-transfer/${orderId}/status`
          console.log(`\nTrying URL: ${url}`)
          console.log(`Method: PUT`)
          console.log(`Headers:`, {
            'Content-Type': 'application/json',
            'x-admin-key': ADMIN_API_KEY ? 'Present' : 'Missing'
          })
          console.log(`Body:`, JSON.stringify(requestData, null, 2))
          
          const response = await fetch(url, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'x-admin-key': ADMIN_API_KEY
            },
            body: JSON.stringify(requestData)
          })
          
          console.log(`Response status: ${response.status}`)
          
          const responseText = await response.text()
          console.log(`Response body (raw):`, responseText)
          
          let data
          try {
            data = JSON.parse(responseText)
            console.log(`Response body (parsed):`, JSON.stringify(data, null, 2))
          } catch (parseError) {
            console.log(`Failed to parse response as JSON:`, parseError.message)
            data = { error: responseText || 'Empty response' }
          }
          
          if (response.ok) {
            console.log(`✅ Success for ID ${orderId}`)
            return {
              success: true,
              data: data.data,
              message: data.message || `Payment ${statusData.status === 'success' ? 'accepted' : 'rejected'} successfully`
            }
          }
          
          // If it's a 404, continue to try next ID
          if (response.status === 404) {
            console.log(`❌ ID ${orderId} not found (404), trying next...`)
            continue
          }
          
          // If it's not a 404, throw the error with full details
          const errorMessage = data.error || data.message || `HTTP ${response.status}: ${responseText}`
          console.log(`❌ Error for ID ${orderId}:`, errorMessage)
          throw new Error(errorMessage)
          
        } catch (fetchError) {
          console.error(`❌ Fetch error for ID ${orderId}:`, fetchError.message)
          console.error('Full error:', fetchError)
          
          // If it's the last ID, throw the error
          if (orderId === possibleIds[possibleIds.length - 1]) {
            throw fetchError
          }
          // Otherwise continue to next ID
        }
      }
      
      throw new Error('Payment order not found with any of the available IDs')
      
    } catch (error) {
      console.error('=== FINAL ERROR ===')
      console.error('Change bank transfer status error:', error)
      throw new Error(error.message)
    }
  },

  // Logs Management
  async getAllLogs(options = {}) {
    try {
      const { page = 1, limit = 50, type, status } = options
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      
      if (type && type !== 'all') queryParams.append('type', type)
      if (status && status !== 'all') queryParams.append('status', status)
      
      const response = await fetch(`${API_BASE_URL}/panel/logs?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_API_KEY
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch logs')
      }
      
      return {
        success: true,
        data: data.data || [],
        pagination: data.pagination
      }
    } catch (error) {
      console.error('Get all logs error:', error)
      throw new Error(error.message)
    }
  },

  async getUserLogs(userId, options = {}) {
    try {
      const { page = 1, limit = 50, type, status } = options
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      
      if (type && type !== 'all') queryParams.append('type', type)
      if (status && status !== 'all') queryParams.append('status', status)
      
      const response = await fetch(`${API_BASE_URL}/panel/logs/${userId}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_API_KEY
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user logs')
      }
      
      return {
        success: true,
        data: data.data || [],
        pagination: data.pagination
      }
    } catch (error) {
      console.error('Get user logs error:', error)
      throw new Error(error.message)
    }
  },

  // Server Health
  async getTermuxServerHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/panel/termux/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_API_KEY
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch server health')
      }
      
      return {
        success: true,
        data: data.data
      }
    } catch (error) {
      console.error('Get server health error:', error)
      throw new Error(error.message)
    }
  },

  // Helper function for smart search - FIXED VERSION
  async searchUsers(searchTerm) {
    if (!searchTerm.trim()) {
      return await this.getAllUsers()
    }

    const trimmedTerm = searchTerm.trim()

    // Check if it's an email
    if (trimmedTerm.includes('@')) {
      try {
        console.log('Searching by email:', trimmedTerm)
        const result = await this.searchUserByEmail(trimmedTerm)
        if (result.success && result.data) {
          return {
            success: true,
            data: [result.data],
            pagination: { page: 1, limit: 1, total: 1, pages: 1 }
          }
        } else {
          // No user found with this email
          return {
            success: true,
            data: [],
            pagination: { page: 1, limit: 1, total: 0, pages: 0 }
          }
        }
      } catch (error) {
        console.error('Email search failed:', error)
        // Return empty result if email search fails
        return {
          success: true,
          data: [],
          pagination: { page: 1, limit: 1, total: 0, pages: 0 }
        }
      }
    }

    // Check if it's a phone number - improved detection for numbers starting with +
    const phoneRegex = /^[\+]?[\d\s\-\(\)\.]+$/
    const digitsOnly = trimmedTerm.replace(/[\s\-\(\)\.+]/g, '')
    const hasPhoneFormat = phoneRegex.test(trimmedTerm) && 
                          digitsOnly.length >= 7 && // Must have at least 7 digits
                          (trimmedTerm.startsWith('+') ? digitsOnly.length >= 7 : digitsOnly.length >= 7)
    
    if (hasPhoneFormat) {
      try {
        console.log('Searching by phone:', trimmedTerm)
        const result = await this.searchUserByPhone(trimmedTerm)
        console.log('Phone search result:', result)
        if (result.success && result.data) {
          return {
            success: true,
            data: [result.data],
            pagination: { page: 1, limit: 1, total: 1, pages: 1 }
          }
        } else {
          // No user found with this phone, try variations
          console.log('Trying phone search with variations')
          
          // Try without formatting
          const cleanPhone = trimmedTerm.replace(/[\s\-\(\)\.]/g, '')
          if (cleanPhone !== trimmedTerm) {
            try {
              const cleanResult = await this.searchUserByPhone(cleanPhone)
              if (cleanResult.success && cleanResult.data) {
                return {
                  success: true,
                  data: [cleanResult.data],
                  pagination: { page: 1, limit: 1, total: 1, pages: 1 }
                }
              }
            } catch (cleanError) {
              console.error('Clean phone search failed:', cleanError)
            }
          }
          
          // Try with + if not present
          if (!trimmedTerm.startsWith('+') && trimmedTerm.match(/^\d/)) {
            try {
              const plusResult = await this.searchUserByPhone('+' + trimmedTerm)
              if (plusResult.success && plusResult.data) {
                return {
                  success: true,
                  data: [plusResult.data],
                  pagination: { page: 1, limit: 1, total: 1, pages: 1 }
                }
              }
            } catch (plusError) {
              console.error('Plus phone search failed:', plusError)
            }
          }
          
          // No user found with any phone variation
          return {
            success: true,
            data: [],
            pagination: { page: 1, limit: 1, total: 0, pages: 0 }
          }
        }
      } catch (error) {
        console.error('Phone search failed:', error)
        // Return empty result if phone search fails
        return {
          success: true,
          data: [],
          pagination: { page: 1, limit: 1, total: 0, pages: 0 }
        }
      }
    }

    // Check if it might be an API key (long alphanumeric string, typically 20+ characters)
    if (trimmedTerm.length >= 20 && /^[a-zA-Z0-9_-]+$/.test(trimmedTerm)) {
      try {
        console.log('Searching by API key:', trimmedTerm)
        const result = await this.searchUserByApiKey(trimmedTerm)
        if (result.success && result.data) {
          return {
            success: true,
            data: [result.data],
            pagination: { page: 1, limit: 1, total: 1, pages: 1 }
          }
        } else {
          // No user found with this API key, continue to name/ID search
          console.log('No user found by API key, trying name/ID search')
        }
      } catch (error) {
        console.error('API key search failed:', error)
        // Continue to name/ID search if API key search fails
      }
    }

    // Search by name or ID - get all users and filter on frontend
    try {
      console.log('Searching by name/ID:', trimmedTerm)
      const result = await this.getAllUsers({ limit: 1000 }) // Get more users for searching
      
      if (!result.success || !result.data) {
        return {
          success: true,
          data: [],
          pagination: { page: 1, limit: 1, total: 0, pages: 0 }
        }
      }

      const filteredUsers = result.data.filter(user => {
        const matchesName = user.name && user.name.toLowerCase().includes(trimmedTerm.toLowerCase())
        const matchesId = user.id && user.id.toLowerCase().includes(trimmedTerm.toLowerCase())
        const matchesEmail = user.email && user.email.toLowerCase().includes(trimmedTerm.toLowerCase())
        const matchesPhone = user.phone && (
          user.phone.includes(trimmedTerm) || 
          user.phone.replace(/[\s\-\(\)\.]/g, '').includes(trimmedTerm.replace(/[\s\-\(\)\.]/g, ''))
        )
        const matchesApiKey = (user.apikey || user.apiKey) && (user.apikey || user.apiKey).includes(trimmedTerm)
        
        return matchesName || matchesId || matchesEmail || matchesPhone || matchesApiKey
      })
      
      return {
        success: true,
        data: filteredUsers,
        pagination: { 
          page: 1, 
          limit: filteredUsers.length, 
          total: filteredUsers.length, 
          pages: filteredUsers.length > 0 ? 1 : 0 
        }
      }
    } catch (error) {
      console.error('Name/ID search failed:', error)
      return {
        success: true,
        data: [],
        pagination: { page: 1, limit: 1, total: 0, pages: 0 }
      }
    }
  }
}

export { homeTabService }
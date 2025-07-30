// src/services/paymentService.js

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

const USD_TO_LKR_RATE = 300 

// Pricing plans configuration
export const PRICING_PLANS = [
  {
    id: 'starter',
    name: 'Starter Pack',
    quota: 100,
    priceUSD: 2,
    priceLKR: Math.round(2 * USD_TO_LKR_RATE),
    popular: false,
    features: ['100 SMS/Email Credits', 'OTP Support', 'Email Support'],
    color: 'blue'
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    quota: 500,
    priceUSD: 8,
    priceLKR: Math.round(8 * USD_TO_LKR_RATE),
    popular: true,
    features: ['500 SMS/Email Credits', 'Priority OTP', 'Email & Chat Support'],
    color: 'purple'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Pack',
    quota: 1000,
    priceUSD: 15,
    priceLKR: Math.round(15 * USD_TO_LKR_RATE),
    popular: false,
    features: ['1000 SMS/Email Credits', 'Premium Support', 'API Priority'],
    color: 'yellow'
  }
]

// Calculate custom quota pricing (1 credit = $0.01)
export const calculateCustomPrice = (quota) => {
  if (quota <= 1000) {
    throw new Error('Use predefined plans for quota under 1000')
  }
  
  const priceUSD = quota * 0.01
  const priceLKR = Math.round(priceUSD * USD_TO_LKR_RATE)
  
  return { priceUSD, priceLKR }
}

// Create Payment Order
export const createPaymentOrder = async (apiKey, orderData) => {
    try {
      console.log('🔍 Creating payment order...', orderData)
      
      // Get userId from apiKey
      const userId = await getUserIdFromApiKey(apiKey);
      
      const response = await fetch(`${API_BASE_URL}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY
        },
        body: JSON.stringify({
          ...orderData,
          userId: userId
        })
      })
      
      const data = await response.json()
      console.log('🔍 Payment order response:', data)
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment order')
      }
      
      return {
        success: true,
        data: data.data
      }
    } catch (error) {
      console.error('❌ Create payment order error:', error)
      throw new Error(error.message)
    }
  }

// Process Coinbase Payment
export const processCoinbasePayment = async (apiKey, paymentData) => {
    try {
      console.log('🔍 Processing Coinbase payment...', paymentData)
      
      // Get userId from apiKey
      const userId = await getUserIdFromApiKey(apiKey);
      
      const response = await fetch(`${API_BASE_URL}/payment/coinbase/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY
        },
        body: JSON.stringify({
          ...paymentData, // Fixed: was orderData, should be paymentData
          userId: userId
        })
      })
      
      const data = await response.json()
      console.log('🔍 Coinbase payment response:', data)
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process Coinbase payment')
      }
      
      return {
        success: true,
        data: data.data
      }
    } catch (error) {
      console.error('❌ Process Coinbase payment error:', error)
      throw new Error(error.message)
    }
  }

  export const createCoinbasePayment = async (apiKey, orderData) => {
    try {
      console.log('🔍 Creating Coinbase payment...', orderData)
      
      // Get userId from apiKey
      const userId = await getUserIdFromApiKey(apiKey);
      
      const response = await fetch(`${API_BASE_URL}/payment/coinbase/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY
        },
        body: JSON.stringify({
          ...orderData,
          userId: userId
        })
      })
      
      const data = await response.json()
      console.log('🔍 Coinbase payment response:', data)
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create Coinbase payment')
      }
      
      return {
        success: true,
        data: data.data
      }
    } catch (error) {
      console.error('❌ Create Coinbase payment error:', error)
      throw new Error(error.message)
    }
  }

// Create Bank Transfer Order
export const createBankTransferOrder = async (apiKey, orderData) => {
    try {
      console.log('🔍 Creating bank transfer order...', orderData)
      
      // Get userId from apiKey
      const userId = await getUserIdFromApiKey(apiKey);
      
      const response = await fetch(`${API_BASE_URL}/payment/bank-transfer/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY
        },
        body: JSON.stringify({
          ...orderData,
          userId: userId
        })
      })
      
      const data = await response.json()
      console.log('🔍 Bank transfer order response:', data)
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create bank transfer order')
      }
      
      return {
        success: true,
        data: data.data
      }
    } catch (error) {
      console.error('❌ Create bank transfer order error:', error)
      throw new Error(error.message)
    }
  }

// Helper function to get userId from apiKey
const getUserIdFromApiKey = async (apiKey) => {
    try {
      // You'll need an endpoint to get user info from API key
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        }
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        return data.data.id; // Return user ID
      }
      throw new Error('Failed to get user ID');
    } catch (error) {
      console.error('Error getting user ID:', error);
      throw error;
    }
}

// Get Payment Status
export const getPaymentStatus = async (apiKey, orderId) => {
  try {
    console.log('🔍 Getting payment status...', { orderId })
    
    const response = await fetch(`${API_BASE_URL}/payment/status/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY
      }
    })
    
    const data = await response.json()
    console.log('🔍 Payment status response:', data)
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get payment status')
    }
    
    return {
      success: true,
      data: data.data
    }
  } catch (error) {
    console.error('❌ Get payment status error:', error)
    throw new Error(error.message)
  }
}

// Get Payment History
export const getPaymentHistory = async (apiKey, options = {}) => {
  try {
    console.log('🔍 Getting payment history...', options)
    
    const { page = 1, limit = 20 } = options
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    
    const response = await fetch(`${API_BASE_URL}/payment/history?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY
      }
    })
    
    const data = await response.json()
    console.log('🔍 Payment history response:', data)
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch payment history')
    }
    
    return {
      success: true,
      data: data.data || [],
      pagination: data.pagination
    }
  } catch (error) {
    console.error('❌ Get payment history error:', error)
    throw new Error(error.message)
  }
}

// Update User Quota (for admin use)
export const updateUserQuota = async (apiKey, userId, quotaToAdd) => {
  try {
    console.log('🔍 Updating user quota...', { userId, quotaToAdd })
    
    const response = await fetch(`${API_BASE_URL}/api/user/update-quota`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY
      },
      body: JSON.stringify({
        userId,
        quotaToAdd
      })
    })
    
    const data = await response.json()
    console.log('🔍 Update quota response:', data)
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update user quota')
    }
    
    return {
      success: true,
      data: data.data
    }
  } catch (error) {
    console.error('❌ Update user quota error:', error)
    throw new Error(error.message)
  }
}
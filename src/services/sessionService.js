// src/services/sessionService.js

import { getDashboardData } from './userService'

/**
 * Validate stored session by checking with backend
 * @param {Object} storedUser - User data from localStorage
 * @returns {Promise<boolean>} - Whether session is valid
 */
export const validateSession = async (storedUser) => {
  try {
    if (!storedUser.apiKey) {
      return false
    }

    // Try to fetch dashboard data to validate the API key
    const result = await getDashboardData(storedUser.apiKey)
    
    if (result.success) {
      console.log('✅ Session validation successful')
      return true
    } else {
      console.log('❌ Session validation failed - invalid API key')
      return false
    }
  } catch (error) {
    console.error('❌ Session validation error:', error)
    return false
  }
}

/**
 * Store user session in localStorage
 * @param {Object} user - User data
 * @param {string} view - Current view
 */
export const storeSession = (user, view) => {
  try {
    localStorage.setItem('msglyapi_user', JSON.stringify(user))
    localStorage.setItem('msglyapi_view', view)
    console.log('💾 Session stored')
  } catch (error) {
    console.error('❌ Error storing session:', error)
  }
}

/**
 * Get stored session from localStorage
 * @returns {Object|null} - Stored session data or null
 */
export const getStoredSession = () => {
  try {
    const storedUser = localStorage.getItem('msglyapi_user')
    const storedView = localStorage.getItem('msglyapi_view')
    
    if (storedUser && storedView) {
      return {
        user: JSON.parse(storedUser),
        view: storedView
      }
    }
    
    return null
  } catch (error) {
    console.error('❌ Error getting stored session:', error)
    return null
  }
}

/**
 * Clear stored session
 */
export const clearSession = () => {
  try {
    localStorage.removeItem('msglyapi_user')
    localStorage.removeItem('msglyapi_view')
    console.log('🗑️ Session cleared')
  } catch (error) {
    console.error('❌ Error clearing session:', error)
  }
}
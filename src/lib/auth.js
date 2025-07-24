export const validateApiKey = (apiKey) => {
    if (!apiKey) return false
    
    // Simple validation - in production, verify against database
    return apiKey.startsWith('sk-') && apiKey.length > 10
  }
  
  export const isAdmin = (apiKey) => {
    return apiKey && apiKey.includes('admin')
  }
  
  export const rateLimit = new Map()
  
  export const checkRateLimit = (apiKey, limit = 100) => {
    const now = Date.now()
    const windowStart = now - 60 * 60 * 1000 // 1 hour window
    
    if (!rateLimit.has(apiKey)) {
      rateLimit.set(apiKey, [])
    }
    
    const requests = rateLimit.get(apiKey)
    const recentRequests = requests.filter(time => time > windowStart)
    
    if (recentRequests.length >= limit) {
      return false // Rate limit exceeded
    }
    
    recentRequests.push(now)
    rateLimit.set(apiKey, recentRequests)
    
    return true // Within rate limit
  }
// src/services/admin/chatsTabService.js

const chatsTabService = {
  // Clean service - no mock data, no unnecessary endpoints
  
  async getChats() {
    // Not needed with embedded Tawk.to
    return {
      success: true,
      data: []
    }
  },

  async getChatMessages(chatId) {
    // Not needed with embedded Tawk.to
    return {
      success: true,
      data: []
    }
  },

  async sendMessage(chatId, message) {
    // Not needed with embedded Tawk.to
    return {
      success: false,
      error: 'Use embedded Tawk.to dashboard for messaging'
    }
  },

  async getChatStats() {
    // No mock data - return empty stats
    return {
      success: true,
      data: {
        activeChats: 0,
        pendingChats: 0,
        resolvedChats: 0,
        averageResponseTime: 0
      }
    }
  }
}

export { chatsTabService }
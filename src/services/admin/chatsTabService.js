const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const ADMIN_API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY

const chatsTabService = {
  async getChats() {
    try {
      return {
        success: true,
        data: [
          { 
            id: 1, 
            user: 'John Doe', 
            lastMessage: 'Having trouble with SMS verification', 
            time: '5 min ago', 
            status: 'active',
            messages: [
              { id: 1, sender: 'user', message: 'Hi, I need help with SMS verification', time: '14:30' },
              { id: 2, sender: 'admin', message: 'Hello! I can help you with that. What specific issue are you experiencing?', time: '14:31' },
              { id: 3, sender: 'user', message: 'Having trouble with SMS verification', time: '14:32' }
            ]
          },
          { 
            id: 2, 
            user: 'Jane Smith', 
            lastMessage: 'Payment not processing correctly', 
            time: '12 min ago', 
            status: 'pending',
            messages: [
              { id: 1, sender: 'user', message: 'My payment is stuck in processing', time: '14:18' },
              { id: 2, sender: 'admin', message: 'Let me check your payment status', time: '14:19' }
            ]
          },
          { 
            id: 3, 
            user: 'Alice Brown', 
            lastMessage: 'Thanks for the quick resolution!', 
            time: '1 hour ago', 
            status: 'resolved',
            messages: [
              { id: 1, sender: 'user', message: 'Issue with quota limits', time: '13:15' },
              { id: 2, sender: 'admin', message: "I've increased your quota limit", time: '13:16' },
              { id: 3, sender: 'user', message: 'Thanks for the quick resolution!', time: '13:20' }
            ]
          }
        ]
      }
    } catch (error) {
      console.error('Get chats error:', error)
      throw new Error(error.message)
    }
  },

  async sendMessage(chatId, message) {
    try {
      console.log('Sending message:', message, 'to chat:', chatId)
      
      return {
        success: true,
        message: 'Message sent successfully'
      }
    } catch (error) {
      console.error('Send message error:', error)
      throw new Error(error.message)
    }
  },

  async getChatStats() {
    try {
      return {
        success: true,
        data: {
          activeChats: 1,
          pendingChats: 1,
          resolvedChats: 1,
          averageResponseTime: 2.3
        }
      }
    } catch (error) {
      console.error('Get chat stats error:', error)
      throw new Error(error.message)
    }
  }
}

export { chatsTabService }
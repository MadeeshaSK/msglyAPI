'use client'
import { useState, useEffect } from 'react'
import { MessageSquare, Search, ArrowLeft, Send, BarChart3 } from 'lucide-react'
import { chatsTabService } from '../../services/admin/chatsTabService'

export default function ChatsTab() {
  const [selectedChat, setSelectedChat] = useState(null)
  const [chatSearchTerm, setChatSearchTerm] = useState('')
  const [chatMessage, setChatMessage] = useState('')
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadChats()
  }, [])

  const loadChats = async () => {
    try {
      setLoading(true)
      const result = await chatsTabService.getChats()
      if (result.success) {
        setChats(result.data)
      }
    } catch (error) {
      console.error('Failed to load chats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendChatMessage = async () => {
    if (chatMessage.trim() && selectedChat) {
      try {
        const result = await chatsTabService.sendMessage(selectedChat.id, chatMessage)
        if (result.success) {
          const updatedChat = { ...selectedChat }
          updatedChat.messages.push({
            id: Date.now(),
            sender: 'admin',
            message: chatMessage,
            time: new Date().toLocaleTimeString()
          })
          setSelectedChat(updatedChat)
          setChatMessage('')
        }
      } catch (error) {
        console.error('Failed to send message:', error)
      }
    }
  }

  const getChatStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-400'
      case 'pending': return 'bg-yellow-400'
      case 'resolved': return 'bg-blue-400'
      default: return 'bg-gray-400'
    }
  }

  const filteredChats = chats.filter(c =>
    c.user.toLowerCase().includes(chatSearchTerm.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(chatSearchTerm.toLowerCase())
  )

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="glass p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <MessageSquare className="w-6 h-6 mr-2" />
          Support Chats
        </h3>
        
        <div className="relative mb-4">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
          <input
            type="text"
            placeholder="Search chats..."
            value={chatSearchTerm}
            onChange={(e) => setChatSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-purple-400 focus:outline-none"
          />
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className="bg-white/5 p-3 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-white font-medium text-sm">{chat.user}</p>
                    <div className={`w-2 h-2 rounded-full ${getChatStatusColor(chat.status)}`}></div>
                  </div>
                  <p className="text-white/60 text-xs truncate">{chat.lastMessage}</p>
                  <p className="text-white/40 text-xs mt-1">{chat.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedChat ? (
        <div className="glass p-6 rounded-xl">
          <div className="flex items-center mb-4">
            <button
              onClick={() => setSelectedChat(null)}
              className="mr-3 p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h3 className="text-xl font-semibold text-white">{selectedChat.user}</h3>
              <p className="text-white/60 text-sm capitalize">{selectedChat.status}</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4 mb-4 max-h-80 overflow-y-auto">
            <div className="space-y-3">
              {selectedChat.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.sender === 'admin'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/10 text-white'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p className="text-xs opacity-70 mt-1">{message.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-purple-400 focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()}
            />
            <button
              onClick={handleSendChatMessage}
              disabled={!chatMessage.trim()}
              className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-white/10 disabled:text-white/40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="glass p-6 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60">Select a chat to start conversation</p>
          </div>
        </div>
      )}

      <div className="glass p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2" />
          Chat Statistics
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-white/60 text-sm">Active Chats</p>
              <p className="text-2xl font-bold text-green-400">
                {chats.filter(c => c.status === 'active').length}
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-white/60 text-sm">Pending Chats</p>
              <p className="text-2xl font-bold text-yellow-400">
                {chats.filter(c => c.status === 'pending').length}
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-white/60 text-sm">Resolved Today</p>
              <p className="text-2xl font-bold text-blue-400">
                {chats.filter(c => c.status === 'resolved').length}
              </p>
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-lg">
            <p className="text-white/60 text-sm mb-2">Response Time</p>
            <p className="text-xl font-bold text-purple-400">2.3 min</p>
            <p className="text-white/60 text-xs">Average response time</p>
          </div>

          <div className="bg-white/5 p-4 rounded-lg">
            <p className="text-white/60 text-sm mb-2">Common Issues</p>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">SMS Verification</span>
                <span className="text-white">45%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Payment Issues</span>
                <span className="text-white">30%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Account Access</span>
                <span className="text-white">25%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
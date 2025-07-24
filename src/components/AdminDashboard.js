'use client'
import { useState } from 'react'
import { Users, Settings, Activity, Search, User, Shield, AlertCircle, CheckCircle } from 'lucide-react'
import Sidebar from './Sidebar'

export default function AdminDashboard({ user, onLogout }) {
  const [showSidebar, setShowSidebar] = useState(false)
  const [serviceLevel, setServiceLevel] = useState('level2')
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data
  const [users] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', quota: 1000, used: 247, status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', quota: 2000, used: 1580, status: 'active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', quota: 500, used: 89, status: 'inactive' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', quota: 1500, used: 750, status: 'active' }
  ])

  const [liveStats] = useState({
    totalUsers: 1247,
    activeUsers: 892,
    totalRequests: 145820,
    successRate: 98.7
  })

  const [liveLogs] = useState([
    { id: 1, time: '14:30:45', user: 'user_123', action: 'SMS_SEND', status: 'success' },
    { id: 2, time: '14:30:43', user: 'user_456', action: 'OTP_VERIFY', status: 'success' },
    { id: 3, time: '14:30:41', user: 'user_789', action: 'SMS_SEND', status: 'failed' },
    { id: 4, time: '14:30:39', user: 'user_321', action: 'OTP_SEND', status: 'success' }
  ])

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getServiceStatusColor = () => {
    switch(serviceLevel) {
      case 'level1': return 'text-yellow-400'
      case 'level2': return 'text-green-400'
      case 'level3': return 'text-blue-400'
      case 'off': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <header className="glass border-b border-white/10">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">
              Admin<span className="text-purple-400">Panel</span>
            </h1>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${serviceLevel === 'off' ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
              <span className={`text-sm font-medium ${getServiceStatusColor()}`}>
                Service {serviceLevel === 'off' ? 'Offline' : serviceLevel.toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-white/80 text-sm">
              Admin: <span className="text-white font-medium">{user.name}</span>
            </div>
            <button
              onClick={() => setShowSidebar(true)}
              className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white hover:bg-purple-700 transition-colors"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Service Control */}
        <div className="glass p-6 rounded-xl mb-8">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Settings className="w-6 h-6 mr-2" />
            Service Control
          </h3>
          <div className="flex space-x-4">
            {['level1', 'level2', 'level3', 'off'].map((level) => (
              <button
                key={level}
                onClick={() => setServiceLevel(level)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  serviceLevel === level
                    ? level === 'off' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-green-600 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {level === 'off' ? 'Turn Off' : level.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* User List */}
          <div className="glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Users className="w-6 h-6 mr-2" />
                Users
              </h3>
            </div>
            
            <div className="relative mb-4">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-purple-400 focus:outline-none"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedUser?.id === user.id 
                      ? 'bg-purple-600/30 border-purple-400' 
                      : 'bg-white/5 hover:bg-white/10'
                  } border border-transparent`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium text-sm">{user.name}</p>
                      <p className="text-white/60 text-xs">{user.email}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      user.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center Content */}
          <div>
            {selectedUser ? (
              /* User Details */
              <div className="glass p-6 rounded-xl">
                <h3 className="text-xl font-semibold text-white mb-6">User Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Name</label>
                    <input
                      type="text"
                      defaultValue={selectedUser.name}
                      className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Email</label>
                    <input
                      type="email"
                      defaultValue={selectedUser.email}
                      className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white focus:border-purple-400 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/60 text-sm mb-1">Quota</label>
                      <input
                        type="number"
                        defaultValue={selectedUser.quota}
                        className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white focus:border-purple-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-sm mb-1">Used</label>
                      <input
                        type="number"
                        defaultValue={selectedUser.used}
                        readOnly
                        className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white/60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/60 text-sm mb-1">Status</label>
                    <select
                      defaultValue={selectedUser.status}
                      className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white focus:border-purple-400 focus:outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>

                  <button className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Update User
                  </button>
                </div>
              </div>
            ) : (
              /* Stats Overview */
              <div className="glass p-6 rounded-xl">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <Activity className="w-6 h-6 mr-2" />
                  System Statistics
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-white/60 text-sm">Total Users</p>
                    <p className="text-2xl font-bold text-white">{liveStats.totalUsers.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-white/60 text-sm">Active Users</p>
                    <p className="text-2xl font-bold text-green-400">{liveStats.activeUsers.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-white/60 text-sm">Total Requests</p>
                    <p className="text-2xl font-bold text-blue-400">{liveStats.totalRequests.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-white/60 text-sm">Success Rate</p>
                    <p className="text-2xl font-bold text-purple-400">{liveStats.successRate}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Logging */}
          <div className="glass p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <AlertCircle className="w-6 h-6 mr-2" />
              Live Logging
            </h3>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {liveLogs.map((log) => (
                <div key={log.id} className="bg-white/5 p-3 rounded-lg">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60 font-mono">{log.time}</span>
                    <span className={`px-2 py-1 rounded ${
                      log.status === 'success' 
                        ? 'bg-green-600/20 text-green-300' 
                        : 'bg-red-600/20 text-red-300'
                    }`}>
                      {log.status === 'success' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    </span>
                  </div>
                  <p className="text-white/80 text-sm mt-1">{log.user}</p>
                  <p className="text-white text-sm font-medium">{log.action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <Sidebar
          user={user}
          onClose={() => setShowSidebar(false)}
          onLogout={onLogout}
        />
      )}
    </div>
  )
}
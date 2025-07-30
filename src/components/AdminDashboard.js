'use client'
import { useState } from 'react'
import { Users, Settings, Activity, Search, User, Shield, AlertCircle, CheckCircle, ArrowLeft, Trash2, Edit, Home, BarChart3, MessageSquare, Bell, DollarSign, Eye, X, Check, Clock, XCircle } from 'lucide-react'
import Sidebar from './Sidebar'

export default function AdminDashboard({ user, onLogout }) {
  const [showSidebar, setShowSidebar] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentSearchTerm, setPaymentSearchTerm] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('home')
  const [showUserLogs, setShowUserLogs] = useState(false)
  const [serverStatus] = useState('online') // online, offline, maintenance

  // Mock data
  const [users] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', quota: 1000, used: 247, status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', quota: 2000, used: 1580, status: 'active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', quota: 500, used: 89, status: 'inactive' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', quota: 1500, used: 750, status: 'active' }
  ])

  const [payments] = useState([
    { id: 1, user: 'John Doe', amount: 49.99, status: 'success', date: '2025-07-30', method: 'Card' },
    { id: 2, user: 'Jane Smith', amount: 99.99, status: 'verifying', date: '2025-07-30', method: 'Bank' },
    { id: 3, user: 'Bob Johnson', amount: 29.99, status: 'failed', date: '2025-07-29', method: 'Card' },
    { id: 4, user: 'Alice Brown', amount: 79.99, status: 'pending', date: '2025-07-29', method: 'PayPal' },
    { id: 5, user: 'Mike Wilson', amount: 149.99, status: 'success', date: '2025-07-28', method: 'Card' },
    { id: 6, user: 'Sarah Davis', amount: 199.99, status: 'verifying', date: '2025-07-28', method: 'Bank' }
  ])

  const [liveLogs] = useState([
    { id: 1, time: '14:30:45', user: 'user_123', action: 'SMS_SEND', status: 'success' },
    { id: 2, time: '14:30:43', user: 'user_456', action: 'OTP_VERIFY', status: 'success' },
    { id: 3, time: '14:30:41', user: 'user_789', action: 'SMS_SEND', status: 'failed' },
    { id: 4, time: '14:30:39', user: 'user_321', action: 'OTP_SEND', status: 'success' }
  ])

  const [userLogs] = useState([
    { id: 1, time: '14:25:12', action: 'LOGIN', status: 'success' },
    { id: 2, time: '14:20:33', action: 'SMS_SEND', status: 'success' },
    { id: 3, time: '14:15:21', action: 'OTP_VERIFY', status: 'failed' },
    { id: 4, time: '14:10:45', action: 'PROFILE_UPDATE', status: 'success' }
  ])

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.user.toLowerCase().includes(paymentSearchTerm.toLowerCase())
    const matchesFilter = paymentFilter === 'all' || p.status === paymentFilter
    return matchesSearch && matchesFilter
  })

  const getServerStatusColor = () => {
    switch(serverStatus) {
      case 'online': return 'text-green-400'
      case 'offline': return 'text-red-400'
      case 'maintenance': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getPaymentStatusColor = (status) => {
    switch(status) {
      case 'success': return 'bg-green-600/20 text-green-300'
      case 'failed': return 'bg-red-600/20 text-red-300'
      case 'verifying': return 'bg-yellow-600/20 text-yellow-300'
      case 'pending': return 'bg-blue-600/20 text-blue-300'
      default: return 'bg-gray-600/20 text-gray-300'
    }
  }

  const getPaymentStatusIcon = (status) => {
    switch(status) {
      case 'success': return <CheckCircle className="w-3 h-3" />
      case 'failed': return <XCircle className="w-3 h-3" />
      case 'verifying': return <Eye className="w-3 h-3" />
      case 'pending': return <Clock className="w-3 h-3" />
      default: return <AlertCircle className="w-3 h-3" />
    }
  }

  const handleUserSelect = (selectedUser) => {
    setSelectedUser(selectedUser)
    setShowUserLogs(true)
  }

  const handleBackToUsers = () => {
    setSelectedUser(null)
    setShowUserLogs(false)
  }

  const handleBackToPayments = () => {
    setSelectedPayment(null)
  }

  const renderControlPanel = () => {
    switch(activeTab) {
      case 'home':
        return (
          <div className="glass p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Home className="w-6 h-6 mr-2" />
              Dashboard Overview
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-lg">
                <p className="text-white/60 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">1,247</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg">
                <p className="text-white/60 text-sm">Active Users</p>
                <p className="text-2xl font-bold text-green-400">892</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg">
                <p className="text-white/60 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-400">$12,450</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg">
                <p className="text-white/60 text-sm">Success Rate</p>
                <p className="text-2xl font-bold text-purple-400">98.7%</p>
              </div>
            </div>
          </div>
        )
      
      case 'analysis':
        return (
          <div className="glass p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <BarChart3 className="w-6 h-6 mr-2" />
              Analytics
            </h3>
            <div className="space-y-4">
              <div className="bg-white/5 p-4 rounded-lg">
                <p className="text-white/60 text-sm mb-2">Daily Active Users</p>
                <div className="h-20 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded flex items-end justify-center">
                  <span className="text-white text-sm">Chart visualization would go here</span>
                </div>
              </div>
              <div className="bg-white/5 p-4 rounded-lg">
                <p className="text-white/60 text-sm mb-2">Revenue Trends</p>
                <div className="h-20 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded flex items-end justify-center">
                  <span className="text-white text-sm">Revenue chart would go here</span>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'chats':
        return (
          <div className="glass p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <MessageSquare className="w-6 h-6 mr-2" />
              Support Chats
            </h3>
            <div className="space-y-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white/5 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">User Chat #{i}</p>
                    <p className="text-white/60 text-xs">Last message 5 min ago</p>
                  </div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'notifications':
        return (
          <div className="glass p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Bell className="w-6 h-6 mr-2" />
              Notifications
            </h3>
            <div className="space-y-3">
              {[
                { type: 'warning', message: 'High API usage detected', time: '2 min ago' },
                { type: 'info', message: 'New user registration', time: '5 min ago' },
                { type: 'success', message: 'Server backup completed', time: '10 min ago' },
                { type: 'error', message: 'Failed payment attempt', time: '15 min ago' }
              ].map((notif, i) => (
                <div key={i} className="bg-white/5 p-3 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      notif.type === 'warning' ? 'bg-yellow-400' :
                      notif.type === 'info' ? 'bg-blue-400' :
                      notif.type === 'success' ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{notif.message}</p>
                      <p className="text-white/60 text-xs">{notif.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      
      default:
        return null
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
              <div className={`w-3 h-3 rounded-full ${serverStatus === 'offline' ? 'bg-red-500' : serverStatus === 'maintenance' ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`}></div>
              <span className={`text-sm font-medium ${getServerStatusColor()}`}>
                Server {serverStatus === 'online' ? 'Online' : serverStatus === 'offline' ? 'Offline' : 'Maintenance'}
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
        {/* Control Panel */}
        <div className="glass p-6 rounded-xl mb-8">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Settings className="w-6 h-6 mr-2" />
            Control Panel
          </h3>
          <div className="flex space-x-4">
            {[
              { key: 'home', icon: Home, label: 'Home' },
              { key: 'analysis', icon: BarChart3, label: 'Analysis' },
              { key: 'chats', icon: MessageSquare, label: 'Chats' },
              { key: 'notifications', icon: Bell, label: 'Notifications' }
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                  activeTab === key
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* User List */}
          <div className="glass p-6 rounded-xl">
            {selectedUser ? (
              /* User Details */
              <div>
                <div className="flex items-center mb-4">
                  <button
                    onClick={handleBackToUsers}
                    className="mr-3 p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h3 className="text-xl font-semibold text-white">User Details</h3>
                </div>
                
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

                  <div className="flex space-x-3">
                    <button className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
                      <Edit className="w-4 h-4" />
                      <span>Update</span>
                    </button>
                    <button className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2">
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* User List */
              <div>
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
                      onClick={() => handleUserSelect(user)}
                      className="p-3 rounded-lg cursor-pointer transition-colors bg-white/5 hover:bg-white/10 border border-transparent"
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
            )}
          </div>

          {/* Center Content - Control Panel or Payments */}
          <div>
            {selectedPayment ? (
              /* Payment Details */
              <div className="glass p-6 rounded-xl">
                <div className="flex items-center mb-4">
                  <button
                    onClick={handleBackToPayments}
                    className="mr-3 p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h3 className="text-xl font-semibold text-white">Payment Details</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-white/60 text-sm">User</p>
                    <p className="text-white font-medium">{selectedPayment.user}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-white/60 text-sm">Amount</p>
                    <p className="text-white font-medium text-xl">${selectedPayment.amount}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-white/60 text-sm">Method</p>
                    <p className="text-white font-medium">{selectedPayment.method}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-white/60 text-sm">Date</p>
                    <p className="text-white font-medium">{selectedPayment.date}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-white/60 text-sm">Status</p>
                    <span className={`px-3 py-1 rounded-full text-sm ${getPaymentStatusColor(selectedPayment.status)}`}>
                      {selectedPayment.status}
                    </span>
                  </div>

                  {selectedPayment.status === 'verifying' && (
                    <div className="flex space-x-3">
                      <button className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                        <Check className="w-4 h-4" />
                        <span>Accept</span>
                      </button>
                      <button className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2">
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'home' ? (
                  /* Payments */
                  <div className="glass p-6 rounded-xl">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <DollarSign className="w-6 h-6 mr-2" />
                      Payments
                    </h3>
                    
                    <div className="relative mb-4">
                      <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
                      <input
                        type="text"
                        placeholder="Search payments..."
                        value={paymentSearchTerm}
                        onChange={(e) => setPaymentSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-purple-400 focus:outline-none"
                      />
                    </div>

                    <div className="flex space-x-2 mb-4">
                      {['all', 'success', 'failed', 'verifying', 'pending'].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setPaymentFilter(filter)}
                          className={`px-3 py-1 rounded-full text-xs transition-colors ${
                            paymentFilter === filter
                              ? 'bg-purple-600 text-white'
                              : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {filteredPayments.map((payment) => (
                        <div
                          key={payment.id}
                          onClick={() => setSelectedPayment(payment)}
                          className="p-3 rounded-lg cursor-pointer transition-colors bg-white/5 hover:bg-white/10"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium text-sm">{payment.user}</p>
                              <p className="text-white/60 text-xs">${payment.amount} - {payment.date}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs flex items-center space-x-1 ${getPaymentStatusColor(payment.status)}`}>
                              {getPaymentStatusIcon(payment.status)}
                              <span>{payment.status}</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  renderControlPanel()
                )}
              </>
            )}
          </div>

          {/* Live Logging */}
          <div className="glass p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <AlertCircle className="w-6 h-6 mr-2" />
              {showUserLogs && selectedUser ? `${selectedUser.name} Logs` : 'Live Logs'}
            </h3>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {(showUserLogs && selectedUser ? userLogs : liveLogs).map((log) => (
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
                  {!showUserLogs && <p className="text-white/80 text-sm mt-1">{log.user}</p>}
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
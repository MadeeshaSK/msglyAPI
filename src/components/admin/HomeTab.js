'use client'
import { useState, useEffect } from 'react'
import { Home, DollarSign, Users, Search, CheckCircle, XCircle, Eye, Clock, AlertCircle, ArrowLeft, Trash2, Edit, Plus, Loader2, Check, X } from 'lucide-react'
import { homeTabService } from '../../services/admin/homeTabService'

export default function HomeTab({ dashboardData, onRefresh }) {
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentSearchTerm, setPaymentSearchTerm] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [userLoading, setUserLoading] = useState(false)

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    amount: 0,
    isActive: true,
    emailNotifications: true
  })

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    try {
      setLoading(true)
      const result = await homeTabService.getPayments()
      if (result.success) {
        setPayments(result.data)
      }
    } catch (error) {
      console.error('Failed to load payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    try {
      setUserLoading(true)
      const result = await homeTabService.createUser(userForm)
      
      if (result.success) {
        setShowCreateUser(false)
        setUserForm({
          name: '',
          email: '',
          phone: '',
          amount: 0,
          isActive: true,
          emailNotifications: true
        })
        await onRefresh()
        alert('User created successfully!')
      }
    } catch (error) {
      alert(`Failed to create user: ${error.message}`)
    } finally {
      setUserLoading(false)
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return
    
    try {
      setUserLoading(true)
      const updates = {
        name: userForm.name,
        email: userForm.email,
        phone: userForm.phone,
        amount: userForm.amount,
        isActive: userForm.isActive,
        emailNotifications: userForm.emailNotifications
      }
      
      const result = await homeTabService.updateUser(selectedUser.id, updates)
      
      if (result.success) {
        setIsEditing(false)
        setSelectedUser(result.data)
        await onRefresh()
        alert('User updated successfully!')
      }
    } catch (error) {
      alert(`Failed to update user: ${error.message}`)
    } finally {
      setUserLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    try {
      setUserLoading(true)
      const result = await homeTabService.deleteUser(userId)
      
      if (result.success) {
        setSelectedUser(null)
        await onRefresh()
        alert('User deleted successfully!')
      }
    } catch (error) {
      alert(`Failed to delete user: ${error.message}`)
    } finally {
      setUserLoading(false)
    }
  }

  const handleUserSelect = async (user) => {
    try {
      setUserLoading(true)
      const result = await homeTabService.getUser(user.id)
      
      if (result.success) {
        setSelectedUser(result.data)
        setUserForm({
          name: result.data.name || '',
          email: result.data.email || '',
          phone: result.data.phone || '',
          amount: result.data.amount || 0,
          isActive: result.data.isActive !== undefined ? result.data.isActive : true,
          emailNotifications: result.data.emailNotifications !== undefined ? result.data.emailNotifications : true
        })
      }
    } catch (error) {
      alert(`Failed to load user details: ${error.message}`)
    } finally {
      setUserLoading(false)
    }
  }

  const getUserAnalytics = () => {
    const totalUsers = dashboardData.users.length
    const activeUsers = dashboardData.users.filter(u => u.isActive).length
    
    const plans = {
      free: dashboardData.users.filter(u => (u.amount || 0) <= 100).length,
      premium: dashboardData.users.filter(u => (u.amount || 0) > 100 && (u.amount || 0) <= 500).length,
      pro: dashboardData.users.filter(u => (u.amount || 0) > 500 && (u.amount || 0) <= 1000).length,
      enterprise: dashboardData.users.filter(u => (u.amount || 0) > 1000).length
    }
    
    return {
      totalUsers,
      activeUsers,
      paidUsers: totalUsers - plans.free,
      freeUsers: plans.free,
      plans
    }
  }

  const filteredUsers = dashboardData.users.filter(u => 
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.user.toLowerCase().includes(paymentSearchTerm.toLowerCase())
    const matchesFilter = paymentFilter === 'all' || p.status === paymentFilter
    return matchesSearch && matchesFilter
  })

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

  const userAnalytics = getUserAnalytics()

  const renderFirstColumn = () => {
    if (selectedUser) {
      return (
        <div className="glass p-6 rounded-xl">
          <div className="flex items-center mb-4">
            <button
              onClick={() => setSelectedUser(null)}
              className="mr-3 p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
              disabled={userLoading}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h3 className="text-xl font-semibold text-white">User Details</h3>
            {userLoading && <Loader2 className="w-5 h-5 text-purple-400 animate-spin ml-3" />}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white/60 text-sm mb-1">Name</label>
              <input
                type="text"
                value={userForm.name}
                onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                disabled={!isEditing || userLoading}
                className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white focus:border-purple-400 focus:outline-none disabled:opacity-50"
              />
            </div>
            
            <div>
              <label className="block text-white/60 text-sm mb-1">Email</label>
              <input
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                disabled={!isEditing || userLoading}
                className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white focus:border-purple-400 focus:outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-1">Phone</label>
              <input
                type="tel"
                value={userForm.phone}
                onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                disabled={!isEditing || userLoading}
                className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white focus:border-purple-400 focus:outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-1">Amount</label>
              <input
                type="number"
                value={userForm.amount}
                onChange={(e) => setUserForm({...userForm, amount: parseFloat(e.target.value) || 0})}
                disabled={!isEditing || userLoading}
                className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white focus:border-purple-400 focus:outline-none disabled:opacity-50"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">Active Status</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={userForm.isActive}
                  onChange={(e) => setUserForm({...userForm, isActive: e.target.checked})}
                  disabled={!isEditing || userLoading}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 peer-disabled:opacity-50"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">Email Notifications</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={userForm.emailNotifications}
                  onChange={(e) => setUserForm({...userForm, emailNotifications: e.target.checked})}
                  disabled={!isEditing || userLoading}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 peer-disabled:opacity-50"></div>
              </label>
            </div>

            {selectedUser.createdAt && (
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-white/60 text-sm">Created</p>
                <p className="text-white font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
              </div>
            )}

            <div className="flex space-x-3">
              {!isEditing ? (
                <>
                  <button 
                    onClick={() => setIsEditing(true)}
                    disabled={userLoading}
                    className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(selectedUser.id)}
                    disabled={userLoading}
                    className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={handleUpdateUser}
                    disabled={userLoading}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {userLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>Save</span>
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    disabled={userLoading}
                    className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )
    } else if (showCreateUser) {
      return (
        <div className="glass p-6 rounded-xl">
          <div className="flex items-center mb-4">
            <button
              onClick={() => setShowCreateUser(false)}
              className="mr-3 p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
              disabled={userLoading}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h3 className="text-xl font-semibold text-white">Create New User</h3>
            {userLoading && <Loader2 className="w-5 h-5 text-purple-400 animate-spin ml-3" />}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white/60 text-sm mb-1">Name *</label>
              <input
                type="text"
                value={userForm.name}
                onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                disabled={userLoading}
                placeholder="Enter full name"
                className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-purple-400 focus:outline-none disabled:opacity-50"
              />
            </div>
            
            <div>
              <label className="block text-white/60 text-sm mb-1">Email *</label>
              <input
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                disabled={userLoading}
                placeholder="Enter email address"
                className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-purple-400 focus:outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-1">Phone</label>
              <input
                type="tel"
                value={userForm.phone}
                onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                disabled={userLoading}
                placeholder="Enter phone number"
                className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-purple-400 focus:outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-1">Initial Amount</label>
              <input
                type="number"
                value={userForm.amount}
                onChange={(e) => setUserForm({...userForm, amount: parseFloat(e.target.value) || 0})}
                disabled={userLoading}
                placeholder="0"
                className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-purple-400 focus:outline-none disabled:opacity-50"
              />
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={handleCreateUser}
                disabled={userLoading || !userForm.name || !userForm.email}
                className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {userLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Create User</span>
              </button>
              <button 
                onClick={() => setShowCreateUser(false)}
                disabled={userLoading}
                className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className="glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <Users className="w-6 h-6 mr-2" />
              Users ({dashboardData.users.length})
            </h3>
            <button
              onClick={() => setShowCreateUser(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add User</span>
            </button>
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
                    <p className="text-white font-medium text-sm">{user.name || 'No name'}</p>
                    <p className="text-white/60 text-xs">{user.email || 'No email'}</p>
                    {user.phone && <p className="text-white/40 text-xs">{user.phone}</p>}
                    {user.amount > 0 && <p className="text-green-400 text-xs">${user.amount}</p>}
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    user.isActive ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                </div>
              </div>
            ))}
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">No users found</p>
                {searchTerm && (
                  <p className="text-white/40 text-sm mt-2">Try adjusting your search</p>
                )}
              </div>
            )}
          </div>
        </div>
      )
    }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {renderFirstColumn()}

      {selectedPayment ? (
        <div className="glass p-6 rounded-xl">
          <div className="flex items-center mb-4">
            <button
              onClick={() => setSelectedPayment(null)}
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
          </div>
        </div>
      ) : (
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
      )}

      <div className="glass p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Home className="w-6 h-6 mr-2" />
          Dashboard Overview
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 p-4 rounded-lg">
            <p className="text-white/60 text-sm">Total Users</p>
            <p className="text-2xl font-bold text-white">{userAnalytics.totalUsers}</p>
          </div>
          <div className="bg-white/5 p-4 rounded-lg">
            <p className="text-white/60 text-sm">Active Users</p>
            <p className="text-2xl font-bold text-green-400">{userAnalytics.activeUsers}</p>
          </div>
          <div className="bg-white/5 p-4 rounded-lg">
            <p className="text-white/60 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold text-blue-400">${dashboardData.users.reduce((sum, u) => sum + (u.amount || 0), 0).toFixed(2)}</p>
          </div>
          <div className="bg-white/5 p-4 rounded-lg">
            <p className="text-white/60 text-sm">Server Status</p>
            <p className={`text-2xl font-bold capitalize ${dashboardData.serverStatus === 'online' ? 'text-green-400' : 'text-red-400'}`}>{dashboardData.serverStatus}</p>
          </div>
        </div>

        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          Live Logs
        </h4>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {[
            { id: 1, time: '14:30:45', user: 'user_123', action: 'SMS_SEND', status: 'success' },
            { id: 2, time: '14:30:43', user: 'user_456', action: 'OTP_VERIFY', status: 'success' },
            { id: 3, time: '14:30:41', user: 'user_789', action: 'SMS_SEND', status: 'failed' },
            { id: 4, time: '14:30:39', user: 'user_321', action: 'OTP_SEND', status: 'success' }
          ].map((log) => (
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
  )
}
// src/components/admin/HomeTab.js

'use client'
import { useState, useEffect } from 'react'
import { Home, DollarSign, Users, Search, CheckCircle, XCircle, Eye, Clock, AlertCircle, ArrowLeft, Trash2, Edit, Plus, Loader2, Check, X, Activity, User, Key } from 'lucide-react'
import { homeTabService } from '../../services/admin/homeTabService'

export default function HomeTab({ dashboardData, onRefresh, onShowSnackbar }) {
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentSearchTerm, setPaymentSearchTerm] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [payments, setPayments] = useState([])
  const [userPayments, setUserPayments] = useState([])
  const [logs, setLogs] = useState([])
  const [userLogs, setUserLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [userLoading, setUserLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [logLoading, setLogLoading] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    amount: 0,
    apikey: '',
    isActive: true,
    emailNotifications: true
  })

  useEffect(() => {
    loadPayments()
    loadLogs()
  }, [])

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm.trim()) {
        handleUserSearch()
      } else {
        setSearchResults([])
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [searchTerm])

  // Search user
  const handleUserSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    try {
      setIsSearching(true)
      const result = await homeTabService.searchUsers(searchTerm.trim())
      if (result.success) {
        setSearchResults(result.data)
      }
    } catch (error) {
      console.error('Failed to search users:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Search payment
  const handlePaymentSearch = async () => {
    try {
      setPaymentLoading(true)
      
      if (!paymentSearchTerm.trim()) {
        if (selectedUser) {
          await loadUserPayments(selectedUser.id)
        } else {
          await loadPayments()
        }
        return
      }

      const searchTerm = paymentSearchTerm.trim()
      
      const currentPayments = selectedUser ? userPayments : payments
      const paymentById = currentPayments.find(p => 
        p.id && p.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
      
      if (paymentById) {
        if (selectedUser) {
          setUserPayments([paymentById])
        } else {
          setPayments([paymentById])
        }
        return
      }

      try {
        const userResult = await homeTabService.getUser(searchTerm)
        if (userResult.success) {
          const userPaymentsResult = await homeTabService.getUserPayments(userResult.data.id)
          if (userPaymentsResult.success) {
            if (selectedUser) {
              setUserPayments(userPaymentsResult.data)
            } else {
              setPayments(userPaymentsResult.data)
            }
          }
          return
        }
      } catch (error) {
      }

      if (selectedUser) {
        setUserPayments([])
      } else {
        setPayments([])
      }

    } catch (error) {
      console.error('Failed to search payments:', error)
    } finally {
      setPaymentLoading(false)
    }
  }

  useEffect(() => {
    const delayedPaymentSearch = setTimeout(() => {
      handlePaymentSearch()
    }, 300)

    return () => clearTimeout(delayedPaymentSearch)
  }, [paymentSearchTerm])

  // Load payments
  const loadPayments = async () => {
    try {
      setPaymentLoading(true)
      const result = await homeTabService.getAllPayments({ limit: 100 })
      if (result.success) {
        setPayments(result.data)
      }
    } catch (error) {
      console.error('Failed to load payments:', error)
      setPayments([])
    } finally {
      setPaymentLoading(false)
    }
  }

  // Load all logs
  const loadLogs = async () => {
    try {
      setLogLoading(true)
      const result = await homeTabService.getAllLogs({ limit: 100 })
      if (result.success) {
        setLogs(result.data)
      }
    } catch (error) {
      console.error('Failed to load logs:', error)
      setLogs([])
    } finally {
      setLogLoading(false)
    }
  }

  // Load all payments
  const loadUserPayments = async (userId) => {
    try {
      setPaymentLoading(true)
      const result = await homeTabService.getUserPayments(userId, { limit: 50 })
      if (result.success) {
        setUserPayments(result.data)
      }
    } catch (error) {
      console.error('Failed to load user payments:', error)
      setUserPayments([])
    } finally {
      setPaymentLoading(false)
    }
  }

  // Load Logs
  const loadUserLogs = async (userId) => {
    try {
      setLogLoading(true)
      const result = await homeTabService.getUserLogs(userId, { limit: 50 })
      if (result.success) {
        setUserLogs(result.data)
      }
    } catch (error) {
      console.error('Failed to load user logs:', error)
      setUserLogs([])
    } finally {
      setLogLoading(false)
    }
  }

  // update user
  const handleUpdateUser = async () => {
    if (!selectedUser) return
    
    try {
      setUserLoading(true)
      const updates = {
        name: userForm.name,
        email: userForm.email,
        phone: userForm.phone,
        amount: userForm.amount,
        apikey: userForm.apikey,
        isActive: userForm.isActive,
        emailNotifications: userForm.emailNotifications
      }
      
      const result = await homeTabService.updateUser(selectedUser.id, updates)
      
      if (result.success) {
        setIsEditing(false)
        setSelectedUser(result.data)
        await onRefresh()
        onShowSnackbar && onShowSnackbar('User updated successfully!', 'success')
      }
    } catch (error) {
      onShowSnackbar && onShowSnackbar(`Failed to update user: ${error.message}`, 'error')
    } finally {
      setUserLoading(false)
    }
  }

  // delete user
  const handleDeleteUser = async (userId) => {
    try {
      setUserLoading(true)
      const result = await homeTabService.deleteUser(userId)
      
      if (result.success) {
        setSelectedUser(null)
        setShowDeleteConfirm(false)
        setUserToDelete(null)
        await onRefresh()
        onShowSnackbar && onShowSnackbar('User deleted successfully!', 'success')
      }
    } catch (error) {
      onShowSnackbar && onShowSnackbar(`Failed to delete user: ${error.message}`, 'error')
    } finally {
      setUserLoading(false)
    }
  }

  const handleDeleteClick = (userId) => {
    setUserToDelete(userId)
    setShowDeleteConfirm(true)
  }

  // user select
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
          apikey: result.data.apikey || result.data.apiKey || '',
          isActive: result.data.isActive !== undefined ? result.data.isActive : true,
          emailNotifications: result.data.emailNotifications !== undefined ? result.data.emailNotifications : true
        })
        
        // Load user-specific data
        await Promise.all([
          loadUserPayments(user.id),
          loadUserLogs(user.id)
        ])
      }
    } catch (error) {
      onShowSnackbar && onShowSnackbar(`Failed to load user details: ${error.message}`, 'error')
    } finally {
      setUserLoading(false)
    }
  }

  const handlePaymentStatusChange = async (payment, newStatus) => {
    try {
      setPaymentLoading(true)
      
      // Get payment amount in LKR - prioritize LKR fields over USD
      const paymentAmountLKR = payment.priceLKR || 
                              payment.priceLkr || 
                              payment.price_lkr || 
                              payment.amountLKR || 
                              payment.amountLkr ||
                              payment.amount ||
                              (payment.priceUsd || payment.priceUSD || payment.price_usd || 0) * 300 // Convert USD to LKR as fallback
      
      console.log('Payment amount (LKR):', paymentAmountLKR)
      
      const statusData = { 
        status: newStatus,
        transactionReference: `TRX_${payment.id || 'UNKNOWN'}_${Date.now()}`,
        verifiedAmount: parseFloat(paymentAmountLKR)
      }
      
      // Add reason for rejection
      if (newStatus === 'failed') {
        statusData.reason = 'Payment rejected by admin'
      }
      
      console.log('Sending status data:', statusData)
      
      // Pass the entire payment object
      const result = await homeTabService.changeBankTransferStatus(payment, statusData)
      
      if (result.success) {
        // Reload payments
        if (selectedUser) {
          await loadUserPayments(selectedUser.id)
        } else {
          await loadPayments()
        }
        setSelectedPayment(null)
        onShowSnackbar && onShowSnackbar('Payment status updated successfully!', 'success')
      }
    } catch (error) {
      onShowSnackbar && onShowSnackbar(`Failed to update payment status: ${error.message}`, 'error')
    } finally {
      setPaymentLoading(false)
    }
  }

  const getUserAnalytics = () => {
    const allUsers = dashboardData?.users || []
    const totalUsers = allUsers.length
    const activeUsers = allUsers.filter(u => u.isActive).length
    
    const totalRevenue = payments
    .filter(payment => payment.status === 'success')
    .reduce((sum, payment) => {
      const paymentAmount = parseFloat(payment.priceUSD || 0)
      return sum + paymentAmount
    }, 0)
    const totalQuota = allUsers.reduce((sum, u) => sum + (u.amount || 0), 0)
    
    return {
      totalUsers,
      activeUsers,
      totalRevenue,
      totalQuota
    }
  }

  const displayUsers = searchTerm.trim() ? searchResults : (dashboardData?.users || [])

  const currentPayments = selectedUser ? userPayments : payments
  const filteredPayments = currentPayments.filter(p => {
    const matchesStatusFilter = paymentFilter === 'all' || p.status === paymentFilter
    return matchesStatusFilter
  })

  const currentLogs = selectedUser ? userLogs : logs

  const getPaymentStatusColor = (status) => {
    switch(status) {
      case 'success': return 'bg-green-600/20 text-green-300'
      case 'failed': return 'bg-red-600/20 text-red-300'
      case 'pending_verification': return 'bg-yellow-600/20 text-yellow-300'
      case 'awaiting_payment': return 'bg-blue-600/20 text-blue-300'
      default: return 'bg-gray-600/20 text-gray-300'
    }
  }

  const getPaymentStatusIcon = (status) => {
    switch(status) {
      case 'success': return <CheckCircle className="w-3 h-3" />
      case 'failed': return <XCircle className="w-3 h-3" />
      case 'pending_verification': return <Eye className="w-3 h-3" />
      case 'awaiting_payment': return <Clock className="w-3 h-3" />
      default: return <AlertCircle className="w-3 h-3" />
    }
  }

  const getPaymentStatusDisplay = (status) => {
    switch(status) {
      case 'awaiting_payment': return 'pending'
      case 'pending_verification': return 'verifying'
      default: return status
    }
  }

  const getLogStatusColor = (status) => {
    switch(status) {
      case 'success': return 'bg-green-600/20 text-green-300'
      case 'failed': 
      case 'error': return 'bg-red-600/20 text-red-300'
      case 'warning': return 'bg-yellow-600/20 text-yellow-300'
      case 'info': return 'bg-blue-600/20 text-blue-300'
      default: return 'bg-gray-600/20 text-gray-300'
    }
  }

  const getLogStatusIcon = (status) => {
    switch(status) {
      case 'success': return <CheckCircle className="w-3 h-3" />
      case 'failed': 
      case 'error': return <XCircle className="w-3 h-3" />
      case 'warning': return <AlertCircle className="w-3 h-3" />
      case 'info': return <Eye className="w-3 h-3" />
      default: return <Activity className="w-3 h-3" />
    }
  }

  const renderFirstColumn = () => {
    if (selectedUser) {
      return (
        <div className="glass p-6 rounded-xl">
          <div className="flex items-center mb-4">
            <button
              onClick={() => {
                setSelectedUser(null)
                setUserPayments([])
                setUserLogs([])
              }}
              className="mr-3 p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
              disabled={userLoading}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h3 className="text-xl font-semibold text-white">User Details</h3>
            {userLoading && <Loader2 className="w-5 h-5 text-purple-400 animate-spin ml-3" />}
          </div>
          
          {/* Profile Picture */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              {selectedUser.profilePicture ? (
                <img
                  src={selectedUser.profilePicture}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-white/20"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
              ) : null}
              <div className={`w-20 h-20 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center ${selectedUser.profilePicture ? 'hidden' : 'flex'}`}>
                <User className="w-8 h-8 text-white/60" />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white/60 text-sm mb-1">User ID</label>
              <input
                type="text"
                value={selectedUser.id || ''}
                disabled={true}
                className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white focus:border-purple-400 focus:outline-none disabled:opacity-50 font-mono text-sm"
              />
            </div>
            
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
              <label className="block text-white/60 text-sm mb-1">Request Quota</label>
              <input
                type="number"
                value={userForm.amount}
                onChange={(e) => setUserForm({...userForm, amount: parseFloat(e.target.value) || 0})}
                disabled={!isEditing || userLoading}
                className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white focus:border-purple-400 focus:outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-1 flex items-center">
                <Key className="w-4 h-4 mr-1" />
                API Key
              </label>
              <input
                type="text"
                value={userForm.apikey}
                onChange={(e) => setUserForm({...userForm, apikey: e.target.value})}
                disabled={!isEditing || userLoading}
                className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white focus:border-purple-400 focus:outline-none disabled:opacity-50 font-mono text-sm"
                placeholder="Enter API key"
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

            {selectedUser.priceUsd && (
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-white/60 text-sm">Revenue Contribution</p>
                <p className="text-green-400 font-medium">${parseFloat(selectedUser.priceUsd).toFixed(2)}</p>
              </div>
            )}

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
                  onClick={() => handleDeleteClick(selectedUser.id)}
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
    } else {
      return (
        <div className="glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <Users className="w-6 h-6 mr-2" />
              Users ({(dashboardData?.users || []).length})
            </h3>
          </div>
          
          <div className="relative mb-4">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
            <input
              type="text"
              placeholder="Search by name, email, phone, userid, apikey..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-purple-400 focus:outline-none"
            />
            {isSearching && (
              <Loader2 className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 animate-spin" />
            )}
          </div>

          <div className="space-y-2 h-[600px] overflow-y-auto scrollbar-hide">
            {displayUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className="p-3 rounded-lg cursor-pointer transition-colors bg-white/5 hover:bg-white/10 border border-transparent"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt="Profile"
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div className={`w-8 h-8 rounded-full bg-white/10 flex items-center justify-center ${user.profilePicture ? 'hidden' : 'flex'}`}>
                        <User className="w-4 h-4 text-white/60" />
                      </div>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{user.name || 'No name'}</p>
                      <p className="text-green-400 text-xs">Quota: {user.amount || 0}</p>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    user.isActive ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                </div>
              </div>
            ))}
            
            {displayUsers.length === 0 && !isSearching && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">No users found</p>
                {searchTerm && (
                  <p className="text-white/40 text-sm mt-2">Try adjusting your search</p>
                )}
              </div>
            )}

            {isSearching && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-white/40 mx-auto mb-4 animate-spin" />
                <p className="text-white/60">Searching...</p>
              </div>
            )}
          </div>
        </div>
      )
    }
  }

  const userAnalytics = getUserAnalytics()

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
              <p className="text-white/60 text-sm">Payment ID</p>
              <p className="text-white font-medium font-mono text-sm">{selectedPayment.id}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-white/60 text-sm">User</p>
              <p className="text-white font-medium">{selectedPayment.user || selectedPayment.userId || selectedPayment.userName || selectedPayment.email}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-white/60 text-sm">Amount</p>
              <p className="text-white font-medium text-xl">${parseFloat(selectedPayment.priceUsd || selectedPayment.priceUSD || selectedPayment.amount || 0).toFixed(2)}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-white/60 text-sm">Method</p>
              <p className="text-white font-medium capitalize">{selectedPayment.paymentMethod || selectedPayment.method}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-white/60 text-sm">Date</p>
              <p className="text-white font-medium">
                {selectedPayment.date ? new Date(selectedPayment.date).toLocaleString() : 
                 selectedPayment.createdAt ? new Date(selectedPayment.createdAt).toLocaleString() : 
                 new Date().toLocaleString()}
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-white/60 text-sm">Status</p>
              <span className={`px-3 py-1 rounded-full text-sm flex items-center space-x-2 w-fit ${getPaymentStatusColor(selectedPayment.status)}`}>
                {getPaymentStatusIcon(selectedPayment.status)}
                <span>{getPaymentStatusDisplay(selectedPayment.status)}</span>
              </span>
            </div>
            
            {selectedPayment.status === 'pending_verification' && (
              <div className="bg-white/5 p-4 rounded-lg">
                <p className="text-white/60 text-sm mb-3">Update Payment Status</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePaymentStatusChange(selectedPayment, 'success')}
                    disabled={paymentLoading}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {paymentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>Confirm</span>
                  </button>
                  <button
                    onClick={() => handlePaymentStatusChange(selectedPayment, 'failed')}
                    disabled={paymentLoading}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {paymentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="glass p-6 rounded-xl">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <DollarSign className="w-6 h-6 mr-2" />
            {selectedUser ? `${selectedUser.name}'s Payments` : 'All Payments'}
            {paymentLoading && <Loader2 className="w-4 h-4 text-purple-400 animate-spin ml-2" />}
          </h3>
          
          <div className="relative mb-4">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
            <input
              type="text"
              placeholder="Search by payment ID or user ID..."
              value={paymentSearchTerm}
              onChange={(e) => setPaymentSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-purple-400 focus:outline-none"
            />
          </div>

          <div className="flex space-x-1 mb-4">
            {['all', 'success', 'failed', 'awaiting_payment', 'pending_verification'].map((filter) => (
              <button
                key={filter}
                onClick={() => setPaymentFilter(filter)}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                  paymentFilter === filter
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {filter === 'awaiting_payment' ? 'pending' : 
                 filter === 'pending_verification' ? 'verifying' : filter}
              </button>
            ))}
          </div>

          <div className="space-y-2 h-[560px] overflow-y-auto scrollbar-hide">
            {filteredPayments.map((payment) => (
              <div
                key={payment.id}
                onClick={() => setSelectedPayment(payment)}
                className="p-3 rounded-lg cursor-pointer transition-colors bg-white/5 hover:bg-white/10"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium text-sm font-mono">{payment.id}</p>
                    <p className="text-white/60 text-xs">
                      {payment.paymentMethod || payment.method || 'Unknown'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs flex items-center space-x-1 ${getPaymentStatusColor(payment.status)}`}>
                    {getPaymentStatusIcon(payment.status)}
                    <span>{getPaymentStatusDisplay(payment.status)}</span>
                  </span>
                </div>
              </div>
            ))}

            {filteredPayments.length === 0 && !paymentLoading && (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">No payments found</p>
                {paymentSearchTerm && (
                  <p className="text-white/40 text-sm mt-2">Try adjusting your search</p>
                )}
              </div>
            )}

            {paymentLoading && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-white/40 mx-auto mb-4 animate-spin" />
                <p className="text-white/60">Loading payments...</p>
              </div>
            )}
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
            <p className="text-2xl font-bold text-blue-400">
              ${userAnalytics.totalRevenue.toFixed(2)}
            </p>
          </div>
          <div className="bg-white/5 p-4 rounded-lg">
            <p className="text-white/60 text-sm">Total Quota</p>
            <p className="text-2xl font-bold text-purple-400">{userAnalytics.totalQuota}</p>
          </div>
        </div>

        {dashboardData?.serverStatus && (
          <div className="bg-white/5 p-4 rounded-lg mb-6">
            <p className="text-white/60 text-sm">Server Status</p>
            <p className={`text-xl font-bold capitalize ${
              dashboardData.serverStatus === 'online' ? 'text-green-400' : 'text-red-400'
            }`}>
              {dashboardData.serverStatus}
            </p>
          </div>
        )}

        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          {selectedUser ? `${selectedUser.name}'s Recent Logs` : 'Recent Logs'}
          {logLoading && <Loader2 className="w-4 h-4 text-purple-400 animate-spin ml-2" />}
        </h4>
        
        <div className="space-y-2 h-[300px] overflow-y-auto scrollbar-hide">
          {currentLogs.slice(0, 10).map((log, index) => (
            <div key={log.id || index} className="bg-white/5 p-3 rounded-lg">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60 font-mono">
                  {log.createdAt ? new Date(log.createdAt).toLocaleString() : 
                  log.timestamp ? new Date(log.timestamp).toLocaleString() :
                  log.time ? (log.time.includes('T') ? new Date(log.time).toLocaleString() : log.time) :
                  'Unknown time'}
                </span>
                <span className={`px-2 py-1 rounded flex items-center space-x-1 ${getLogStatusColor(log.status)}`}>
                  {getLogStatusIcon(log.status)}
                  <span>{log.status}</span>
                </span>
              </div>
              <p className="text-white/80 text-sm mt-1">
                {log.user || log.userId || log.userName || 'System'}
              </p>
              <p className="text-white text-sm font-medium">
                {log.action || log.type || log.message || 'Unknown action'}
              </p>
              {log.description && (
                <p className="text-white/60 text-xs mt-1">{log.description}</p>
              )}
            </div>
          ))}
        </div>

        {selectedUser && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-white/60 text-xs">User Payments</p>
                <p className="text-lg font-bold text-blue-400">{userPayments.length}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-white/60 text-xs">User Logs</p>
                <p className="text-lg font-bold text-purple-400">{userLogs.length}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete User Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="glass p-6 rounded-xl max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Delete User
              </h3>
              <p className="text-white/70 mb-6">
                Are you sure you want to delete this user? This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setUserToDelete(null)
                  }}
                  className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteUser(userToDelete)}
                  disabled={userLoading}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {userLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
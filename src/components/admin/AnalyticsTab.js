// src/components/admin/AnalyticsTab.js

'use client'
import { useState, useEffect } from 'react'
import { BarChart3, Users, DollarSign, TrendingUp, TrendingDown, CreditCard, CheckCircle, Phone, Mail, Zap, Activity, Loader2, AlertCircle } from 'lucide-react'
import { analyticsTabService } from '../../services/admin/analyticsTabService'

export default function AnalyticsTab({ dashboardData, onShowSnackbar }) {
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false)
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState('7days')
  const [payments, setPayments] = useState([])
  const [requests, setRequests] = useState([])
  const [analyticsUsers, setAnalyticsUsers] = useState([])
  const [systemStats, setSystemStats] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAnalyticsData()
  }, [analyticsTimeframe])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [paymentsResult, requestsResult, usersResult, systemResult] = await Promise.all([
        analyticsTabService.getPaymentAnalytics(analyticsTimeframe),
        analyticsTabService.getRequestAnalytics(analyticsTimeframe),
        analyticsTabService.getUserStats(analyticsTimeframe),
        analyticsTabService.getSystemStats(analyticsTimeframe)
      ])
      
      if (paymentsResult.success) {
        setPayments(paymentsResult.data)
      } else {
        console.error('Failed to load payment analytics')
      }
      
      if (requestsResult.success) {
        setRequests(requestsResult.data)
      } else {
        console.error('Failed to load request analytics')
      }
      
      if (usersResult.success) {
        setAnalyticsUsers(usersResult.data)
      } else {
        console.error('Failed to load user analytics')
      }
      
      if (systemResult.success) {
        setSystemStats(systemResult.data)
      } else {
        console.error('Failed to load system stats')
      }
      
    } catch (error) {
      console.error('Failed to load analytics:', error)
      setError(error.message)
      onShowSnackbar && onShowSnackbar(`Failed to load analytics: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Add this function to handle custom date selection
  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      setAnalyticsTimeframe(`custom_${customStartDate}_${customEndDate}`)
      setShowCustomDatePicker(false)
      // loadAnalyticsData will be triggered by useEffect
    }
  }

  // Add this function to reset custom dates
  const resetCustomDates = () => {
    setCustomStartDate('')
    setCustomEndDate('')
    setShowCustomDatePicker(false)
  }


  const getUserAnalytics = () => {
    // Use current dashboard data for overall stats, analytics users for timeframe-specific data
    const totalUsers = dashboardData?.users?.length || 0
    const activeUsers = dashboardData?.users?.filter(u => u.isActive !== false).length || 0
    const inactiveUsers = totalUsers - activeUsers
    
    // Calculate plans from current dashboard data
    const allUsers = dashboardData?.users || []
    const plans = {
      free: allUsers.filter(u => (u.amount || 0) <= 100).length,
      premium: allUsers.filter(u => (u.amount || 0) > 100 && (u.amount || 0) <= 500).length,
      pro: allUsers.filter(u => (u.amount || 0) > 500 && (u.amount || 0) <= 1000).length,
      enterprise: allUsers.filter(u => (u.amount || 0) > 1000).length
    }
    
    // New users in selected timeframe
    const newUsers = analyticsUsers.length
    
    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      newUsers,
      paidUsers: totalUsers - plans.free,
      freeUsers: plans.free,
      plans
    }
  }

  const getPaymentAnalytics = () => {
    const totalPayments = payments.length
    const successfulPayments = payments.filter(p => p.status === 'success').length
    const failedPayments = payments.filter(p => p.status === 'failed').length
    const pendingPayments = payments.filter(p => p.status === 'awaiting_payment').length
    const verifyingPayments = payments.filter(p => p.status === 'pending_verification').length
    
    // Calculate total earnings from successful payments
    const totalEarnings = payments
      .filter(p => p.status === 'success')
      .reduce((sum, p) => {
        const amount = parseFloat(p.priceUSD || p.priceUsd || p.amount || 0)
        return sum + amount
      }, 0)
    
    // Count payment methods - removed card and paypal
    const methods = {
      bank: payments.filter(p => 
        (p.paymentMethod || p.method || '').toLowerCase().includes('bank') ||
        (p.paymentMethod || p.method || '').toLowerCase().includes('transfer')
      ).length,
      coinbase: payments.filter(p => 
        (p.paymentMethod || p.method || '').toLowerCase().includes('coinbase') ||
        (p.paymentMethod || p.method || '').toLowerCase().includes('crypto')
      ).length
    }
    
    return {
      totalPayments,
      successfulPayments,
      failedPayments,
      pendingPayments,
      verifyingPayments,
      totalEarnings,
      methods,
      successRate: totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0
    }
  }

  const getRequestAnalytics = () => {
    const totalRequests = requests.length
    const successfulRequests = requests.filter(r => r.status === 'Success').length
    const failedRequests = requests.filter(r => r.status === 'Failed' || r.status === 'error').length
    
    // Count request types - updated to include direct sms, direct email, email otp, sms otp
    const types = {
      sms_otp: requests.filter(r => {
        const type = (r.type || '').toUpperCase()
        return type === 'OTP'
      }).length,
      email_otp: requests.filter(r => {
        const type = (r.type || '').toUpperCase()
        return type === 'EMAIL_OTP'
      }).length,
      direct_sms: requests.filter(r => {
        const type = (r.type || '').toUpperCase()
        return type === 'SMS'
      }).length,
      direct_email: requests.filter(r => {
        const type = (r.type || '').toUpperCase()
        return type === 'EMAIL'
      }).length,
      otp_verify: requests.filter(r => {
        const type = (r.type || '').toUpperCase()
        return type === 'OTP_VERIFY' || type === 'EMAIL_OTP_VERIFY'
      }).length
    }
    
    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      types,
      successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0
    }
  }

  const getTimeframeLabel = () => {
    if (analyticsTimeframe.startsWith('custom_')) {
      const [, startDate, endDate] = analyticsTimeframe.split('_')
      return `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
    }
    
    switch(analyticsTimeframe) {
      case '1hour': return 'Last Hour'
      case '24hours': return 'Last 24 Hours'
      case '7days': return 'Last 7 Days'
      case '30days': return 'Last 30 Days'
      case '365days': return 'Last Year'
      case 'alltime': return 'All Time'
      default: return 'Selected Period'
    }
  }

  const userAnalytics = getUserAnalytics()
  const paymentAnalytics = getPaymentAnalytics()
  const requestAnalytics = getRequestAnalytics()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      
      {/* Time Filter Section */}
      <div className="glass p-6 rounded-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
              <BarChart3 className="w-7 h-7 mr-3" />
              Analytics Dashboard
            </h2>
            <p className="text-white/60">
              Data for: <span className="text-purple-400 font-medium">{getTimeframeLabel()}</span>
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Time Filters */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: '1hour', label: 'Hour' },
                { key: '24hours', label: '24h' },
                { key: '7days', label: '7d' },
                { key: '30days', label: '30d' },
                { key: '365days', label: 'Year' },
                { key: 'alltime', label: 'All' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setAnalyticsTimeframe(key)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    analyticsTimeframe === key
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            
            {/* Custom Date Range Button */}
            <button
              onClick={() => setShowCustomDatePicker(!showCustomDatePicker)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                analyticsTimeframe.startsWith('custom_')
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
              }`}
            >
              <span>Custom</span>
              <svg className={`w-4 h-4 transition-transform ${showCustomDatePicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Refresh Button */}
            <button
              onClick={loadAnalyticsData}
              disabled={loading}
              className="px-4 py-2 bg-purple-600/50 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
        
        {/* Custom Date Picker */}
        {showCustomDatePicker && (
          <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex flex-col sm:flex-row items-end gap-4">
              <div className="flex-1">
                <label className="block text-white/70 text-sm mb-2">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full bg-white/10 text-white rounded-lg px-3 py-2 border border-white/20 focus:border-purple-400 focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-white/70 text-sm mb-2">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full bg-white/10 text-white rounded-lg px-3 py-2 border border-white/20 focus:border-purple-400 focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCustomDateApply}
                  disabled={!customStartDate || !customEndDate}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
                <button
                  onClick={resetCustomDates}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* User Analytics */}
        <div className="glass p-6 rounded-xl">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Users className="w-6 h-6 mr-2" />
            User Analytics
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-white/60 text-sm">Total Users</p>
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-white">{userAnalytics.totalUsers}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-white/60 text-sm">Active Users</p>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
                <p className="text-2xl font-bold text-green-400">{userAnalytics.activeUsers}</p>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-white/60 text-sm">New Users ({getTimeframeLabel()})</p>
              <p className="text-3xl font-bold text-purple-400">{userAnalytics.newUsers}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-lg">
                <p className="text-white/60 text-sm">Paid Users</p>
                <p className="text-2xl font-bold text-purple-400">{userAnalytics.paidUsers}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg">
                <p className="text-white/60 text-sm">Free Users</p>
                <p className="text-2xl font-bold text-blue-400">{userAnalytics.freeUsers}</p>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-white/60 text-sm mb-3">Plans Distribution</p>
              <div className="space-y-2">
                {Object.entries(userAnalytics.plans).map(([plan, count]) => (
                  <div key={plan} className="flex items-center justify-between">
                    <span className="text-white/80 text-sm capitalize">{plan}</span>
                    <span className="text-white font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Analytics */}
        <div className="glass p-6 rounded-xl">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <DollarSign className="w-6 h-6 mr-2" />
            Payment Analytics
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-white/60 text-sm">Total Payments</p>
                  <CreditCard className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-white">{paymentAnalytics.totalPayments}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-white/60 text-sm">Success Rate</p>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-green-400">
                  {paymentAnalytics.successRate.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-white/60 text-sm">Total Earnings ({getTimeframeLabel()})</p>
              <p className="text-3xl font-bold text-purple-400">${paymentAnalytics.totalEarnings.toFixed(2)}</p>
            </div>

            <div className="space-y-3">
              {/* First row - 2 columns */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 p-3 rounded-lg">
                  <p className="text-white/60 text-xs">Success</p>
                  <p className="text-lg font-bold text-green-400">{paymentAnalytics.successfulPayments}</p>
                </div>
                <div className="bg-white/5 p-3 rounded-lg">
                  <p className="text-white/60 text-xs">Failed</p>
                  <p className="text-lg font-bold text-red-400">{paymentAnalytics.failedPayments}</p>
                </div>
              </div>
              
              {/* Second row - 2 columns */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 p-3 rounded-lg">
                  <p className="text-white/60 text-xs">Pending</p>
                  <p className="text-lg font-bold text-yellow-400">{paymentAnalytics.pendingPayments}</p>
                </div>
                <div className="bg-white/5 p-3 rounded-lg">
                  <p className="text-white/60 text-xs">Verifying</p>
                  <p className="text-lg font-bold text-orange-400">{paymentAnalytics.verifyingPayments}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-white/60 text-sm mb-3">Payment Methods</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">Bank Transfer</span>
                  <span className="text-white font-medium">{paymentAnalytics.methods.bank}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">Coinbase</span>
                  <span className="text-white font-medium">{paymentAnalytics.methods.coinbase}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Request Analytics */}
        <div className="glass p-6 rounded-xl">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Zap className="w-6 h-6 mr-2" />
            Request Analytics
          </h3>
          
          <div className="space-y-4">
            <div className="bg-white/5 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-white/60 text-sm">Total Requests</p>
                <Activity className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">{requestAnalytics.totalRequests}</p>
            </div>

            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-white/60 text-sm">Success Rate</p>
              <p className="text-3xl font-bold text-purple-400">
                {requestAnalytics.successRate.toFixed(1)}%
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-white/60 text-xs">Success</p>
                <p className="text-lg font-bold text-green-400">{requestAnalytics.successfulRequests}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-white/60 text-xs">Failed</p>
                <p className="text-lg font-bold text-red-400">{requestAnalytics.failedRequests}</p>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-white/60 text-sm mb-3">Request Types</p>
              <div className="space-y-1.5"> {/* Slightly more space between rows */}
                <div className="flex items-center justify-between py-1"> {/* More vertical padding */}
                  <div className="flex items-center space-x-1.5"> {/* More horizontal spacing */}
                    <Phone className="w-3.5 h-3.5 text-blue-400" /> {/* Slightly bigger icon */}
                    <span className="text-white/80 text-xs leading-tight">SMS OTP</span> {/* Slightly bigger font, tighter line-height */}
                  </div>
                  <span className="text-white font-medium text-xs leading-tight">{requestAnalytics.types.sms_otp}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-white/80 text-xs leading-tight">Email OTP</span>
                  </div>
                  <span className="text-white font-medium text-xs leading-tight">{requestAnalytics.types.email_otp}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-white/80 text-xs leading-tight">Direct SMS</span>
                  </div>
                  <span className="text-white font-medium text-xs leading-tight">{requestAnalytics.types.direct_sms}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-white/80 text-xs leading-tight">Direct Email</span>
                  </div>
                  <span className="text-white font-medium text-xs leading-tight">{requestAnalytics.types.direct_email}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-white/80 text-xs leading-tight">Verify</span>
                  </div>
                  <span className="text-white font-medium text-xs leading-tight">{requestAnalytics.types.otp_verify}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Empty State */}
      {payments.length === 0 && requests.length === 0 && !loading && (
        <div className="glass p-12 rounded-xl text-center">
          <BarChart3 className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Analytics Data</h3>
          <p className="text-white/60 mb-4">
            No data available for {getTimeframeLabel().toLowerCase()}. 
            Try selecting a different time period or check back later.
          </p>
          <button
            onClick={loadAnalyticsData}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      )}
    </div>
  )
}
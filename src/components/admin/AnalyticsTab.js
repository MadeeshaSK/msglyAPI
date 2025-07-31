// src/components/admin/AnalyticsTab.js

'use client'
import { useState, useEffect } from 'react'
import { BarChart3, Users, DollarSign, TrendingUp, TrendingDown, CreditCard, CheckCircle, Phone, Mail, Zap, Activity } from 'lucide-react'
import { analyticsTabService } from '../../services/admin/analyticsTabService'

export default function AnalyticsTab({ dashboardData }) {
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState('7days')
  const [payments, setPayments] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadAnalyticsData()
  }, [analyticsTimeframe])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      const [paymentsResult, requestsResult] = await Promise.all([
        analyticsTabService.getPaymentAnalytics(analyticsTimeframe),
        analyticsTabService.getRequestAnalytics(analyticsTimeframe)
      ])
      
      if (paymentsResult.success) {
        setPayments(paymentsResult.data)
      }
      if (requestsResult.success) {
        setRequests(requestsResult.data)
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUserAnalytics = (timeframe) => {
    const totalUsers = dashboardData.users.length
    const activeUsers = dashboardData.users.filter(u => u.isActive).length
    const inactiveUsers = dashboardData.users.filter(u => !u.isActive).length
    
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

  const getPaymentAnalytics = (timeframe) => {
    const totalPayments = payments.length
    const successfulPayments = payments.filter(p => p.status === 'success').length
    const failedPayments = payments.filter(p => p.status === 'failed').length
    const totalEarnings = payments.filter(p => p.status === 'success').reduce((sum, p) => sum + p.amount, 0)
    
    return {
      totalPayments,
      successfulPayments,
      failedPayments,
      totalEarnings,
      methods: {
        card: payments.filter(p => p.method === 'Card').length,
        bank: payments.filter(p => p.method === 'Bank').length,
        paypal: payments.filter(p => p.method === 'PayPal').length,
        coinbase: payments.filter(p => p.method === 'Coinbase').length
      }
    }
  }

  const getRequestAnalytics = (timeframe) => {
    const totalRequests = requests.length
    const successfulRequests = requests.filter(r => r.status === 'success').length
    const failedRequests = requests.filter(r => r.status === 'failed').length
    
    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      types: {
        sms_otp: requests.filter(r => r.type === 'sms_otp').length,
        email_otp: requests.filter(r => r.type === 'email_otp').length,
        phone_call: requests.filter(r => r.type === 'phone_call').length,
        direct_email: requests.filter(r => r.type === 'direct_email').length
      }
    }
  }

  const userAnalytics = getUserAnalytics(analyticsTimeframe)
  const paymentAnalytics = getPaymentAnalytics(analyticsTimeframe)
  const requestAnalytics = getRequestAnalytics(analyticsTimeframe)

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="glass p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Users className="w-6 h-6 mr-2" />
            User Analytics
          </h3>
          <select
            value={analyticsTimeframe}
            onChange={(e) => setAnalyticsTimeframe(e.target.value)}
            className="px-3 py-1 bg-white/10 border border-white/30 rounded-lg text-white text-sm focus:border-purple-400 focus:outline-none"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
        </div>
        
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
                {paymentAnalytics.totalPayments > 0 ? Math.round((paymentAnalytics.successfulPayments / paymentAnalytics.totalPayments) * 100) : 0}%
              </p>
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-lg">
            <p className="text-white/60 text-sm">Total Earnings</p>
            <p className="text-3xl font-bold text-purple-400">${paymentAnalytics.totalEarnings.toFixed(2)}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-white/60 text-sm">Successful</p>
              <p className="text-2xl font-bold text-green-400">{paymentAnalytics.successfulPayments}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-white/60 text-sm">Failed</p>
              <p className="text-2xl font-bold text-red-400">{paymentAnalytics.failedPayments}</p>
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-lg">
            <p className="text-white/60 text-sm mb-3">Payment Methods</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Card</span>
                <span className="text-white font-medium">{paymentAnalytics.methods.card}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Bank Transfer</span>
                <span className="text-white font-medium">{paymentAnalytics.methods.bank}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">PayPal</span>
                <span className="text-white font-medium">{paymentAnalytics.methods.paypal}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Coinbase</span>
                <span className="text-white font-medium">{paymentAnalytics.methods.coinbase}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Zap className="w-6 h-6 mr-2" />
          Request Analytics
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white/5 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-white/60 text-sm">Total Requests</p>
                <Activity className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">{requestAnalytics.totalRequests}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-white/60 text-sm">Successful</p>
              <p className="text-2xl font-bold text-green-400">{requestAnalytics.successfulRequests}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-white/60 text-sm">Failed</p>
              <p className="text-2xl font-bold text-red-400">{requestAnalytics.failedRequests}</p>
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-lg">
            <p className="text-white/60 text-sm">Success Rate</p>
            <p className="text-3xl font-bold text-purple-400">
              {requestAnalytics.totalRequests > 0 ? Math.round((requestAnalytics.successfulRequests / requestAnalytics.totalRequests) * 100) : 0}%
            </p>
          </div>

          <div className="bg-white/5 p-4 rounded-lg">
            <p className="text-white/60 text-sm mb-3">Request Types</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-blue-400" />
                  <span className="text-white/80 text-sm">SMS OTP</span>
                </div>
                <span className="text-white font-medium">{requestAnalytics.types.sms_otp}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-green-400" />
                  <span className="text-white/80 text-sm">Email OTP</span>
                </div>
                <span className="text-white font-medium">{requestAnalytics.types.email_otp}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-purple-400" />
                  <span className="text-white/80 text-sm">Phone Call</span>
                </div>
                <span className="text-white font-medium">{requestAnalytics.types.phone_call}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-yellow-400" />
                  <span className="text-white/80 text-sm">Direct Email</span>
                </div>
                <span className="text-white font-medium">{requestAnalytics.types.direct_email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'
import { useState, useEffect } from 'react'
import { Users, Settings, User, X, Home, BarChart3, MessageSquare, Bell, Loader2, AlertCircle } from 'lucide-react'
import { adminDashboardService } from '../services/adminDashboardService'
import HomeTab from './admin/HomeTab'
import AnalyticsTab from './admin/AnalyticsTab'
import ChatsTab from './admin/ChatsTab'
import NotificationsTab from './admin/NotificationsTab'

export default function AdminDashboard({ user = { name: 'Admin User' }, onLogout = () => {} }) {
  const [showSidebar, setShowSidebar] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState({
    users: [],
    usersPagination: {},
    serverStatus: 'online',
    stats: {}
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await adminDashboardService.getDashboardData()
      
      if (result.success) {
        setDashboardData(result.data)
      }
    } catch (error) {
      setError(error.message)
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getServerStatusColor = () => {
    switch(dashboardData.serverStatus) {
      case 'online': return 'text-green-400'
      case 'offline': return 'text-red-400'
      case 'maintenance': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error && dashboardData.users.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white text-lg mb-4">Failed to load dashboard</p>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const renderActiveTab = () => {
    switch(activeTab) {
      case 'home':
        return <HomeTab dashboardData={dashboardData} onRefresh={loadDashboardData} />
      case 'analysis':
        return <AnalyticsTab dashboardData={dashboardData} />
      case 'chats':
        return <ChatsTab />
      case 'notifications':
        return <NotificationsTab dashboardData={dashboardData} />
      default:
        return <HomeTab dashboardData={dashboardData} onRefresh={loadDashboardData} />
    }
  }

  const Sidebar = ({ user, onClose, onLogout }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
      <div className="w-80 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 h-full p-6 glass">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Admin Menu</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white/5 p-4 rounded-lg">
            <p className="text-white/60 text-sm">Logged in as</p>
            <p className="text-white font-medium">{user.name}</p>
          </div>

          <div className="bg-white/5 p-4 rounded-lg">
            <p className="text-white/60 text-sm">API Configuration</p>
            <p className="text-white/80 text-xs">Base URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}</p>
            <p className="text-white/80 text-xs">API Key: {process.env.NEXT_PUBLIC_ADMIN_API_KEY ? '••••••••' : 'Not configured'}</p>
          </div>

          <button
            onClick={loadDashboardData}
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Refresh Data
          </button>
          
          <button
            onClick={onLogout}
            className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      <header className="glass border-b border-white/10">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">
              msgly<span className="text-purple-400">API</span>
            </h1>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${dashboardData.serverStatus === 'offline' ? 'bg-red-500' : dashboardData.serverStatus === 'maintenance' ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`}></div>
              <span className={`text-sm font-medium ${getServerStatusColor()}`}>
                Server {dashboardData.serverStatus === 'online' ? 'Online' : dashboardData.serverStatus === 'offline' ? 'Offline' : 'Maintenance'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-white font-bold text-lg">
              Admin<span className="text-purple-400">Panel</span>
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

        {renderActiveTab()}
      </div>

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
// src/app/page.js

'use client'
import { useState } from 'react'
import LandingPage from '../components/LandingPage'
import UserDashboard from '../components/UserDashboard'
import AdminDashboard from '../components/AdminDashboard'
import { logout } from '../services/authService'

export default function Home() {
  const [currentView, setCurrentView] = useState('landing')
  const [user, setUser] = useState(null)

  const handleLogin = (userData) => {
    setUser(userData)
    
    // Role-based routing
    if (userData.role === 'admin') {
      setCurrentView('admin')
    } else {
      setCurrentView('dashboard') // Default for 'user' role
    }
  }

  const handleLogout = async () => {
    try {
      // Only call Firebase logout if user has firebaseUid
      if (user?.firebaseUid) {
        await logout()
      }
      
      setUser(null)
      setCurrentView('landing')
    } catch (error) {
      console.error('Logout error:', error)
      // Force logout even if Firebase logout fails
      setUser(null)
      setCurrentView('landing')
    }
  }

  // Show appropriate view based on current state
  if (currentView === 'landing') {
    return <LandingPage onLogin={handleLogin} />
  }

  if (currentView === 'admin' && user?.role === 'admin') {
    return <AdminDashboard user={user} onLogout={handleLogout} />
  }

  if (currentView === 'dashboard' && user) {
    return <UserDashboard user={user} onLogout={handleLogout} />
  }

  // Fallback to landing page
  return <LandingPage onLogin={handleLogin} />
}
// src/app/page.js 

'use client'
import { useState, useEffect } from 'react'
import LandingPage from '../components/LandingPage'
import UserDashboard from '../components/UserDashboard'
import AdminDashboard from '../components/AdminDashboard'
import { logout } from '../services/authService'
import { validateSession, storeSession, getStoredSession, clearSession } from '../services/sessionService'

export default function Home() {
  const [currentView, setCurrentView] = useState('loading') 
  const [user, setUser] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Restore session on component mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedSession = getStoredSession()
        
        if (storedSession) {
          const { user: storedUser, view: storedView } = storedSession
          
          if (storedUser.apiKey && storedUser.name && storedUser.role) {
            
            const isValid = await validateSession(storedUser)
            
            if (isValid) {
              setUser(storedUser)
              setCurrentView(storedView)
            } else {
              clearSession()
              setCurrentView('landing')
            }
          } else {
            clearSession()
            setCurrentView('landing')
          }
        } else {
          setCurrentView('landing')
        }
      } catch (error) {
        clearSession()
        setCurrentView('landing')
      } finally {
        setIsInitialized(true)
      }
    }

    restoreSession()
  }, [])

  // Save session data whenever user or view changes
  useEffect(() => {
    if (isInitialized) {
      if (user && currentView !== 'loading') {
        storeSession(user, currentView)
      } else if (!user && currentView === 'landing') {
        clearSession()
      }
    }
  }, [user, currentView, isInitialized])

  const handleLogin = (userData) => {
    setUser(userData)
    
    // Role-based routing
    if (userData.role === 'admin') {
      setCurrentView('admin')
    } else {
      setCurrentView('dashboard') // Default for 'user' role
    }
  }

  // Handle logout and clear session
  const handleLogout = async () => {
    try {
      
      if (user?.firebaseUid) {
        await logout()
      }
      
      clearSession()
      
      setUser(null)
      setCurrentView('landing')
      
    } catch (error) {
      clearSession()
      setUser(null)
      setCurrentView('landing')
    }
  }

  // Show loading spinner while initializing
  if (!isInitialized || currentView === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60 text-lg">Loading msglyAPI...</p>
          <p className="text-white/40 text-sm mt-2">Checking session...</p>
        </div>
      </div>
    )
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

  // Fallback to landing page if something goes wrong
  return <LandingPage onLogin={handleLogin} />
}
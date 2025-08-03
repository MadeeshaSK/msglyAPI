// src/components/admin/ChatsTab.js

'use client'
import { useState, useEffect } from 'react'
import { MessageSquare, ExternalLink, RefreshCw, Maximize2, Minimize2 } from 'lucide-react'

export default function ChatsTab() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [dashboardUrl, setDashboardUrl] = useState('')

  useEffect(() => {
    setDashboardUrl('https://dashboard.tawk.to/#/dashboard/6881ec521786aa1911e717af')
  }, [])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const openInNewTab = () => {
    if (dashboardUrl) {
      window.open(dashboardUrl, '_blank')
    }
  }

  const refreshDashboard = () => {
    const iframe = document.getElementById('tawk-dashboard-iframe')
    if (iframe && dashboardUrl) {
      iframe.src = iframe.src
    }
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900 p-4' : ''}`}>
      {/* Main Chat Dashboard */}
      <div className="glass p-6 rounded-xl h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <MessageSquare className="w-6 h-6 mr-2" />
            Live Chat Dashboard
            <span className="ml-2 px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
              Tawk.to
            </span>
          </h3>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshDashboard}
              className="p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
              title="Refresh dashboard"
              disabled={!dashboardUrl}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            
            <button
              onClick={openInNewTab}
              className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              title="Open in new tab"
              disabled={!dashboardUrl}
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Dashboard */}
        <div className={`bg-white rounded-lg overflow-hidden shadow-xl ${
          isFullscreen ? 'h-[calc(100vh-160px)]' : 'h-[600px]'
        }`}>
          {dashboardUrl ? (
            <div className="h-full relative">
              <iframe
                id="tawk-dashboard-iframe"
                src={dashboardUrl}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                title="Tawk.to Chat Dashboard"
                allow="microphone; camera; clipboard-read; clipboard-write"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation allow-storage-access-by-user-activation"
                referrerPolicy="strict-origin-when-cross-origin"
              />
              
              {/* Simple fallback overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="bg-white rounded-lg p-6 text-center pointer-events-auto">
                  <h4 className="text-lg font-semibold mb-3 text-gray-800">Can't login?</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => window.open(dashboardUrl, '_blank', 'width=1200,height=800')}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Open in Popup Window
                    </button>
                    <button
                      onClick={() => window.open(dashboardUrl, '_blank')}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Open in New Tab
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
                <p className="text-gray-500">Loading dashboard...</p>
              </div>
            </div>
          )}
        </div>

        {/* Fullscreen mode info */}
        {isFullscreen && (
          <div className="mt-4 text-center">
            <p className="text-white/60 text-sm">
              Press ESC or click the minimize button to exit fullscreen mode
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
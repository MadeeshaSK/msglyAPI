// src/components/admin/ChatsTab.js

'use client'
import { useState, useEffect } from 'react'
import { MessageSquare, ExternalLink, RefreshCw, Maximize2, Minimize2, Key, Info, Globe } from 'lucide-react'

export default function ChatsTabWithProxy() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [dashboardUrl, setDashboardUrl] = useState('')
  const [showLoginHelp, setShowLoginHelp] = useState(false)
  const [embedMethod, setEmbedMethod] = useState('proxy')
  const [proxyStatus, setProxyStatus] = useState('loading') // loading, success, error

  useEffect(() => {
    // Use proxy URL instead of direct Tawk.to URL
    const tawkPath = '/#/dashboard/6881ec521786aa1911e717af'
    setDashboardUrl(`/api/proxy-tawk?path=${encodeURIComponent(tawkPath)}`)
    
    // Test proxy connectivity
    testProxyConnection()
  }, [])

  const testProxyConnection = async () => {
    try {
      const response = await fetch('/api/proxy-tawk?path=/', {
        method: 'GET',
        headers: {
          'Accept': 'text/html'
        }
      })
      
      if (response.ok) {
        setProxyStatus('success')
      } else {
        setProxyStatus('error')
      }
    } catch (error) {
      console.error('Proxy test failed:', error)
      setProxyStatus('error')
    }
  }

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
    testProxyConnection()
  }

  const openTawkDirectly = () => {
    window.open('https://dashboard.tawk.to/', '_blank')
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900 p-4' : ''}`}>
      <div className="glass p-6 rounded-xl h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <MessageSquare className="w-6 h-6 mr-2" />
            Live Chat Dashboard
            <span className="ml-2 px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
              Proxy Mode
            </span>
            <div className={`ml-2 w-2 h-2 rounded-full ${
              proxyStatus === 'success' ? 'bg-green-400' :
              proxyStatus === 'error' ? 'bg-red-400' :
              'bg-yellow-400 animate-pulse'
            }`} title={`Proxy status: ${proxyStatus}`} />
          </h3>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowLoginHelp(!showLoginHelp)}
              className="p-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition-colors"
              title="Proxy help"
            >
              <Info className="w-4 h-4" />
            </button>
            
            <button
              onClick={openTawkDirectly}
              className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              title="Open Tawk.to directly"
            >
              <Key className="w-4 h-4" />
            </button>
            
            <button
              onClick={refreshDashboard}
              className="p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
              title="Refresh dashboard"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            
            <button
              onClick={openInNewTab}
              className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              title="Open in new tab"
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

        {/* Proxy Help Panel */}
        {showLoginHelp && !isFullscreen && (
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <Globe className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-blue-200 font-medium mb-2">Server-Side Proxy Method</h4>
                <div className="space-y-2 text-blue-200/90 text-sm">
                  <p><strong>✅ Bypasses:</strong> CORS, X-Frame-Options, CSP restrictions</p>
                  <p><strong>🔄 How it works:</strong> Your server fetches Tawk.to content and serves it</p>
                  <p><strong>🍪 Sessions:</strong> Cookies are forwarded to maintain login state</p>
                  <p><strong>⚡ Status:</strong> 
                    <span className={`ml-1 ${
                      proxyStatus === 'success' ? 'text-green-300' :
                      proxyStatus === 'error' ? 'text-red-300' :
                      'text-yellow-300'
                    }`}>
                      {proxyStatus.toUpperCase()}
                    </span>
                  </p>
                </div>
                
                {proxyStatus === 'error' && (
                  <div className="mt-3 p-2 bg-red-500/20 rounded text-red-200 text-xs">
                    Proxy connection failed. Check server logs or try direct access.
                  </div>
                )}
                
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setShowLoginHelp(false)}
                    className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Proxied Dashboard */}
        <div className={`bg-white rounded-lg overflow-hidden shadow-xl ${
          isFullscreen ? 'h-[calc(100vh-160px)]' : 'h-[600px]'
        }`}>
          {proxyStatus === 'loading' ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
                <p className="text-gray-500">Testing proxy connection...</p>
              </div>
            </div>
          ) : proxyStatus === 'error' ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Globe className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Proxy Error</h3>
                <p className="text-gray-600 mb-4">Unable to connect to proxy server</p>
                <div className="space-x-2">
                  <button
                    onClick={testProxyConnection}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Retry Connection
                  </button>
                  <button
                    onClick={openTawkDirectly}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Open Direct
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <iframe
              id="tawk-dashboard-iframe"
              src={dashboardUrl}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              title="Tawk.to Chat Dashboard (Proxied)"
              allow="microphone; camera; clipboard-read; clipboard-write"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          )}
        </div>

        {isFullscreen && (
          <div className="mt-4 text-center">
            <p className="text-white/60 text-sm">
              Press ESC or click minimize to exit fullscreen • Proxy Mode Active
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
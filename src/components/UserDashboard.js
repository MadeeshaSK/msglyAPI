'use client'
import { useState } from 'react'
import { User, Key, CreditCard, Activity, Send, RotateCcw, Shield, Settings, LogOut, X } from 'lucide-react'
import Sidebar from './Sidebar'

export default function UserDashboard({ user, onLogout }) {
  const [showSidebar, setShowSidebar] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [message, setMessage] = useState('')
  const [otpCode, setOtpCode] = useState('')

  // Mock data
  const [userStats] = useState({
    apiKey: user.apiKey,
    requestQuota: 1000,
    usedQuota: 247,
    validity: '2024-12-31',
    balance: 85.50
  })

  const [logs] = useState([
    { id: 1, time: '2024-01-15 14:30:22', type: 'SMS', number: '+1234567890', status: 'Success', message: 'Welcome to our service!' },
    { id: 2, time: '2024-01-15 14:25:15', type: 'OTP', number: '+1234567891', status: 'Success', message: 'Verification code sent' },
    { id: 3, time: '2024-01-15 14:20:10', type: 'SMS', number: '+1234567892', status: 'Failed', message: 'Invalid number format' },
    { id: 4, time: '2024-01-15 14:15:05', type: 'OTP', number: '+1234567893', status: 'Success', message: 'OTP verified successfully' }
  ])

  const sendDirectMessage = async () => {
    if (!phoneNumber || !message) {
      alert('Please enter both phone number and message')
      return
    }

    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: user.apiKey,
          phone: phoneNumber,
          message: message,
          type: 'SMS'
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        alert(`Message sent successfully to ${phoneNumber}`)
        setPhoneNumber('')
        setMessage('')
        // Refresh logs or add to logs state
      } else {
        alert(`Failed to send message: ${data.error}`)
      }
    } catch (error) {
      alert(`Error sending message: ${error.message}`)
    }
  }

  const sendOTP = async () => {
    if (!phoneNumber) {
      alert('Please enter phone number')
      return
    }

    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: user.apiKey,
          phone: phoneNumber
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        alert(`OTP sent to ${phoneNumber}. Code: ${data.otp}`)
      } else {
        alert(`Failed to send OTP: ${data.error}`)
      }
    } catch (error) {
      alert(`Error sending OTP: ${error.message}`)
    }
  }

  const verifyOTP = async () => {
    if (!phoneNumber || !otpCode) {
      alert('Please enter both phone number and OTP code')
      return
    }

    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: user.apiKey,
          phone: phoneNumber,
          otp: otpCode
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        alert(`OTP verified successfully for ${phoneNumber}`)
        setOtpCode('')
      } else {
        alert(`OTP verification failed: ${data.error}`)
      }
    } catch (error) {
      alert(`Error verifying OTP: ${error.message}`)
    }
  }

  const copyApiKey = () => {
    navigator.clipboard.writeText(userStats.apiKey)
    alert('API Key copied to clipboard!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="glass border-b border-white/10">
        <div className="px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">
            API<span className="text-blue-400">Dashboard</span>
          </h1>
          
          <div className="flex items-center space-x-4">
            <div className="text-white/80 text-sm">
              Welcome, <span className="text-white font-medium">{user.name}</span>
            </div>
            <button
              onClick={() => setShowSidebar(true)}
              className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="glass p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-white/60 text-sm">API Key</p>
                <p className="text-white font-mono text-sm cursor-pointer hover:text-blue-300" 
                   onClick={copyApiKey}
                   title="Click to copy">
                  {userStats.apiKey.substring(0, 20)}...
                </p>
              </div>
              <Key className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="glass p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Quota Usage</p>
                <p className="text-white text-2xl font-bold">{userStats.usedQuota}/{userStats.requestQuota}</p>
                <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-400 h-2 rounded-full" 
                    style={{ width: `${(userStats.usedQuota / userStats.requestQuota) * 100}%` }}
                  ></div>
                </div>
              </div>
              <Activity className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="glass p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Valid Until</p>
                <p className="text-white text-lg font-semibold">{userStats.validity}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="glass p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Balance</p>
                <p className="text-white text-2xl font-bold">${userStats.balance}</p>
              </div>
              <CreditCard className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Buy Quota</span>
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>View Analytics</span>
          </button>
          <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>API Settings</span>
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Message Simulator */}
          <div className="glass p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-6">Message Simulator</h3>
            
            <div className="space-y-4">
              <input
                type="tel"
                placeholder="Phone Number (+1234567890)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-blue-400 focus:outline-none"
              />

              <textarea
                placeholder="Your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-blue-400 focus:outline-none resize-none"
              />

              <button
                onClick={sendDirectMessage}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>Send Direct Message</span>
              </button>

              <div className="border-t border-white/20 pt-4">
                <h4 className="text-white font-medium mb-3">OTP Operations</h4>
                
                <div className="flex space-x-2 mb-3">
                  <button
                    onClick={sendOTP}
                    className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Shield className="w-5 h-5" />
                    <span>Send OTP</span>
                  </button>
                  <button
                    onClick={sendOTP}
                    className="flex-1 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span>Resend</span>
                  </button>
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter OTP code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    maxLength={6}
                    className="flex-1 p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-blue-400 focus:outline-none"
                  />
                  <button
                    onClick={verifyOTP}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Verify
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Request Logs */}
          <div className="glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Request Logs</h3>
              <button className="px-3 py-1 bg-white/10 text-white/70 rounded text-sm hover:bg-white/20 transition-colors">
                Refresh
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left text-white/60 py-2">Time</th>
                    <th className="text-left text-white/60 py-2">Type</th>
                    <th className="text-left text-white/60 py-2">Number</th>
                    <th className="text-left text-white/60 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-3 text-white/80 font-mono text-xs">{log.time}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          log.type === 'SMS' ? 'bg-blue-600/20 text-blue-300' : 'bg-purple-600/20 text-purple-300'
                        }`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="py-3 text-white/80 font-mono text-xs">{log.number}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          log.status === 'Success' ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {logs.length === 0 && (
              <div className="text-center text-white/60 py-8">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No requests yet</p>
                <p className="text-sm">Start sending messages to see logs here</p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-8">
          {/* Quick Stats */}
          <div className="glass p-6 rounded-xl">
          <h4 className="text-lg font-semibold text-white mb-4">Today&apos;s Usage</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60">SMS Sent</span>
                <span className="text-white font-medium">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">OTP Sent</span>
                <span className="text-white font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Success Rate</span>
                <span className="text-green-400 font-medium">98.5%</span>
              </div>
            </div>
          </div>

          {/* API Documentation */}
          <div className="glass p-6 rounded-xl">
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <div className="space-y-2">
              <button className="w-full text-left p-2 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors">
                📖 API Documentation
              </button>
              <button className="w-full text-left p-2 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors">
                🔧 SDK Downloads
              </button>
              <button className="w-full text-left p-2 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors">
                💬 Support Center
              </button>
            </div>
          </div>

          {/* Account Status */}
          <div className="glass p-6 rounded-xl">
            <h4 className="text-lg font-semibold text-white mb-4">Account Status</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-white">Service Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-white">Premium Plan</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span className="text-white">Auto-renewal On</span>
              </div>
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
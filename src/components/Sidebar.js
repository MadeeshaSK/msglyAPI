'use client'
import { useState } from 'react'
import { X, Settings, LogOut, User, Upload, Camera } from 'lucide-react'

export default function Sidebar({ user, onClose, onLogout }) {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1" onClick={onClose}></div>
      
      <div className="w-80 glass backdrop-blur-xl border-l border-white/20 flex flex-col h-full">
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Profile</h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Profile Picture */}
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user.name.charAt(0)}
              </div>
              <button className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                <Camera className="w-3 h-3" />
              </button>
            </div>
            <h3 className="text-white font-semibold mt-3">{user.name}</h3>
            <p className="text-white/60 text-sm">{user.email}</p>
          </div>

          {/* Navigation */}
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                activeTab === 'profile' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/10 text-white/70'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                activeTab === 'settings' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/10 text-white/70'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Settings
            </button>
          </div>

          {/* Content */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm mb-2">Name</label>
                <input
                  type="text"
                  defaultValue={user.name}
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-white/60 text-sm mb-2">Email</label>
                <input
                  type="email"
                  defaultValue={user.email}
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-2">Phone</label>
                <input
                  type="tel"
                  defaultValue={user.phone || ''}
                  placeholder="Enter phone number"
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-blue-400 focus:outline-none"
                />
              </div>

              <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Update Profile
              </button>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm mb-2">Change Password</label>
                <input
                  type="password"
                  placeholder="Current Password"
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-blue-400 focus:outline-none mb-2"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-blue-400 focus:outline-none mb-2"
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-blue-400 focus:outline-none"
                />
              </div>

              <button className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Update Password
              </button>

              <div className="pt-4 border-t border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white">Email Notifications</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">SMS Notifications</span>
                  <input type="checkbox" className="rounded" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/20">
          <button
            onClick={onLogout}
            className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  )
}
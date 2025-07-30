// src/components/Sidebar.js

'use client'
import { useState, useEffect } from 'react'
import { X, Settings, LogOut, User, Camera, Save, Shield, Check } from 'lucide-react'
import { 
  getSidebarProfile, 
  updateSidebarProfile, 
  checkEmailExists,
  checkPhoneExists,
  sendEmailVerification, 
  sendPhoneVerification, 
  verifyEmailCode, 
  verifyPhoneCode,
  deleteUserAccount,
  uploadProfilePicture,
  removeProfilePicture 
} from '../services/sidebarService'

export default function Sidebar({ user, onClose, onLogout, onProfileUpdate }) {
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [currentProfilePicture, setCurrentProfilePicture] = useState(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    amount: 0,
    emailNotifications: false
  })

  // Loading states for verification actions
  const [loadingStates, setLoadingStates] = useState({
    sendingVerification: false,
    verifyingEmail: false,
    verifyingPhone: false,
    savingNotifications: false,
    uploadingPicture: false,    
    removingPicture: false  
  })

  // Original data for comparison
  const [originalData, setOriginalData] = useState({})

  // Verification states
  const [verification, setVerification] = useState({
    emailRequired: false,
    phoneRequired: false,
    emailCode: '',
    phoneCode: '',
    emailVerified: false,
    phoneVerified: false,
    emailSent: false,
    phoneSent: false
  })

  // Delete account confirmation state
  const [deleteAccount, setDeleteAccount] = useState({
    showConfirm: false,
    verificationSent: false,
    verificationCode: '',
    isDeleting: false,
    showFinalConfirm: false
  })

  // Load profile data on component mount
  useEffect(() => {
    fetchProfile()
  }, [])

  // Auto-clear messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError('')
      
      const result = await getSidebarProfile(user.apiKey)
      
      if (result.success) {
        const profile = result.data
        const profileState = {
          name: profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          role: profile.role || 'user',
          amount: profile.amount || 0,
          emailNotifications: profile.emailNotifications || false
        }
        
        setProfileData(profileState)
        setOriginalData(profileState)
        
        setCurrentProfilePicture(profile.profilePicture || null)
        
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  
    // Clear any existing errors when user starts typing
    setError('')
  
    // Check if verification is needed when email or phone changes
    if (field === 'email' && value !== originalData.email) {
      if (value.trim() !== '') {
        setVerification(prev => ({ ...prev, emailRequired: true, emailVerified: false }))
      } else {
        // User is clearing email, reset email verification
        setVerification(prev => ({ 
          ...prev, 
          emailRequired: false, 
          emailVerified: false,
          emailSent: false,
          emailCode: ''
        }))
      }
    }
    
    if (field === 'phone' && value !== originalData.phone) {
      if (value.trim() !== '') {
        setVerification(prev => ({ ...prev, phoneRequired: true, phoneVerified: false }))
      } else {
        // User is clearing phone, reset phone verification  
        setVerification(prev => ({ 
          ...prev, 
          phoneRequired: false, 
          phoneVerified: false,
          phoneSent: false,
          phoneCode: ''
        }))
      }
    }
  }

  const handleNotificationToggle = async () => {
    if (loadingStates.savingNotifications) return; // Prevent multiple clicks
    
    const newNotificationState = !profileData.emailNotifications;
    
    // Update local state immediately for instant UI feedback
    setProfileData(prev => ({
      ...prev,
      emailNotifications: newNotificationState
    }))
  
    try {
      setLoadingStates(prev => ({ ...prev, savingNotifications: true }))
      
      // Auto-save to database
      const result = await updateSidebarProfile(user.apiKey, {
        emailNotifications: newNotificationState
      })
  
      if (result.success) {
        // Update original data to reflect the saved state
        setOriginalData(prev => ({
          ...prev,
          emailNotifications: newNotificationState
        }))
      }
    } catch (error) {
      
      // Revert the local state if save failed
      setProfileData(prev => ({
        ...prev,
        emailNotifications: !newNotificationState
      }))
      
      setError('Failed to save notification preference')
    } finally {
      setLoadingStates(prev => ({ ...prev, savingNotifications: false }))
    }
  }

  const hasChanges = () => {
    return (
      profileData.name !== originalData.name ||
      profileData.email !== originalData.email ||
      profileData.phone !== originalData.phone ||
      profileData.emailNotifications !== originalData.emailNotifications
    )
  }

  const sendVerificationCodes = async () => {
    if (loadingStates.sendingVerification) return // Prevent multiple requests
    
    try {
      setLoadingStates(prev => ({ ...prev, sendingVerification: true }))
      setError('')
      
      // Check if email exists before sending verification
      if (verification.emailRequired && !verification.emailSent) {
        const emailCheck = await checkEmailExists(user.apiKey, profileData.email)
        
        if (emailCheck.exists) {
          setError('This email address is already registered by another user')
          return
        }
        
        await sendEmailVerification(user.apiKey, profileData.email)
        setVerification(prev => ({ ...prev, emailSent: true }))
        setSuccessMessage('Email verification code sent')
      }
      
      // Check if phone exists before sending verification
      if (verification.phoneRequired && !verification.phoneSent) {
        const phoneCheck = await checkPhoneExists(user.apiKey, profileData.phone)
        
        if (phoneCheck.exists) {
          setError('This phone number is already registered by another user')
          return
        }
        
        await sendPhoneVerification(user.apiKey, profileData.phone)
        setVerification(prev => ({ ...prev, phoneSent: true }))
        setSuccessMessage('Phone verification code sent')
      }
      
      // If both are required, send success message for both
      if (verification.emailRequired && verification.phoneRequired && 
          !verification.emailSent && !verification.phoneSent) {
        setSuccessMessage('Verification codes sent to both email and phone')
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoadingStates(prev => ({ ...prev, sendingVerification: false }))
    }
  }

  const verifyEmailCodeHandler = async () => {
    if (loadingStates.verifyingEmail) return 
    
    try {
      setLoadingStates(prev => ({ ...prev, verifyingEmail: true }))
      setError('')
      await verifyEmailCode(user.apiKey, profileData.email, verification.emailCode)
      setVerification(prev => ({ ...prev, emailVerified: true }))
      setSuccessMessage('Email verified successfully')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoadingStates(prev => ({ ...prev, verifyingEmail: false }))
    }
  }

  const verifyPhoneCodeHandler = async () => {
    if (loadingStates.verifyingPhone) return 
    
    try {
      setLoadingStates(prev => ({ ...prev, verifyingPhone: true }))
      setError('')
      await verifyPhoneCode(user.apiKey, profileData.phone, verification.phoneCode)
      setVerification(prev => ({ ...prev, phoneVerified: true }))
      setSuccessMessage('Phone verified successfully')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoadingStates(prev => ({ ...prev, verifyingPhone: false }))
    }
  }

  const canUpdate = () => {
    if (!hasChanges()) return false;
    
    // Check contact field validation
    const contactError = validateContactFields();
    if (contactError) {
      return false;
    }
    
    // If email changed and has value, must be verified
    if (verification.emailRequired && profileData.email.trim() !== '' && !verification.emailVerified) {
      return false;
    }
    
    // If phone changed and has value, must be verified
    if (verification.phoneRequired && profileData.phone.trim() !== '' && !verification.phoneVerified) {
      return false;
    }
    
    return true;
  };

  const validateContactFields = () => {
    const hasOriginalEmail = originalData.email && originalData.email.trim() !== '';
    const hasOriginalPhone = originalData.phone && originalData.phone.trim() !== '';
    const hasNewEmail = profileData.email && profileData.email.trim() !== '';
    const hasNewPhone = profileData.phone && profileData.phone.trim() !== '';
    
    // If user originally had both contacts
    if (hasOriginalEmail && hasOriginalPhone) {
      // They can clear one but not both
      if (!hasNewEmail && !hasNewPhone) {
        return 'At least one contact method (email or phone) is required';
      }
    }
    // If user originally had only email
    else if (hasOriginalEmail && !hasOriginalPhone) {
      // They cannot clear email unless they add phone
      if (!hasNewEmail && !hasNewPhone) {
        return 'Cannot remove email. Please add a phone number first or keep your email';
      }
    }
    // If user originally had only phone  
    else if (!hasOriginalEmail && hasOriginalPhone) {
      // They cannot clear phone unless they add email
      if (!hasNewPhone && !hasNewEmail) {
        return 'Cannot remove phone. Please add an email first or keep your phone number';
      }
    }
    // If somehow user had neither (shouldn't happen but safety check)
    else {
      if (!hasNewEmail && !hasNewPhone) {
        return 'At least one contact method (email or phone) is required';
      }
    }
    
    return null; // No validation errors
  };

  const handleUpdateProfile = async () => {
    // Clear any existing errors
    setError('')
    
    if (!hasChanges()) {
      setError('No changes to save')
      return
    }
  
    // Check contact field validation and set error if needed
    const contactError = validateContactFields();
    if (contactError) {
      setError(contactError);
      return;
    }
  
    // Check verification requirements
    if (verification.emailRequired && profileData.email.trim() !== '' && !verification.emailVerified) {
      setError('Please verify your email before updating');
      return;
    }
    
    if (verification.phoneRequired && profileData.phone.trim() !== '' && !verification.phoneVerified) {
      setError('Please verify your phone before updating');
      return;
    }
  
    try {
      setUpdating(true)
      setSuccessMessage('')
  
      const updates = {
        name: profileData.name.trim(),
        emailNotifications: profileData.emailNotifications
      }
  
      // Include email (even if empty to clear it)
      if (profileData.email !== originalData.email) {
        updates.email = profileData.email.trim()
      }
  
      // Include phone (even if empty to clear it)  
      if (profileData.phone !== originalData.phone) {
        updates.phone = profileData.phone.trim()
      }
  
      const result = await updateSidebarProfile(user.apiKey, updates)
  
      if (result.success) {
        setSuccessMessage(result.message || 'Profile updated successfully')
        
        // Reset verification states
        setVerification({
          emailRequired: false,
          phoneRequired: false,
          emailCode: '',
          phoneCode: '',
          emailVerified: false,
          phoneVerified: false,
          emailSent: false,
          phoneSent: false
        })
        
        // Refresh profile data
        await fetchProfile()
        
        // Notify parent component
        if (onProfileUpdate) {
          onProfileUpdate(result.data)
        }
        
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setUpdating(false)
    }
  }

  // Get user plan type
  const getUserPlan = () => {
    return profileData.amount > 100 ? 'Paid Plan' : 'Free Plan'
  }

  // Handle profile picture upload
  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    try {
      setLoadingStates(prev => ({ ...prev, uploadingPicture: true }))
      setError('')
      
      const result = await uploadProfilePicture(user.apiKey, file)
      
      if (result.success) {
        setSuccessMessage('Profile picture updated successfully')
        
        // Update current profile picture state immediately
        setCurrentProfilePicture(result.data.profilePicture)
        
        // Update user object to reflect new profile picture
        if (onProfileUpdate) {
          onProfileUpdate(result.data.user)
        }
        
        // Refresh profile data to ensure persistence
        await fetchProfile()
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoadingStates(prev => ({ ...prev, uploadingPicture: false }))
      // Clear the file input
      event.target.value = ''
    }
  }

  // Handle profile picture removal
  const handleRemoveProfilePicture = async () => {
    if (!currentProfilePicture) return

    const confirmRemove = window.confirm('Are you sure you want to remove your profile picture?')
    if (!confirmRemove) return

    try {
      setLoadingStates(prev => ({ ...prev, removingPicture: true }))
      setError('')
      
      const result = await removeProfilePicture(user.apiKey)
      
      if (result.success) {
        setSuccessMessage('Profile picture removed successfully')
        
        // Update current profile picture state immediately
        setCurrentProfilePicture(null)
        
        // Update user object to reflect removed profile picture
        if (onProfileUpdate) {
          onProfileUpdate(result.data)
        }
        
        // Refresh profile data to ensure persistence
        await fetchProfile()
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoadingStates(prev => ({ ...prev, removingPicture: false }))
    }
  }

  // Delete account confirmation
  const sendDeleteVerification = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, sendingVerification: true }))
      setError('')
      
      // Send to email if available, otherwise phone
      if (profileData.email && profileData.email.trim() !== '') {
        await sendEmailVerification(user.apiKey, profileData.email)
        setSuccessMessage('Delete verification code sent to your email')
      } else if (profileData.phone && profileData.phone.trim() !== '') {
        await sendPhoneVerification(user.apiKey, profileData.phone)
        setSuccessMessage('Delete verification code sent to your phone')
      } else {
        setError('No email or phone number available for verification')
        return
      }
      
      setDeleteAccount(prev => ({ ...prev, verificationSent: true }))
    } catch (error) {
      setError(error.message)
    } finally {
      setLoadingStates(prev => ({ ...prev, sendingVerification: false }))
    }
  }

  // Verify delete account code
  const verifyDeleteCode = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, verifyingEmail: true }))
      setError('')
      
      // Verify with email if available, otherwise phone
      if (profileData.email && profileData.email.trim() !== '') {
        await verifyEmailCode(user.apiKey, profileData.email, deleteAccount.verificationCode)
      } else if (profileData.phone && profileData.phone.trim() !== '') {
        await verifyPhoneCode(user.apiKey, profileData.phone, deleteAccount.verificationCode)
      }
      
      setDeleteAccount(prev => ({ ...prev, showFinalConfirm: true }))
      setSuccessMessage('Verification successful. Please confirm account deletion.')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoadingStates(prev => ({ ...prev, verifyingEmail: false }))
    }
  }

  // Handle delete account
  const handleDeleteAccount = async () => {
    try {
      setDeleteAccount(prev => ({ ...prev, isDeleting: true }))
      setError('')
      
      // Get user ID from the profile data or user object
      const userId = user.id || profileData.id
      
      await deleteUserAccount(user.apiKey, userId)
      
      setSuccessMessage('Account deleted successfully. You will be logged out.')
      
      // Wait a moment then logout
      setTimeout(() => {
        onLogout()
      }, 2000)
      
    } catch (error) {
      setError(error.message)
    } finally {
      setDeleteAccount(prev => ({ ...prev, isDeleting: false }))
    }
  }

  const resetDeleteProcess = () => {
    setDeleteAccount({
      showConfirm: false,
      verificationSent: false,
      verificationCode: '',
      isDeleting: false,
      showFinalConfirm: false
    })
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex">
        <div className="flex-1" onClick={onClose}></div>
        <div className="w-80 glass backdrop-blur-xl border-l border-white/20 flex flex-col h-full">
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Profile</h2>
              <button onClick={onClose} className="text-white/60 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-white/60">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

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

        <div className="flex-1 overflow-y-auto scrollbar-hide p-6">
          {/* Profile Picture */}
          <div className="text-center mb-6">
            <div className="relative inline-block">
              {currentProfilePicture ? (
                <img 
                  src={currentProfilePicture} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full object-cover border-2 border-white/20"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profileData.name.charAt(0).toUpperCase()}
                </div>
              )}
              
              {/* Upload button */}
              <button 
                onClick={() => document.getElementById('profilePictureInput').click()}
                disabled={loadingStates.uploadingPicture}
                className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loadingStates.uploadingPicture ? (
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Camera className="w-3 h-3" />
                )}
              </button>
              
              {/* Remove button - only show if user has profile picture */}
              {currentProfilePicture && (
                <button 
                  onClick={handleRemoveProfilePicture}
                  disabled={loadingStates.removingPicture}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loadingStates.removingPicture ? (
                    <div className="w-2 h-2 border border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <X className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>
            
            {/* Hidden file input */}
            <input
              id="profilePictureInput"
              type="file"
              accept="image/*"
              onChange={handleProfilePictureUpload}
              className="hidden"
            />
            
            <h3 className="text-white font-semibold mt-3">{profileData.name}</h3>
            <p className="text-white/60 text-sm">{profileData.email}</p>
            <p className={`text-xs mt-1 ${profileData.amount > 100 ? 'text-purple-400' : 'text-blue-400'}`}>
              {getUserPlan()}
            </p>
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

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
              <p className="text-red-200 text-sm">❌ {error}</p>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 mb-4">
              <p className="text-green-200 text-sm">✅ {successMessage}</p>
            </div>
          )}

          {/* Content */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm mb-2">Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={updating}
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white focus:border-blue-400 focus:outline-none disabled:opacity-50"
                />
              </div>
              
              <div>
                <label className="block text-white/60 text-sm mb-2">
                  Email {verification.emailRequired && (
                    <span className="text-yellow-300">(Verification Required)</span>
                  )}
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={updating}
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white focus:border-blue-400 focus:outline-none disabled:opacity-50"
                />
                
                {verification.emailRequired && (
                  <div className="mt-3 space-y-2">
                    {!verification.emailSent ? (
                      <button
                      onClick={sendVerificationCodes}
                      disabled={loadingStates.sendingVerification}
                      className="w-full py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Shield className="w-4 h-4" />
                      <span>{loadingStates.sendingVerification ? 'Sending...' : 'Send Verification Code'}</span>
                    </button>
                    
                    ) : (
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="Enter email code"
                            value={verification.emailCode}
                            onChange={(e) => setVerification(prev => ({ ...prev, emailCode: e.target.value }))}
                            maxLength={6}
                            className="flex-1 p-2 bg-white/10 border border-white/30 rounded text-white text-sm"
                          />
                          <button
                            onClick={verifyEmailCodeHandler}
                            disabled={verification.emailVerified || loadingStates.verifyingEmail}
                            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            {verification.emailVerified ? <Check className="w-4 h-4" /> : 
                            loadingStates.verifyingEmail ? 'Verifying...' : 'Verify'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-2">
                  Phone {verification.phoneRequired && (
                    <span className="text-yellow-300">(Verification Required)</span>
                  )}
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                  disabled={updating}
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-blue-400 focus:outline-none disabled:opacity-50"
                />
                
                {verification.phoneRequired && (
                  <div className="mt-3 space-y-2">
                    {!verification.phoneSent ? (
                      <button
                      onClick={sendVerificationCodes}
                      disabled={loadingStates.sendingVerification}
                      className="w-full py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Shield className="w-4 h-4" />
                      <span>{loadingStates.sendingVerification ? 'Sending...' : 'Send Verification Code'}</span>
                    </button>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="Enter phone code"
                            value={verification.phoneCode}
                            onChange={(e) => setVerification(prev => ({ ...prev, phoneCode: e.target.value }))}
                            maxLength={6}
                            className="flex-1 p-2 bg-white/10 border border-white/30 rounded text-white text-sm"
                          />
                          <button
                            onClick={verifyPhoneCodeHandler}
                            disabled={verification.phoneVerified || loadingStates.verifyingPhone}
                            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            {verification.phoneVerified ? <Check className="w-4 h-4" /> : 
                            loadingStates.verifyingPhone ? '...' : 'Verify'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button 
                onClick={handleUpdateProfile}
                disabled={updating || !canUpdate()}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>{updating ? 'Updating...' : 'Update Profile'}</span>
              </button>

              {!canUpdate() && hasChanges() && (
                <div className="text-center">
                  {(() => {
                    const contactError = validateContactFields();
                    if (contactError) {
                      return (
                        <p className="text-yellow-300 text-sm">
                          ⚠️ {contactError}
                        </p>
                      );
                    }
                    
                    if ((verification.emailRequired && profileData.email.trim() !== '' && !verification.emailVerified) ||
                        (verification.phoneRequired && profileData.phone.trim() !== '' && !verification.phoneVerified)) {
                      return (
                        <p className="text-yellow-300 text-sm">
                          ⚠️ Please complete verification before updating
                        </p>
                      );
                    }
                    
                    return null;
                  })()}
                </div>
              )}

              {(verification.emailRequired || verification.phoneRequired) && (
                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
                  <p className="text-yellow-200 text-xs text-center">
                    ⚠️ Email and/or phone verification required before updating
                  </p>
                </div>
              )}
            </div>
          )}

{activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Email Notifications */}
              <div>
                <h4 className="text-white font-medium mb-4">Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <span className="text-white">Email Notifications</span>
                      <p className="text-white/60 text-sm">Receive updates and alerts via email</p>
                    </div>
                    <button
                      onClick={handleNotificationToggle}
                      disabled={loadingStates.savingNotifications}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        profileData.emailNotifications ? 'bg-blue-600' : 'bg-gray-600'
                      } ${loadingStates.savingNotifications ? 'opacity-50' : ''}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          profileData.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                      {loadingStates.savingNotifications && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Account Management */}
              <div>
                <h4 className="text-white font-medium mb-4">Account Management</h4>
                <div className="space-y-3">
                  
                  {/* Delete Account */}
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-red-300 font-medium">Delete Account</span>
                    </div>
                    <p className="text-red-200/80 text-sm mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    
                    {!deleteAccount.showConfirm ? (
                      <button
                        onClick={() => setDeleteAccount(prev => ({ ...prev, showConfirm: true }))}
                        className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Delete Account
                      </button>
                    ) : (
                      <div className="space-y-3">
                        {!deleteAccount.verificationSent ? (
                          <div className="space-y-3">
                            <div className="bg-red-900/30 p-3 rounded border border-red-500/50">
                              <p className="text-red-200 text-sm text-center">
                                ⚠️ This will permanently delete your account. 
                                We'll send a verification code to {profileData.email || profileData.phone} to confirm.
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={resetDeleteProcess}
                                className="flex-1 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={sendDeleteVerification}
                                disabled={loadingStates.sendingVerification}
                                className="flex-1 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                              >
                                {loadingStates.sendingVerification ? 'Sending...' : 'Send Code'}
                              </button>
                            </div>
                          </div>
                        ) : !deleteAccount.showFinalConfirm ? (
                          <div className="space-y-3">
                            <p className="text-red-200 text-sm text-center">
                              Enter the verification code sent to {profileData.email || profileData.phone}:
                            </p>
                            <input
                              type="text"
                              placeholder="Enter verification code"
                              value={deleteAccount.verificationCode}
                              onChange={(e) => setDeleteAccount(prev => ({ 
                                ...prev, 
                                verificationCode: e.target.value 
                              }))}
                              maxLength={6}
                              className="w-full p-2 bg-white/10 border border-red-500/50 rounded text-white text-center"
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={resetDeleteProcess}
                                className="flex-1 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={verifyDeleteCode}
                                disabled={loadingStates.verifyingEmail || !deleteAccount.verificationCode.trim()}
                                className="flex-1 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                              >
                                {loadingStates.verifyingEmail ? 'Verifying...' : 'Verify'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="bg-red-900/50 p-4 rounded border border-red-500/70">
                              <p className="text-red-100 font-medium text-center mb-2">
                                ⚠️ FINAL CONFIRMATION
                              </p>
                              <p className="text-red-200 text-sm text-center mb-3">
                                Are you absolutely sure you want to delete your account? 
                                This action <strong>CANNOT BE UNDONE</strong> and you will lose:
                              </p>
                              <ul className="text-red-200 text-xs space-y-1 mb-3">
                                <li>• All your account data</li>
                                <li>• Your remaining API requests ({profileData.amount})</li>
                                <li>• Your API key and access</li>
                                <li>• All usage history and statistics</li>
                              </ul>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={resetDeleteProcess}
                                className="flex-1 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                              >
                                Keep Account
                              </button>
                              <button
                                onClick={handleDeleteAccount}
                                disabled={deleteAccount.isDeleting}
                                className="flex-1 py-2 bg-red-700 text-white rounded hover:bg-red-800 transition-colors disabled:opacity-50 font-medium"
                              >
                                {deleteAccount.isDeleting ? 'Deleting...' : 'DELETE FOREVER'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/20">
          {!showLogoutConfirm ? (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-200 text-sm text-center">
                  Are you sure you want to logout?
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  No
                </button>
                <button
                  onClick={onLogout}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Yes</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
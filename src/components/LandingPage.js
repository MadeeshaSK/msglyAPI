'use client'
import { useState, useEffect } from 'react'
import { Phone, Mail, Shield, Zap, Users, BarChart3, Headphones, Github, Linkedin, Facebook, MessageCircle } from 'lucide-react'
import AuthModal from './AuthModal'
import { sendEmail } from '../services/userService'

export default function LandingPage({ onLogin }) {
  const [activeTab, setActiveTab] = useState('home')
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tab = urlParams.get('tab')
    if (tab && ['home', 'services', 'about', 'contact'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [])

  const openAuth = (mode) => {
    setAuthMode(mode)
    setShowAuth(true)
  }

  const handleContactFormChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    })
  }

  const handleContactSubmit = async () => {
    // Basic validation
    if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
      setSubmitMessage('Please fill in all fields.')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(contactForm.email)) {
      setSubmitMessage('Please enter a valid email address.')
      return
    }

    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      const apiKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY
      
      // Send email to admin
      const adminSubject = `Contact Form: ${contactForm.subject} - From ${contactForm.name}`
      const adminMessage = `New contact form submission:

Name: ${contactForm.name}
Email: ${contactForm.email}
Subject: ${contactForm.subject}

Message:
${contactForm.message}

---
Reply to: ${contactForm.email}`
      
      const adminResult = await sendEmail(apiKey, 'madeeshasachindu2@gmail.com', adminSubject, adminMessage)
      
      if (adminResult.success) {
        // Send confirmation email to user
        const userSubject = `Thank you for contacting msglyAPI - ${contactForm.subject}`
        const userMessage = `Dear ${contactForm.name},

Thank you for contacting us! We have received your message and will respond as soon as possible.

Your message: "${contactForm.message}"

We typically respond within 24 hours.

Best regards,
msglyAPI Team`
        
        const userResult = await sendEmail(apiKey, contactForm.email, userSubject, userMessage)
        
        if (userResult.success) {
          setSubmitMessage('Message sent successfully! We will be in touch with you as much as possible.')
          setContactForm({ name: '', email: '', subject: '', message: '' })
        }
      }
    } catch (error) {
      setSubmitMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <header className="glass fixed w-full top-0 z-50" style={{
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white flex items-center space-x-2">
            <span>
              msgly<span className="text-blue-400">API</span>
            </span>
            <img
              src="/favicon.png" 
              alt="Logo"
              className="w-10 h-10" 
            />
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {['home', 'services', 'about', 'contact'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`capitalize transition-colors ${
                  activeTab === tab 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-white hover:text-blue-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="flex space-x-4">
            <button
              onClick={() => openAuth('login')}
              className="px-4 py-2 text-white border border-white/30 rounded-lg hover:bg-white/10 transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => openAuth('signup')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        {activeTab === 'home' && (
          <section className="container mx-auto px-6 py-20 text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Modern API
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                {' '}Solutions
              </span>
            </h1>
            <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto">
              Powerful, reliable, and scalable API services for SMS, bulk messaging, and OTP phone verification. Built for developers, trusted by businesses.
            </p>
            <button
              onClick={() => openAuth('signup')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              Get Started Free
            </button>

            <div className="grid md:grid-cols-3 gap-8 mt-20">
              {[
                { icon: Zap, title: 'Fast & Reliable', desc: '99.9% uptime guarantee' },
                { icon: Shield, title: 'Secure', desc: 'Enterprise-grade security' },
                { icon: BarChart3, title: 'Scalable', desc: 'Handle millions of requests' }
              ].map((feature, idx) => (
                <div key={idx} className="glass p-8 rounded-2xl" style={{
                  backdropFilter: 'blur(20px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <feature.icon className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/70">{feature.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'services' && (
          <section className="container mx-auto px-6 py-20">
            <h2 className="text-4xl font-bold text-white text-center mb-12">Our Services</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: 'SMS & Email API', desc: 'Email and SMS in one API', icon: Mail },
                { title: 'OTP Verification', desc: 'Secure one-time password system', icon: Shield },
                { title: 'Bulk Messaging', desc: 'Send messages and emails to thousands', icon: Users },
                { title: 'Real-time Logging', desc: 'Monitor all your requests', icon: BarChart3 },
                { title: '24/7 Customer Support', desc: 'Seamless communication for customer assistance', icon: Headphones },
                { title: 'Developer Tools', desc: 'API key and documentation', icon: Zap }
              ].map((service, idx) => (
                <div key={idx} className="glass p-6 rounded-xl" style={{
                  backdropFilter: 'blur(20px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <service.icon className="w-10 h-10 text-blue-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">{service.title}</h3>
                  <p className="text-white/70">{service.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'about' && (
          <section className="container mx-auto px-6 py-20 text-center">
            <h2 className="text-4xl font-bold text-white mb-8">About Us</h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-xl text-white/80 mb-8">
                We provide cutting-edge API solutions for modern communication needs. 
                Our platform offers reliable SMS, OTP, and messaging services with 
                enterprise-grade security and 99.9% uptime guarantee.
              </p>
              <div className="grid md:grid-cols-3 gap-8 mt-12">
                <div className="glass p-6 rounded-xl" style={{
                  backdropFilter: 'blur(20px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <h3 className="text-2xl font-bold text-blue-400 mb-2">10M+</h3>
                  <p className="text-white">Messages Delivered</p>
                </div>
                <div className="glass p-6 rounded-xl" style={{
                  backdropFilter: 'blur(20px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <h3 className="text-2xl font-bold text-blue-400 mb-2">50+</h3>
                  <p className="text-white">Countries Supported</p>
                </div>
                <div className="glass p-6 rounded-xl" style={{
                  backdropFilter: 'blur(20px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <h3 className="text-2xl font-bold text-blue-400 mb-2">99.9%</h3>
                  <p className="text-white">Uptime Guarantee</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'contact' && (
          <section className="container mx-auto px-6 py-20">
            <h2 className="text-4xl font-bold text-white text-center mb-12">Contact Us</h2>
            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Contact Information */}
              <div className="glass p-8 rounded-2xl" style={{
                backdropFilter: 'blur(20px)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <h3 className="text-2xl font-bold text-white mb-6">Get in Touch</h3>
                <p className="text-white/80 mb-8">
                  We're here to help! Reach out to us through any of the following channels.
                </p>
                
                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-lg">
                    <img 
                      src="/gmail.png" 
                      alt="Gmail"
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                    />
                    </div>
                    <div>
                      <p className="text-white font-medium">Email</p>
                      <a 
                        href="mailto:madeeshasachindu2@gmail.com" 
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        madeeshasachindu2@gmail.com
                      </a>
                    </div>
                  </div>
                  
                  {/* Phone */}
                  <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-lg">
                    <img 
                      src="/phone.png" 
                      alt="Phone"
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                    />
                    </div>
                    <div>
                      <p className="text-white font-medium">Hotline</p>
                      <a 
                        href="tel:+94763741826" 
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        +94 76 374 1826
                      </a>
                    </div>
                  </div>
                  
                  {/* WhatsApp */}
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-lg">
                    <img 
                      src="/whatsapp.png" 
                      alt="Whatsapp"
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                    />
                    </div>
                    <div>
                      <p className="text-white font-medium">WhatsApp</p>
                      <a 
                        href="https://wa.me/94763741826" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        +94 76 374 1826
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* Social Media */}
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-white mb-4">Follow Us</h4>
                  <div className="flex space-x-4">
                    {/* GitHub */}
                    <a 
                      href="https://github.com/MadeeshaSK/msgsend" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group w-12 h-12 rounded-lg overflow-hidden hover:scale-110 transition-all transform shadow-lg"
                    >
                      <img 
                        src="/github.png" 
                        alt="GitHub"
                        className="w-full h-full object-contain filter brightness-0 invert group-hover:brightness-75 transition-all"
                      />
                    </a>
                    
                    {/* LinkedIn */}
                      <a 
                        href="https://www.linkedin.com/in/madeesha-karunarathna/" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group w-12 h-12 rounded-lg overflow-hidden hover:scale-110 transition-all transform shadow-lg"
                      >
                        <img 
                          src="/linkedin.png" 
                          alt="LinkedIn"
                          className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                        />
                      </a>
                    
                    {/* Facebook */}
                    <a 
                      href="https://www.facebook.com/madeeshasachindu.karunarathna" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group w-12 h-12 rounded-lg overflow-hidden hover:scale-110 transition-all transform shadow-lg"
                    >
                      <img 
                        src="/facebook.png" 
                        alt="Facebook"
                        className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                      />
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Contact Form */}
              <div className="glass p-8 rounded-2xl" style={{
                backdropFilter: 'blur(20px)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <h3 className="text-2xl font-bold text-white mb-6">Send us a Message</h3>
                <div className="space-y-6">
                  <div>
                    <input
                      type="text"
                      name="name"
                      value={contactForm.name}
                      onChange={handleContactFormChange}
                      placeholder="Your Name"
                      className="w-full p-4 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-blue-400 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleContactFormChange}
                      placeholder="Your Email"
                      className="w-full p-4 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-blue-400 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="subject"
                      value={contactForm.subject}
                      onChange={handleContactFormChange}
                      placeholder="Subject"
                      className="w-full p-4 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-blue-400 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <textarea
                      rows={5}
                      name="message"
                      value={contactForm.message}
                      onChange={handleContactFormChange}
                      placeholder="Your Message"
                      className="w-full p-4 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-blue-400 focus:outline-none resize-none transition-colors"
                    />
                  </div>
                  <button
                    onClick={handleContactSubmit}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                  {submitMessage && (
                    <div className={`p-4 rounded-lg text-center ${
                      submitMessage.includes('successfully') 
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {submitMessage}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {showAuth && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuth(false)}
          onLogin={onLogin}
          onSwitchMode={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
        />
      )}
    </div>
  )
}
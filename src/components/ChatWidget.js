// Replace your src/components/ChatWidget.js with this:

'use client'
import Script from 'next/script'
import { useEffect, useState } from 'react'

export default function ChatWidget() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    // Check if the current page is an admin dashboard
    const checkForAdminDashboard = () => {
      const dataAdminElement = document.querySelector('[data-admin-dashboard]')
      const adminClassElement = document.querySelector('.admin-dashboard')
      
      const hasAdminPanel = document.body.textContent.includes('AdminPanel')
      const hasAdminSettings = document.body.textContent.includes('Admin Settings')
      const hasMsglyAPI = document.body.textContent.includes('msglyAPI')
      
      const h1Elements = document.querySelectorAll('h1')
      const hasAdminH1 = Array.from(h1Elements).some(h1 => 
        h1.textContent.includes('msglyAPI') || h1.textContent.includes('AdminPanel')
      )

      return !!(dataAdminElement || adminClassElement || hasAdminPanel || hasAdminSettings || (hasMsglyAPI && hasAdminH1))
    }

    // Toggle Tawk widget visibility based on admin dashboard presence
    const toggleWidget = () => {
      const isAdminPage = checkForAdminDashboard()
      
      if (isAdminPage) {
        hideTawkWidget()
      } else {
        showTawkWidget()
      }
    }

    toggleWidget()

    // Observe changes in the DOM to toggle widget visibility dynamically
    const observer = new MutationObserver(() => {
      toggleWidget()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    })

    return () => observer.disconnect()
  }, [isClient])

  // Functions to hide and show the Tawk widget
  const hideTawkWidget = () => {
    
    if (window.Tawk_API && window.Tawk_API.hideWidget) {
      window.Tawk_API.hideWidget()
    }

    const selectors = [
      'iframe[src*="tawk.to"]',
      'div[id*="tawk"]',
      'div[class*="tawk"]'
    ]

    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.style.display = 'none !important'
        el.style.visibility = 'hidden !important'
      })
    })
  }

  // Show the Tawk widget
  const showTawkWidget = () => {
    
    if (window.Tawk_API && window.Tawk_API.showWidget) {
      window.Tawk_API.showWidget()
    }

    const selectors = [
      'iframe[src*="tawk.to"]',
      'div[id*="tawk"]',
      'div[class*="tawk"]'
    ]

    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.style.display = ''
        el.style.visibility = 'visible'
      })
    })
  }

  if (!isClient) {
    return null
  }

  return (
    <Script 
      id="tawk-to-widget" 
      strategy="afterInteractive"
    >
      {`
        var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
        (function(){
          var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
          s1.async=true;
          s1.src='https://embed.tawk.to/6881ec521786aa1911e717af/1j0to69kh';
          s1.charset='UTF-8';
          s1.setAttribute('crossorigin','*');
          s0.parentNode.insertBefore(s1,s0);
        })();
      `}
    </Script>
  )
}
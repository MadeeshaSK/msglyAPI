// src/app/layout.js

import './globals.css'
import ChatWidget from '@/components/ChatWidget'

export const metadata = {
  title: 'msglyAPI - Modern API Solutions',
  description: 'Powerful, reliable, and scalable API services for SMS, bulk messaging, and OTP phone verification.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body suppressHydrationWarning={true}>
        {children}
        <ChatWidget />
      </body>
    </html>
  )
}
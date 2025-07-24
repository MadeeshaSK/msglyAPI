import Script from 'next/script'
import './globals.css'

export const metadata = {
  title: 'msglyAPI - Modern API Solutions',
  description: 'Powerful, reliable, and scalable API services for SMS, bulk messaging, and OTP phone verification.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        
        {/* Tawk.to Live Chat Widget */}
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
      </body>
    </html>
  )
}
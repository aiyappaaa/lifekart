import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'LifeKart — Lifetime Wholesale Buying',
  description: 'Lock in wholesale prices for 60 years. Bulk essentials delivered to your doorstep at manufacturer rates.',
}

import { GoogleOAuthProvider } from '@react-oauth/google'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Read dynamically from env file
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""
  
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <GoogleOAuthProvider clientId={clientId}>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  )
}
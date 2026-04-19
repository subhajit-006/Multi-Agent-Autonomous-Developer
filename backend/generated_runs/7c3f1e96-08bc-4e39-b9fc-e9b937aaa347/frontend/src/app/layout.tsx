import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Minimalist Landing Page',
  description: 'A self-contained, lightweight landing page with embedded CSS and JavaScript',
  metadataBase: new URL('https://minimalist-landing-page.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Minimalist Landing Page',
    description: 'A self-contained, lightweight landing page with embedded CSS and JavaScript',
    url: 'https://minimalist-landing-page.com',
    siteName: 'Minimalist Landing Page',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
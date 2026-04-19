import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Self-Contained Landing Page',
  description: 'A single-file HTML landing page with embedded CSS and JavaScript, designed for portability, easy deployment, and no external dependencies.',
  keywords: ['landing page', 'self-contained', 'portable', 'responsive design'],
  authors: [{ name: 'Development Team' }],
  creator: 'Development Team',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://yourdomain.com',
    title: 'Self-Contained Landing Page',
    description: 'A single-file HTML landing page with embedded CSS and JavaScript, designed for portability, easy deployment, and no external dependencies.',
    siteName: 'Self-Contained Landing Page',
    images: [
      {
        url: 'https://yourdomain.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Self-Contained Landing Page',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Self-Contained Landing Page',
    description: 'A single-file HTML landing page with embedded CSS and JavaScript, designed for portability, easy deployment, and no external dependencies.',
    creator: '@yourhandle',
    images: ['https://yourdomain.com/twitter-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
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
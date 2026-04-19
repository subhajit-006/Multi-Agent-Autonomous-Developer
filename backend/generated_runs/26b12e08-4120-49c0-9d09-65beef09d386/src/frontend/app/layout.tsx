import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Self-Contained HTML Landing Page',
  description: 'A portable, single-file HTML landing page with embedded CSS and JavaScript',
  keywords: ['landing page', 'self-contained', 'HTML', 'CSS', 'JavaScript'],
  authors: [{ name: 'Development Team' }],
  viewport: 'width=device-width, initial-scale=1.0',
  robots: 'index, follow',
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
import type { Metadata, Viewport } from 'next';
import './globals.css';
import PageTransition from '@/components/PageTransition';

/* ─────────────────────────────────────────────────────────────
   SEO & Open Graph Metadata
   ───────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: {
    default:  'MAAD — Multi-Agent Autonomous Developer',
    template: '%s · MAAD',
  },
  description:
    'Watch five AI agents — Planner, Architect, Developer, Debugger, and Tester — collaborate in real-time to turn your plain-English idea into a working codebase.',
  keywords: [
    'AI code generation',
    'multi-agent AI',
    'autonomous developer',
    'Claude AI',
    'AI coding assistant',
    'LLM orchestration',
  ],
  authors: [{ name: 'MAAD' }],
  creator: 'MAAD',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://maad.dev'
  ),
  openGraph: {
    type:        'website',
    locale:      'en_US',
    url:         '/',
    siteName:    'MAAD',
    title:       'MAAD — Multi-Agent Autonomous Developer',
    description:
      'Five AI agents collaborating in real-time to build your software from a single sentence.',
    images: [
      {
        url:    'https://via.placeholder.com/1200x630.png?text=MAAD%20OG%20Image', // Placeholder OG image URL
        width:  1200,
        height: 630,
        alt:    'MAAD — Multi-Agent Autonomous Developer',
      },
    ],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'MAAD — Multi-Agent Autonomous Developer',
    description:
      'Five AI agents collaborating in real-time to build your software from a single sentence.',
    images:      ['https://via.placeholder.com/1200x630.png?text=MAAD%20Twitter%20Image'],
  },
  robots: {
    index:                  true,
    follow:                 true,
    googleBot: {
      index:               true,
      follow:              true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet':       -1,
    },
  },
  manifest: '/site.webmanifest',
  icons: {
    icon:        '/favicon.ico',
    shortcut:    '/favicon-16x16.png',
    apple:       '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor:   '#0A0A0A',
  width:        'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme:  'dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className="font-body"
        style={{
          backgroundColor: 'var(--bg-primary)',
          color:           'var(--text-primary)',
          minHeight:       '100dvh',
        }}
      >
        <a
          href="#main-content"
          aria-label="Skip to main content"
          className="skip-link"
        >
          Skip to content
        </a>

        <div
          id="app-root"
          style={{
            display:       'flex',
            flexDirection: 'column',
            minHeight:     '100dvh',
            position:      'relative',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position:        'fixed',
              inset:           0,
              zIndex:          0,
              pointerEvents:   'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat',
              backgroundSize:   '128px 128px',
              opacity:          0.6,
              mixBlendMode:     'overlay',
            }}
          />

          <main
            id="main-content"
            style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            <PageTransition>
              {children}
            </PageTransition>
          </main>
        </div>
      </body>
    </html>
  );
}

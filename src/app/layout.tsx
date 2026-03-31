/**
 * Root Layout Component
 * Wraps entire application with providers and global styles
 * Initializes fonts, metadata, and global settings
 */

import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import AnimationProvider from '@/components/providers/AnimationProvider';
import AuthProvider from '@/components/providers/AuthProvider';
import ToastProvider from '@/components/providers/ToastProvider';
import QueryProvider from '@/components/providers/QueryProvider';
import './globals.css';

/**
 * Load system fonts with optimized subsets
 */
const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-sans',
});

const geist_mono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono',
});

/**
 * Site metadata
 */
export const metadata: Metadata = {
  title: {
    template: '%s | Smart Student Hub',
    default: 'Smart Student Hub - Higher Education Platform',
  },
  description:
    'Production-grade SaaS platform for Higher Education Institutions. Manage student activities, portfolios, and compliance with NAAC/NIRF standards.',
  keywords: [
    'higher education',
    'student engagement',
    'activity tracking',
    'portfolio builder',
    'HEI management',
    'NAAC',
    'NIRF',
  ],
  authors: [{ name: 'Your Organization' }],
  creator: 'Smart Student Hub Team',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://smartstudienthub.com',
    title: 'Smart Student Hub',
    description: 'Higher Education Engagement Platform',
    siteName: 'Smart Student Hub',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Smart Student Hub',
    description: 'Higher Education Engagement Platform',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'Education',
};

/**
 * Viewport configuration
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * Root Layout - Main app wrapper
 * All providers are initialized here
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to critical origins for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" />

        {/* DNS prefetch for external services */}
        <link rel="dns-prefetch" href="https://firebase.google.com" />
        <link rel="dns-prefetch" href="https://cloudinary.com" />

        {/* Apple Touch Icon and Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* PWA Manifest (optional for Phase 1) */}
        <meta name="application-name" content="Smart Student Hub" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Smart Student Hub" />

        {/* Measurement & Analytics (optional, add later) */}
        {/* <script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script> */}
      </head>

      <body className={`${geist.variable} ${geist_mono.variable}`}>
        {/* Providers hierarchy:
            1. AnimationProvider: Lenis smooth scroll, GSAP setup (lowest level)
            2. QueryProvider: TanStack Query state
            3. AuthProvider: Firebase Auth listener
            4. ToastProvider: Global notifications
            
            Providers are ordered from lowest-level (animation) to highest-level (UI)
        */}
        <AnimationProvider>
          <QueryProvider>
            <AuthProvider>
              <ToastProvider>
                <div id="root">{children}</div>
              </ToastProvider>
            </AuthProvider>
          </QueryProvider>
        </AnimationProvider>

        {/* Custom cursor dot (optional, can be added in Phase 1 update) */}
        {/* <CustomCursor /> */}

        {/* Scroll progress indicator (optional) */}
        {/* <ScrollProgressBar /> */}
      </body>
    </html>
  );
}

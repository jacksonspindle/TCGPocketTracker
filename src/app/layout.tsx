import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'PocketTrack - Free Pokemon TCG Pocket Collection Tracker | PTCGP Tracker',
  description: 'Track your Pokemon TCG Pocket collection for free. Manage your PTCGP cards, find the best packs to open, track card rarity & completion stats, and browse your collection in an interactive 3D binder. Supports Genetic Apex, Mythical Island, Space-Time Smackdown & all expansions.',
  keywords: [
    'Pokemon TCG Pocket',
    'PTCGP',
    'PTCGP tracker',
    'Pokemon TCG Pocket collection tracker',
    'Pokemon card tracker',
    'TCG Pocket collection',
    'Pokemon Pocket cards',
    'Genetic Apex',
    'Mythical Island',
    'Space-Time Smackdown',
    'Triumphant Light',
    'Shining Revelry',
    'booster pack tracker',
    'best packs to open',
    'pack odds calculator',
    'card rarity tracker',
    'Pokemon card collection manager',
    'PTCGP collection',
    'free Pokemon tracker',
    'track your cards',
    'complete your sets',
    'Pokemon TCG Pocket wishlist',
    'card completion stats',
  ],
  authors: [{ name: 'PocketTrack' }],
  creator: 'PocketTrack',
  publisher: 'PocketTrack',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'PocketTrack',
    title: 'PocketTrack - Free Pokemon TCG Pocket Collection Tracker | PTCGP',
    description: 'The ultimate free PTCGP collection tracker. Track your Pokemon TCG Pocket cards, find the best packs to open, manage your wishlist, view completion stats by rarity, and browse your collection in an interactive 3D binder.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PocketTrack - Free Pokemon TCG Pocket Collection Tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PocketTrack - Free Pokemon TCG Pocket Collection Tracker',
    description: 'Track your PTCGP collection for free. Find best packs to open, manage your wishlist, view completion stats & browse cards in 3D.',
    images: ['/og-image.png'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#14b8a6' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

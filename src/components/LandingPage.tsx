'use client'

import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

// Dynamically import the binder to avoid SSR issues with Turn.js
const LandingBinder = dynamic(() => import('./LandingBinder'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
})

// Featured cards with varied rarities
const featuredCards = [
  { id: 'A1-231', name: 'Rapidash', image: 'https://assets.tcgdex.net/en/tcgp/A1/231/high.webp', rarity: 'One Star' },
  { id: 'A1-258', name: 'Articuno ex', image: 'https://assets.tcgdex.net/en/tcgp/A1/258/high.webp', rarity: 'Two Star' },
  { id: 'A1-284', name: 'Charizard ex', image: 'https://assets.tcgdex.net/en/tcgp/A1/284/high.webp', rarity: 'Crown Rare' },
  { id: 'A1-280', name: 'Charizard ex', image: 'https://assets.tcgdex.net/en/tcgp/A1/280/high.webp', rarity: 'Three Star' },
]

// Booster packs to showcase
const featuredBoosters = [
  { name: 'Charizard', image: '/boosters/genetic-apex-charizard.webp' },
  { name: 'Mewtwo', image: '/boosters/genetic-apex-mewtwo.webp' },
  { name: 'Crimson Blaze', image: '/boosters/crimson-blaze.webp' },
  { name: 'Pikachu', image: '/boosters/genetic-apex-pikachu.webp' },
  { name: 'Mega Gyarados', image: '/boosters/mega-gyarados.webp' },
]

const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    title: 'Track Your PTCGP Cards',
    description: 'Manage every card you own across all Pokemon TCG Pocket expansions including Genetic Apex, Mythical Island, and Space-Time Smackdown.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: 'Interactive 3D Binder',
    description: 'Browse your collection in a beautiful binder view with realistic page-turning animations.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Completion Stats by Rarity',
    description: 'Track your progress with detailed statistics by set, card rarity, and type. See exactly what you need to complete your sets.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    title: 'Wishlist & Card Hunting',
    description: 'Bookmark cards you want and track what you\'re hunting for. Never forget which cards you need.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Duplicate Tracking',
    description: 'Know exactly how many copies of each card you have. Perfect for managing trades with other collectors.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
      </svg>
    ),
    title: 'Cloud Sync & Backup',
    description: 'Your collection automatically syncs to the cloud. Export your data anytime as a backup.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/pockettrackerIcon.png"
              alt="PocketTrack"
              className="w-10 h-10 rounded-xl"
            />
            <span className="text-xl font-bold text-white">PocketTrack</span>
          </div>
          <button
            onClick={() => signIn('google')}
            className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-all flex items-center gap-2 border border-gray-700"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign In
          </button>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            >
              The Ultimate Free Pokemon TCG Pocket Collection Tracker
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto"
            >
              Track your PTCGP cards, find the best packs to open, manage your wishlist,
              and complete your sets faster. 100% free with cloud sync.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <button
                onClick={() => signIn('google')}
                className="px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white font-semibold text-lg rounded-2xl transition-all"
              >
                Start Tracking - It's Free
              </button>
              <p className="mt-4 text-gray-500 text-sm">No account fees, no credit card required</p>
            </motion.div>
          </div>

          {/* Featured Cards Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 flex justify-center items-end gap-4 md:gap-6"
          >
            {featuredCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 50, rotate: -5 + index * 3 }}
                animate={{ opacity: 1, y: 0, rotate: -6 + index * 4 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                className="relative group"
                style={{
                  transform: `rotate(${-6 + index * 4}deg)`,
                  zIndex: index === 1 || index === 2 ? 10 : 5
                }}
              >
                <img
                  src={card.image}
                  alt={card.name}
                  className="w-32 md:w-44 rounded-xl shadow-2xl transition-transform group-hover:scale-105 group-hover:-translate-y-1"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </header>

      {/* App Preview Section */}
      <section className="py-20 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Manage Your Pokemon TCG Pocket Cards Effortlessly
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              A clean, intuitive interface to track owned cards, filter by rarity, and see your collection progress at a glance.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
              <img
                src="/websiteThumbnail.png"
                alt="PocketTrack app interface showing card collection"
                className="w-full"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Binder Feature Section */}
      <section className="py-20 border-t border-gray-800">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Browse Your PTCGP Collection in 3D
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              View your Pokemon TCG Pocket cards in a beautiful interactive binder with realistic page-turning animations.
            </p>
          </div>
          <LandingBinder />
        </div>
      </section>

      {/* Booster Packs Section */}
      <section className="py-20 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Every Pokemon TCG Pocket Expansion Supported
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Track cards from every booster pack including Genetic Apex, Mythical Island,
              Space-Time Smackdown, Triumphant Light, Shining Revelry, and all future expansions.
            </p>
          </div>
          <div className="relative h-48 md:h-64 max-w-2xl mx-auto">
            {featuredBoosters.map((booster, index) => {
              // Create a scattered pile arrangement with overlapping packs
              // Each has unique hover behavior for more organic feel
              const configs = [
                { left: '8%', top: '25%', rotate: -12, z: 2, hoverRotate: 3, hoverScale: 1.18, hoverY: -15 },
                { left: '22%', top: '8%', rotate: -5, z: 4, hoverRotate: -2, hoverScale: 1.12, hoverY: -8 },
                { left: '40%', top: '0%', rotate: 2, z: 5, hoverRotate: -1, hoverScale: 1.2, hoverY: -12 },
                { left: '58%', top: '10%', rotate: 8, z: 3, hoverRotate: 2, hoverScale: 1.14, hoverY: -18 },
                { left: '75%', top: '28%', rotate: 14, z: 1, hoverRotate: 5, hoverScale: 1.16, hoverY: -10 },
              ]
              const config = configs[index]

              return (
                <motion.div
                  key={booster.name}
                  initial={{ opacity: 0, y: 40, rotate: 0 }}
                  whileInView={{ opacity: 1, y: 0, rotate: config.rotate }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  viewport={{ once: true }}
                  className="absolute cursor-pointer hover:!z-20"
                  style={{
                    left: config.left,
                    top: config.top,
                    zIndex: config.z,
                    transform: `rotate(${config.rotate}deg)`,
                  }}
                  whileHover={{
                    scale: config.hoverScale,
                    rotate: config.hoverRotate,
                    y: config.hoverY,
                    transition: { duration: 0.2 }
                  }}
                >
                  <img
                    src={booster.image}
                    alt={`${booster.name} Booster Pack`}
                    className="w-16 md:w-28 drop-shadow-2xl"
                  />
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to Complete Your Sets
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Powerful collection tracking features designed specifically for Pokemon TCG Pocket players.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="p-6 bg-gray-900 rounded-2xl border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="w-14 h-14 bg-gray-800 rounded-xl flex items-center justify-center text-blue-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-500">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Start Tracking Your PTCGP Collection Today
          </h2>
          <p className="text-xl text-gray-500 mb-10">
            Join thousands of Pokemon TCG Pocket players who use PocketTrack
            to track their cards, complete their sets, and manage their collection.
          </p>
          <button
            onClick={() => signIn('google')}
            className="px-10 py-4 bg-blue-500 hover:bg-blue-400 text-white font-semibold text-lg rounded-2xl transition-all"
          >
            Start Tracking - It's Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/pockettrackerIcon.png"
                alt="PocketTrack"
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-white font-semibold">PocketTrack</span>
            </div>
            <p className="text-gray-600 text-sm">
              Pokemon and Pokemon TCG Pocket are trademarks of Nintendo/Creatures Inc./GAME FREAK inc.
              This is an unofficial fan project.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

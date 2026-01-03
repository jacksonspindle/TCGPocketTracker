'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Script from 'next/script'
import { motion } from 'framer-motion'

const CARDS_PER_PAGE = 9

// Curated 2-star and 3-star cards for the landing page showcase
const showcaseCards = [
  // Page 1 - Mix of 2-star Pokemon
  { id: 'A1-251', name: 'Venusaur ex', image: 'https://assets.tcgdex.net/en/tcgp/A1/251/high.webp' },
  { id: 'A1-252', name: 'Exeggutor ex', image: 'https://assets.tcgdex.net/en/tcgp/A1/252/high.webp' },
  { id: 'A1-253', name: 'Charizard ex', image: 'https://assets.tcgdex.net/en/tcgp/A1/253/high.webp' },
  { id: 'A1-254', name: 'Arcanine ex', image: 'https://assets.tcgdex.net/en/tcgp/A1/254/high.webp' },
  { id: 'A1-255', name: 'Moltres ex', image: 'https://assets.tcgdex.net/en/tcgp/A1/255/high.webp' },
  { id: 'A1-256', name: 'Blastoise ex', image: 'https://assets.tcgdex.net/en/tcgp/A1/256/high.webp' },
  { id: 'A1-258', name: 'Articuno ex', image: 'https://assets.tcgdex.net/en/tcgp/A1/258/high.webp' },
  { id: 'A1-260', name: 'Zapdos ex', image: 'https://assets.tcgdex.net/en/tcgp/A1/260/high.webp' },
  { id: 'A1-262', name: 'Mewtwo ex', image: 'https://assets.tcgdex.net/en/tcgp/A1/262/high.webp' },
  // Page 2 - More 2-star Pokemon and Trainers
  { id: 'A1-263', name: 'Machamp ex', image: 'https://assets.tcgdex.net/en/tcgp/A1/263/high.webp' },
  { id: 'A1-264', name: 'Marowak ex', image: 'https://assets.tcgdex.net/en/tcgp/A1/264/high.webp' },
  { id: 'A1-266', name: 'Erika', image: 'https://assets.tcgdex.net/en/tcgp/A1/266/high.webp' },
  { id: 'A1-267', name: 'Misty', image: 'https://assets.tcgdex.net/en/tcgp/A1/267/high.webp' },
  { id: 'A1-270', name: 'Giovanni', image: 'https://assets.tcgdex.net/en/tcgp/A1/270/high.webp' },
  { id: 'A1-277', name: 'Gengar ex', image: 'https://assets.tcgdex.net/en/tcgp/A1/277/high.webp' },
  { id: 'A1-268', name: 'Blaine', image: 'https://assets.tcgdex.net/en/tcgp/A1/268/high.webp' },
  { id: 'A1-269', name: 'Koga', image: 'https://assets.tcgdex.net/en/tcgp/A1/269/high.webp' },
  { id: 'A1-271', name: 'Brock', image: 'https://assets.tcgdex.net/en/tcgp/A1/271/high.webp' },
  // Page 3 - 3-star cards (the premium ones)
  { id: 'A1-280', name: 'Charizard ex', image: 'https://assets.tcgdex.net/en/tcgp/A1/280/high.webp' },
  { id: 'A1-281', name: 'Pikachu ex', image: 'https://assets.tcgdex.net/en/tcgp/A1/281/high.webp' },
  { id: 'A1-282', name: 'Mewtwo ex', image: 'https://assets.tcgdex.net/en/tcgp/A1/282/high.webp' },
  { id: 'A1-283', name: 'Mew', image: 'https://assets.tcgdex.net/en/tcgp/A1/283/high.webp' },
  { id: 'A1-272', name: 'Lt. Surge', image: 'https://assets.tcgdex.net/en/tcgp/A1/272/high.webp' },
  { id: 'A1-273', name: 'Sabrina', image: 'https://assets.tcgdex.net/en/tcgp/A1/273/high.webp' },
  { id: 'A1-274', name: 'Starmie ex', image: 'https://assets.tcgdex.net/en/tcgp/A1/274/high.webp' },
  { id: 'A1-275', name: 'Gyarados ex', image: 'https://assets.tcgdex.net/en/tcgp/A1/275/high.webp' },
  { id: 'A1-276', name: 'Alakazam ex', image: 'https://assets.tcgdex.net/en/tcgp/A1/276/high.webp' },
  // Page 4 - More 2-star and 3-star mix
  { id: 'A1-257', name: 'Starmie ex', image: 'https://assets.tcgdex.net/en/tcgp/A1/257/high.webp' },
  { id: 'A1-259', name: 'Gyarados ex', image: 'https://assets.tcgdex.net/en/tcgp/A1/259/high.webp' },
  { id: 'A1-261', name: 'Alakazam ex', image: 'https://assets.tcgdex.net/en/tcgp/A1/261/high.webp' },
  { id: 'A1-278', name: 'Dragonite ex', image: 'https://assets.tcgdex.net/en/tcgp/A1/278/high.webp' },
  { id: 'A1-279', name: 'Wigglytuff ex', image: 'https://assets.tcgdex.net/en/tcgp/A1/279/high.webp' },
  { id: 'A1a-080', name: 'Aerodactyl ex', image: 'https://assets.tcgdex.net/en/tcgp/A1a/080/high.webp' },
  { id: 'A1a-081', name: 'Mew ex', image: 'https://assets.tcgdex.net/en/tcgp/A1a/081/high.webp' },
  { id: 'A1a-082', name: 'Celebi ex', image: 'https://assets.tcgdex.net/en/tcgp/A1a/082/high.webp' },
  { id: 'A1a-083', name: 'Mew ex', image: 'https://assets.tcgdex.net/en/tcgp/A1a/083/high.webp' },
]

// Split cards into pages
function splitIntoPages(cards: typeof showcaseCards): typeof showcaseCards[] {
  const pages: typeof showcaseCards[] = []
  for (let i = 0; i < cards.length; i += CARDS_PER_PAGE) {
    pages.push(cards.slice(i, i + CARDS_PER_PAGE))
  }
  return pages
}

export default function LandingBinder() {
  const flipbookRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState(2) // Start on page 2
  const [isReady, setIsReady] = useState(false)
  const [scriptsLoaded, setScriptsLoaded] = useState(() => {
    if (typeof window !== 'undefined') {
      const hasJQuery = !!(window as any).jQuery
      const hasTurn = hasJQuery && typeof (window as any).jQuery.fn?.turn === 'function'
      return { jquery: hasJQuery, turn: hasTurn }
    }
    return { jquery: false, turn: false }
  })
  const turnInstanceRef = useRef<any>(null)

  const pages = splitIntoPages(showcaseCards)
  const totalPages = pages.length

  // Check if scripts are already loaded on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasJQuery = !!(window as any).jQuery
      const hasTurn = hasJQuery && typeof (window as any).jQuery.fn?.turn === 'function'
      if (hasJQuery || hasTurn) {
        setScriptsLoaded({ jquery: hasJQuery, turn: hasTurn })
      }
    }
  }, [])

  // Initialize Turn.js
  useEffect(() => {
    if (!scriptsLoaded.jquery || !scriptsLoaded.turn) return
    if (!flipbookRef.current) return

    const $ = (window as any).jQuery || (window as any).$
    if (!$) return

    const timer = setTimeout(() => {
      try {
        if (!flipbookRef.current) return

        const $flipbook = $(flipbookRef.current)

        if (typeof $flipbook.turn !== 'function') return

        if ($flipbook.data()?.turn) {
          setIsReady(true)
          turnInstanceRef.current = $flipbook
          return
        }

        $flipbook.turn({
          width: 800,
          height: 500,
          page: 2, // Start on page 2
          autoCenter: true,
          acceleration: true,
          gradients: true,
          elevation: 50,
          duration: 800,
          when: {
            turned: function(_event: any, page: number) {
              setCurrentPage(page)
            }
          }
        })

        turnInstanceRef.current = $flipbook
        setIsReady(true)
      } catch (e) {
        console.error('Error initializing Turn.js:', e)
      }
    }, 200)

    return () => {
      clearTimeout(timer)
      if (turnInstanceRef.current) {
        try {
          if (turnInstanceRef.current.data()?.turn) {
            turnInstanceRef.current.turn('destroy')
          }
        } catch (e) {}
        turnInstanceRef.current = null
        setIsReady(false)
      }
    }
  }, [scriptsLoaded])

  const goNext = useCallback(() => {
    if (turnInstanceRef.current) {
      turnInstanceRef.current.turn('next')
    }
  }, [])

  const goPrevious = useCallback(() => {
    if (turnInstanceRef.current) {
      turnInstanceRef.current.turn('previous')
    }
  }, [])

  const currentSpread = Math.floor(currentPage / 2)
  const totalSpreads = Math.ceil(totalPages / 2)
  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="relative w-full flex flex-col items-center"
    >
      {/* Load jQuery */}
      {!scriptsLoaded.jquery && (
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"
          strategy="afterInteractive"
          onLoad={() => setScriptsLoaded(prev => ({ ...prev, jquery: true }))}
        />
      )}

      {/* Load Turn.js */}
      {scriptsLoaded.jquery && !scriptsLoaded.turn && (
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/turn.js/3/turn.min.js"
          strategy="afterInteractive"
          onLoad={() => setScriptsLoaded(prev => ({ ...prev, turn: true }))}
        />
      )}

      {/* Loading state */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Flipbook */}
      <div
        className="rounded-2xl overflow-hidden shadow-2xl"
        style={{
          visibility: isReady ? 'visible' : 'hidden',
        }}
      >
        <div
          ref={flipbookRef}
          className="flipbook"
          style={{
            width: 800,
            height: 500,
            opacity: isReady ? 1 : 0,
            transition: 'opacity 0.15s ease-in'
          }}
        >
          {pages.map((pageCards, pageIndex) => (
            <div
              key={pageIndex}
              className="page rounded-xl overflow-hidden"
              style={{
                backgroundColor: '#1a1a1a',
                backgroundImage: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 50%, #2a2a2a 100%)'
              }}
            >
              <div className="page-content p-3 h-full">
                <div className="grid grid-cols-3 grid-rows-3 gap-2 h-full">
                  {pageCards.map((card) => (
                    <div
                      key={card.id}
                      className="relative rounded-lg overflow-hidden"
                      style={{
                        background: 'linear-gradient(145deg, #3a3a3a, #252525)',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(255,255,255,0.1)',
                        padding: '3px'
                      }}
                    >
                      <div
                        className="w-full h-full rounded"
                        style={{
                          background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 20%)',
                        }}
                      >
                        <img
                          src={card.image}
                          alt={card.name}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  ))}
                  {/* Fill empty slots */}
                  {Array.from({ length: CARDS_PER_PAGE - pageCards.length }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="rounded-lg"
                      style={{
                        background: 'linear-gradient(145deg, #3a3a3a, #252525)',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(255,255,255,0.1)',
                        padding: '3px'
                      }}
                    >
                      <div
                        className="w-full h-full rounded"
                        style={{
                          background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.1) 100%)',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={goPrevious}
          disabled={!canGoPrevious}
          className="p-3 rounded-xl bg-gray-800 border border-gray-700 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span className="text-gray-400 text-sm font-medium min-w-[100px] text-center">
          Page {currentSpread + 1} of {totalSpreads}
        </span>

        <button
          onClick={goNext}
          disabled={!canGoNext}
          className="p-3 rounded-xl bg-gray-800 border border-gray-700 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </motion.div>
  )
}

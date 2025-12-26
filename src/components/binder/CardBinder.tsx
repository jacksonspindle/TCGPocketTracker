'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import Script from 'next/script'
import { Card } from '@/types'
import { useCollection } from '@/context/CollectionContext'
import BinderControls from './BinderControls'
import { CARDS_PER_PAGE } from './binderUtils'

interface CardBinderProps {
  cards: Card[]
  onCardClick: (card: Card) => void
  loading?: boolean
}

function BinderLoadingSkeleton() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl">
      <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gray-500 dark:text-gray-400 text-sm">Loading Binder...</p>
    </div>
  )
}

function EmptyBinder() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl p-8">
      <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
      <p className="text-gray-600 dark:text-gray-300 text-center">
        No cards to display. Try adjusting your filters.
      </p>
    </div>
  )
}

// Split cards into pages (9 cards per page)
function splitIntoPages(cards: Card[]): Card[][] {
  const pages: Card[][] = []
  for (let i = 0; i < cards.length; i += CARDS_PER_PAGE) {
    pages.push(cards.slice(i, i + CARDS_PER_PAGE))
  }
  return pages
}

export default function CardBinder({ cards, onCardClick, loading }: CardBinderProps) {
  const flipbookRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isReady, setIsReady] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false) // Track if we've ever initialized
  const [scriptsLoaded, setScriptsLoaded] = useState(() => {
    // Check if scripts are already loaded (e.g., when returning to tab)
    if (typeof window !== 'undefined') {
      const hasJQuery = !!(window as any).jQuery
      const hasTurn = hasJQuery && typeof (window as any).jQuery.fn?.turn === 'function'
      return { jquery: hasJQuery, turn: hasTurn }
    }
    return { jquery: false, turn: false }
  })
  const turnInstanceRef = useRef<any>(null)
  const { isOwned } = useCollection()

  // Split cards into pages
  const pages = useMemo(() => splitIntoPages(cards), [cards])
  const totalPages = pages.length
  const totalSpreads = Math.ceil(totalPages / 2)

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

  // Create a stable key for the flipbook based on cards to force remount on filter changes
  const flipbookKey = useMemo(() => {
    return cards.length + '-' + (cards[0]?.id || 'empty')
  }, [cards])

  // Reset to page 1 when cards change (filter applied)
  useEffect(() => {
    setCurrentPage(1)
    setIsReady(false)
  }, [flipbookKey])

  // Initialize Turn.js once both scripts are loaded
  useEffect(() => {
    if (!scriptsLoaded.jquery || !scriptsLoaded.turn) return
    if (loading || cards.length === 0 || !flipbookRef.current) return

    const $ = (window as any).jQuery || (window as any).$
    if (!$) {
      console.error('jQuery not available')
      return
    }

    // Small delay to ensure DOM is fully ready
    const timer = setTimeout(() => {
      try {
        if (!flipbookRef.current) return

        const $flipbook = $(flipbookRef.current)

        // Check if turn is available
        if (typeof $flipbook.turn !== 'function') {
          console.error('Turn.js not loaded properly')
          return
        }

        // Check if already initialized
        if ($flipbook.data()?.turn) {
          setIsReady(true)
          turnInstanceRef.current = $flipbook
          return
        }

        // Initialize Turn.js
        $flipbook.turn({
          width: 1000,
          height: 620,
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
        $flipbook.addClass('turn-ready')
        setIsReady(true)
        setHasInitialized(true)
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
        } catch (e) {
          // Ignore cleanup errors
        }
        turnInstanceRef.current = null
        setIsReady(false)
      }
    }
  }, [scriptsLoaded, loading, flipbookKey])

  // Navigation handlers
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goNext()
      } else if (e.key === 'ArrowLeft') {
        goPrevious()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goNext, goPrevious])

  if (loading) {
    return <BinderLoadingSkeleton />
  }

  if (cards.length === 0) {
    return <EmptyBinder />
  }

  const currentSpread = Math.floor(currentPage / 2)
  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center rounded-xl overflow-hidden">
      {/* Load jQuery first (only if not already loaded) */}
      {!scriptsLoaded.jquery && (
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"
          strategy="afterInteractive"
          onLoad={() => setScriptsLoaded(prev => ({ ...prev, jquery: true }))}
        />
      )}

      {/* Load Turn.js after jQuery (only if not already loaded) */}
      {scriptsLoaded.jquery && !scriptsLoaded.turn && (
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/turn.js/3/turn.min.js"
          strategy="afterInteractive"
          onLoad={() => setScriptsLoaded(prev => ({ ...prev, turn: true }))}
        />
      )}

      {/* Loading state - only show on first load */}
      {!isReady && !hasInitialized && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Flipbook Container */}
      <div className="flex-1 flex items-center justify-center w-full py-4">
        <div
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{
            padding: 0,
            visibility: isReady ? 'visible' : 'hidden',
            position: 'relative',
          }}
        >
          <div
            key={flipbookKey}
            ref={flipbookRef}
            className="flipbook"
            style={{
              width: 1000,
              height: 620,
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
              <div className="page-content p-4 h-full">
                <div className="grid grid-cols-3 grid-rows-3 gap-3 h-full">
                  {pageCards.map((card) => {
                    const owned = isOwned(card.id)
                    return (
                      <div
                        key={card.id}
                        className="relative rounded-lg overflow-hidden"
                        style={{
                          background: 'linear-gradient(145deg, #3a3a3a, #252525)',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(255,255,255,0.1)',
                          padding: '4px'
                        }}
                      >
                        {/* Card sleeve pocket effect */}
                        <div
                          className={`
                            w-full h-full rounded cursor-pointer
                            transition-transform hover:scale-105 hover:z-10
                            ${!owned ? 'grayscale opacity-40' : ''}
                          `}
                          style={{
                            background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 20%)',
                          }}
                          onClick={() => onCardClick(card)}
                        >
                          {card.image ? (
                            <img
                              src={`${card.image}/high.webp`}
                              alt={card.name}
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-neutral-500 text-xs font-medium rounded">
                              {card.localId}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {/* Fill empty slots - empty card sleeves */}
                  {Array.from({ length: CARDS_PER_PAGE - pageCards.length }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="rounded-lg"
                      style={{
                        background: 'linear-gradient(145deg, #3a3a3a, #252525)',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(255,255,255,0.1)',
                        padding: '4px'
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
      </div>

      {/* Navigation Controls */}
      <BinderControls
        currentSpread={currentSpread}
        totalSpreads={totalSpreads}
        onPrevious={goPrevious}
        onNext={goNext}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        isAnimating={false}
      />

      {/* Keyboard Hints */}
      <div className="absolute top-4 right-4 text-xs text-gray-400">
        <span className="hidden sm:inline">Use ← → arrow keys to navigate</span>
      </div>
    </div>
  )
}

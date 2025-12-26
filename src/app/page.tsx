'use client'

import { useState, useEffect, useMemo } from 'react'
import { getAllTCGPocketSets, getAllCards } from '@/services/api'
import { Card, TCGPocketSet, FilterOptions, SortOptions } from '@/types'
import CardGrid from '@/components/CardGrid'
import TrainerGallery from '@/components/TrainerGallery'
import { CardBinder } from '@/components/binder'
import CardDetailPanel from '@/components/CardDetailPanel'
import SetSelector, { ALL_SETS_ID } from '@/components/SetSelector'
import FilterControls from '@/components/FilterControls'
import CollectionStats from '@/components/CollectionStats'
import ChatPanel from '@/components/chat/ChatPanel'
import ChatToggleButton from '@/components/chat/ChatToggleButton'
import UserMenu from '@/components/UserMenu'
import ThemeToggle from '@/components/ThemeToggle'
import { useCollection } from '@/context/CollectionContext'
import { useWishlist } from '@/context/WishlistContext'
import { boosterToSetId, singleBoosterSets } from '@/data/boosters'

const RARITY_ORDER: Record<string, number> = {
  'One Diamond': 1,
  'Two Diamond': 2,
  'Three Diamond': 3,
  'Four Diamond': 4,
  'One Star': 5,
  'Two Star': 6,
  'Three Star': 7,
  'Crown Rare': 8,
}

export default function Home() {
  const [sets, setSets] = useState<TCGPocketSet[]>([])
  const [selectedBoosterId, setSelectedBoosterId] = useState<string>(ALL_SETS_ID)
  const [allCards, setAllCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState({ loaded: 0, total: 0 })
  const [error, setError] = useState<string | null>(null)
  const [collectionFilter, setCollectionFilter] = useState<'all' | 'owned' | 'missing' | 'wishlist'>('all')
  const [gridSize, setGridSize] = useState(5)
  const [activeView, setActiveView] = useState<'cards' | 'trainers' | 'binder'>('cards')
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)

  const { isOwned, addCards, removeCards } = useCollection()
  const { isWishlisted } = useWishlist()

  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    rarity: '',
    type: '',
    stage: '',
  })

  const [sort, setSort] = useState<SortOptions>({
    field: 'localId',
    order: 'asc',
  })

  // Fetch all data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        const fetchedSets = await getAllTCGPocketSets()
        setSets(fetchedSets)

        const fetchedCards = await getAllCards((loaded, total) => {
          setLoadingProgress({ loaded, total })
        }, fetchedSets)
        setAllCards(fetchedCards)
      } catch (err) {
        setError('Failed to load data. Please try again later.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filter cards by selected booster
  const boosterCards = useMemo(() => {
    if (selectedBoosterId === ALL_SETS_ID) {
      return allCards
    }

    const setId = boosterToSetId[selectedBoosterId]

    if (setId && singleBoosterSets.has(setId)) {
      return allCards.filter(card => card.set.id === setId)
    }

    return allCards.filter(card =>
      card.boosters?.some(booster => booster.id === selectedBoosterId)
    )
  }, [allCards, selectedBoosterId])

  // Get unique filter options from current cards
  const availableTypes = useMemo(() => {
    const types = new Set<string>()
    boosterCards.forEach((card) => {
      // Add Pokemon energy types
      card.types?.forEach((type) => types.add(type))
      // Add Trainer types (Supporter, Item, etc.)
      if (card.category === 'Trainer' && card.trainerType) {
        types.add(card.trainerType)
      }
    })
    // Sort with Trainer types at the end
    const trainerTypes = ['Supporter', 'Item', 'Tool', 'Stadium']
    return Array.from(types).sort((a, b) => {
      const aIsTrainer = trainerTypes.includes(a)
      const bIsTrainer = trainerTypes.includes(b)
      if (aIsTrainer && !bIsTrainer) return 1
      if (!aIsTrainer && bIsTrainer) return -1
      return a.localeCompare(b)
    })
  }, [boosterCards])

  const availableRarities = useMemo(() => {
    const rarities = new Set<string>()
    boosterCards.forEach((card) => {
      if (card.rarity) rarities.add(card.rarity)
    })
    return Array.from(rarities).sort((a, b) => {
      return (RARITY_ORDER[a] || 99) - (RARITY_ORDER[b] || 99)
    })
  }, [boosterCards])

  const availableStages = useMemo(() => {
    const stages = new Set<string>()
    boosterCards.forEach((card) => {
      if (card.stage) stages.add(card.stage)
    })
    return Array.from(stages).sort()
  }, [boosterCards])

  // Filter and sort cards
  const filteredCards = useMemo(() => {
    let result = [...boosterCards]

    if (collectionFilter === 'owned') {
      result = result.filter((card) => isOwned(card.id))
    } else if (collectionFilter === 'missing') {
      result = result.filter((card) => !isOwned(card.id))
    } else if (collectionFilter === 'wishlist') {
      result = result.filter((card) => isWishlisted(card.id))
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter((card) =>
        card.name.toLowerCase().includes(searchLower)
      )
    }

    if (filters.type) {
      const trainerTypes = ['Supporter', 'Item', 'Tool', 'Stadium']
      if (trainerTypes.includes(filters.type)) {
        // Filter by trainer type
        result = result.filter((card) =>
          card.category === 'Trainer' && card.trainerType === filters.type
        )
      } else {
        // Filter by Pokemon energy type
        result = result.filter((card) =>
          card.types?.includes(filters.type)
        )
      }
    }

    if (filters.rarity) {
      result = result.filter((card) => card.rarity === filters.rarity)
    }

    if (filters.stage) {
      result = result.filter((card) => card.stage === filters.stage)
    }

    result.sort((a, b) => {
      let comparison = 0

      switch (sort.field) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'hp':
          comparison = (a.hp || 0) - (b.hp || 0)
          break
        case 'rarity':
          comparison = (RARITY_ORDER[a.rarity || ''] || 99) - (RARITY_ORDER[b.rarity || ''] || 99)
          break
        case 'localId':
        default:
          comparison = a.localId.localeCompare(b.localId, undefined, { numeric: true })
          break
      }

      return sort.order === 'asc' ? comparison : -comparison
    })

    return result
  }, [boosterCards, filters, sort, collectionFilter, isOwned, isWishlisted])

  // Get display name for current selection
  const displayName = useMemo(() => {
    if (selectedBoosterId === ALL_SETS_ID) {
      return 'All Sets'
    }

    for (const set of sets) {
      const booster = set.boosters?.find(b => b.id === selectedBoosterId)
      if (booster) {
        return `${set.name} - ${booster.name}`
      }
    }

    return selectedBoosterId
  }, [selectedBoosterId, sets])

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header className="sku-card mx-4 mt-4 mb-6 p-4 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">My Cards</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <ChatToggleButton />
            <UserMenu />
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setActiveView('cards')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeView === 'cards'
                ? 'bg-teal-500 text-white shadow-md'
                : 'sku-button text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Cards
            </span>
          </button>
          <button
            onClick={() => setActiveView('trainers')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeView === 'trainers'
                ? 'bg-purple-500 text-white shadow-md'
                : 'sku-button text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Trainer Gallery
            </span>
          </button>
          <button
            onClick={() => setActiveView('binder')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeView === 'binder'
                ? 'bg-amber-500 text-white shadow-md'
                : 'sku-button text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Binder
            </span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 space-y-4">
        {error && (
          <div className="sku-card p-4 border-l-4 border-red-400">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Loading Progress */}
        {loading && loadingProgress.total > 0 && (
          <div className="sku-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 dark:text-gray-200 font-medium">Loading all cards...</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {loadingProgress.loaded} / {loadingProgress.total} sets
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${(loadingProgress.loaded / loadingProgress.total) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Trainer Gallery View */}
        {activeView === 'trainers' && (
          <TrainerGallery cards={allCards} loading={loading} onCardClick={setSelectedCard} />
        )}

        {/* Binder View */}
        {activeView === 'binder' && (
          <>
            {/* Set Selector */}
            <section>
              <SetSelector
                sets={sets}
                cards={allCards}
                selectedBoosterId={selectedBoosterId}
                onSelectBooster={setSelectedBoosterId}
                loading={loading}
              />
            </section>

            {/* Filters */}
            <FilterControls
              filters={filters}
              sort={sort}
              onFilterChange={setFilters}
              onSortChange={setSort}
              availableTypes={availableTypes}
              availableRarities={availableRarities}
              availableStages={availableStages}
              collectionFilter={collectionFilter}
              onCollectionFilterChange={setCollectionFilter}
              gridSize={gridSize}
              onGridSizeChange={setGridSize}
            />

            {/* 3D Binder */}
            <div className="h-[600px] relative">
              <CardBinder
                cards={filteredCards}
                onCardClick={setSelectedCard}
                loading={loading}
              />
            </div>
          </>
        )}

        {/* Cards View */}
        {activeView === 'cards' && (
          <>
            {/* Set Selector */}
            <section>
              <SetSelector
                sets={sets}
                cards={allCards}
                selectedBoosterId={selectedBoosterId}
                onSelectBooster={setSelectedBoosterId}
                loading={loading}
              />
            </section>

            {/* Collection Stats */}
            {!loading && boosterCards.length > 0 && (
              <CollectionStats cards={boosterCards} setName={displayName} />
            )}

            {/* Filters */}
            <FilterControls
              filters={filters}
              sort={sort}
              onFilterChange={setFilters}
              onSortChange={setSort}
              availableTypes={availableTypes}
              availableRarities={availableRarities}
              availableStages={availableStages}
              collectionFilter={collectionFilter}
              onCollectionFilterChange={setCollectionFilter}
              gridSize={gridSize}
              onGridSizeChange={setGridSize}
            />

            {/* Results Count and Bulk Actions */}
            {!loading && (
              <div className="flex items-center justify-between">
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Showing {filteredCards.length} of {boosterCards.length} cards
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => addCards(filteredCards.map(c => c.id))}
                    className="sku-button px-3 py-1.5 text-xs font-medium text-teal-600 hover:text-teal-700"
                  >
                    Add All
                  </button>
                  <button
                    onClick={() => removeCards(filteredCards.map(c => c.id))}
                    className="sku-button px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
                  >
                    Remove All
                  </button>
                </div>
              </div>
            )}

            {/* Card Grid */}
            <CardGrid cards={filteredCards} loading={loading} gridSize={gridSize} onCardClick={setSelectedCard} />
          </>
        )}
      </main>

      {/* Chat Panel */}
      <ChatPanel cards={allCards} sets={sets} />

      {/* Card Detail Panel */}
      <CardDetailPanel card={selectedCard} onClose={() => setSelectedCard(null)} />
    </div>
  )
}

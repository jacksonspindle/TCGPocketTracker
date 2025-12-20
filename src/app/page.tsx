'use client'

import { useState, useEffect, useMemo } from 'react'
import { getAllTCGPocketSets, getAllCards } from '@/services/api'
import { Card, TCGPocketSet, FilterOptions, SortOptions } from '@/types'
import CardGrid from '@/components/CardGrid'
import SetSelector, { ALL_SETS_ID } from '@/components/SetSelector'
import FilterControls from '@/components/FilterControls'
import CollectionStats from '@/components/CollectionStats'
import ChatPanel from '@/components/chat/ChatPanel'
import ChatToggleButton from '@/components/chat/ChatToggleButton'
import UserMenu from '@/components/UserMenu'
import { useCollection } from '@/context/CollectionContext'
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
  const [showOwnedOnly, setShowOwnedOnly] = useState(false)
  const [gridSize, setGridSize] = useState(5)

  const { isOwned, addCards, removeCards } = useCollection()

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
      card.types?.forEach((type) => types.add(type))
    })
    return Array.from(types).sort()
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

    if (showOwnedOnly) {
      result = result.filter((card) => isOwned(card.id))
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter((card) =>
        card.name.toLowerCase().includes(searchLower)
      )
    }

    if (filters.type) {
      result = result.filter((card) =>
        card.types?.includes(filters.type)
      )
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
  }, [boosterCards, filters, sort, showOwnedOnly, isOwned])

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
            <h1 className="text-2xl font-bold text-gray-800">My Cards</h1>
          </div>
          <div className="flex items-center gap-3">
            <ChatToggleButton />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 space-y-4">
        {error && (
          <div className="sku-card p-4 border-l-4 border-red-400">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

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

        {/* Loading Progress */}
        {loading && loadingProgress.total > 0 && (
          <div className="sku-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 font-medium">Loading all cards...</span>
              <span className="text-gray-500 text-sm">
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
          showOwnedOnly={showOwnedOnly}
          onToggleOwnedOnly={() => setShowOwnedOnly(!showOwnedOnly)}
          gridSize={gridSize}
          onGridSizeChange={setGridSize}
        />

        {/* Results Count and Bulk Actions */}
        {!loading && (
          <div className="flex items-center justify-between">
            <p className="text-gray-500 text-sm font-medium">
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
        <CardGrid cards={filteredCards} loading={loading} gridSize={gridSize} />
      </main>

      {/* Chat Panel */}
      <ChatPanel cards={allCards} sets={sets} />
    </div>
  )
}

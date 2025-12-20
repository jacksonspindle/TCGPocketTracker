'use client'

import { createContext, useContext, ReactNode, useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { Collection } from '../types'

interface CollectionContextType {
  collection: Collection
  toggleCard: (cardId: string) => void
  isOwned: (cardId: string) => boolean
  getOwnedCount: (cardIds: string[]) => number
  addCards: (cardIds: string[]) => void
  removeCards: (cardIds: string[]) => void
  clearCollection: () => void
  isSyncing: boolean
  importLocalCollection: () => Promise<void>
  hasLocalCollection: boolean
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined)

export function CollectionProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [localCollection, setLocalCollection] = useLocalStorage<Collection>('tcg-pocket-collection', {})
  const [dbCollection, setDbCollection] = useState<Collection | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const fetchedRef = useRef(false)

  const isLoggedIn = status === 'authenticated' && !!session?.user

  // Merge collections: show local immediately, overlay DB data when available
  // This prevents the "flash" of empty collection while waiting for DB
  const collection = useMemo(() => {
    if (!isLoggedIn) return localCollection
    // If DB hasn't loaded yet, show local collection (fast initial render)
    if (dbCollection === null) return localCollection
    // Once DB loads, use DB as source of truth
    return dbCollection
  }, [isLoggedIn, localCollection, dbCollection])

  // Memoize this expensive check
  const hasLocalCollection = useMemo(() => {
    return Object.values(localCollection).some(owned => owned)
  }, [localCollection])

  // Fetch collection from database when user logs in
  useEffect(() => {
    if (!isLoggedIn) {
      setDbCollection(null)
      fetchedRef.current = false
      return
    }

    // Prevent duplicate fetches
    if (fetchedRef.current) return
    fetchedRef.current = true

    async function fetchCollection() {
      try {
        const response = await fetch('/api/collection')
        if (response.ok) {
          const data = await response.json()
          const collectionMap: Collection = {}
          for (const cardId of data.cards) {
            collectionMap[cardId] = true
          }
          setDbCollection(collectionMap)
        }
      } catch (error) {
        console.error('Failed to fetch collection:', error)
        // On error, fall back to local collection
        setDbCollection(localCollection)
      }
    }

    fetchCollection()
  }, [isLoggedIn, localCollection])

  // Fire-and-forget sync to database (don't await)
  const syncCardToDb = useCallback((cardId: string, owned: boolean) => {
    if (!isLoggedIn) return

    fetch('/api/collection', {
      method: owned ? 'POST' : 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId }),
    }).catch(error => {
      console.error('Failed to sync card:', error)
    })
  }, [isLoggedIn])

  const toggleCard = useCallback((cardId: string) => {
    const newOwned = !collection[cardId]

    if (isLoggedIn && dbCollection !== null) {
      setDbCollection(prev => prev ? { ...prev, [cardId]: newOwned } : { [cardId]: newOwned })
      syncCardToDb(cardId, newOwned)
    } else {
      setLocalCollection(prev => ({ ...prev, [cardId]: newOwned }))
    }
  }, [collection, isLoggedIn, dbCollection, syncCardToDb, setLocalCollection])

  const isOwned = useCallback((cardId: string) => {
    return collection[cardId] === true
  }, [collection])

  const getOwnedCount = useCallback((cardIds: string[]) => {
    return cardIds.filter(id => collection[id]).length
  }, [collection])

  const addCards = useCallback((cardIds: string[]) => {
    if (isLoggedIn && dbCollection !== null) {
      setDbCollection(prev => {
        const updated = { ...(prev || {}) }
        for (const id of cardIds) {
          updated[id] = true
        }
        return updated
      })

      // Fire-and-forget bulk sync
      fetch('/api/collection/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardIds }),
      }).catch(error => {
        console.error('Failed to bulk add cards:', error)
      })
    } else {
      setLocalCollection(prev => {
        const updated = { ...prev }
        for (const id of cardIds) {
          updated[id] = true
        }
        return updated
      })
    }
  }, [isLoggedIn, dbCollection, setLocalCollection])

  const removeCards = useCallback((cardIds: string[]) => {
    if (isLoggedIn && dbCollection !== null) {
      setDbCollection(prev => {
        const updated = { ...(prev || {}) }
        for (const id of cardIds) {
          updated[id] = false
        }
        return updated
      })

      // Fire-and-forget sync (batch would be better but this works)
      for (const cardId of cardIds) {
        syncCardToDb(cardId, false)
      }
    } else {
      setLocalCollection(prev => {
        const updated = { ...prev }
        for (const id of cardIds) {
          updated[id] = false
        }
        return updated
      })
    }
  }, [isLoggedIn, dbCollection, setLocalCollection, syncCardToDb])

  const clearCollection = useCallback(() => {
    if (isLoggedIn) {
      setDbCollection({})
    } else {
      setLocalCollection({})
    }
  }, [isLoggedIn, setLocalCollection])

  // Import local collection to database
  const importLocalCollection = useCallback(async () => {
    if (!isLoggedIn || !hasLocalCollection) return

    try {
      setIsSyncing(true)
      const cardIds = Object.entries(localCollection)
        .filter(([, owned]) => owned)
        .map(([cardId]) => cardId)

      await fetch('/api/collection/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardIds }),
      })

      // Merge into DB collection
      setDbCollection(prev => {
        const updated = { ...(prev || {}) }
        for (const id of cardIds) {
          updated[id] = true
        }
        return updated
      })

      // Clear local collection after successful import
      setLocalCollection({})
    } catch (error) {
      console.error('Failed to import collection:', error)
    } finally {
      setIsSyncing(false)
    }
  }, [isLoggedIn, hasLocalCollection, localCollection, setLocalCollection])

  return (
    <CollectionContext.Provider
      value={{
        collection,
        toggleCard,
        isOwned,
        getOwnedCount,
        addCards,
        removeCards,
        clearCollection,
        isSyncing,
        importLocalCollection,
        hasLocalCollection,
      }}
    >
      {children}
    </CollectionContext.Provider>
  )
}

export function useCollection() {
  const context = useContext(CollectionContext)
  if (context === undefined) {
    throw new Error('useCollection must be used within a CollectionProvider')
  }
  return context
}

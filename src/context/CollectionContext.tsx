'use client'

import { createContext, useContext, ReactNode, useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { Collection } from '../types'

interface CollectionContextType {
  collection: Collection
  toggleCard: (cardId: string) => void
  setCardCount: (cardId: string, count: number) => void
  isOwned: (cardId: string) => boolean
  getCardCount: (cardId: string) => number
  getOwnedCount: (cardIds: string[]) => number
  getTotalCards: (cardIds: string[]) => number // Total including duplicates
  addCards: (cardIds: string[]) => void
  removeCards: (cardIds: string[]) => void
  clearCollection: () => void
  isSyncing: boolean
  importLocalCollection: () => Promise<void>
  hasLocalCollection: boolean
  // Backup & restore functions
  exportCollection: () => void
  importCollectionFromFile: (file: File) => Promise<void>
  lastBackupTime: Date | null
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined)

export function CollectionProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [localCollection, setLocalCollection] = useLocalStorage<Collection>('tcg-pocket-collection-v2', {})
  const [backupCollection, setBackupCollection] = useLocalStorage<Collection>('tcg-pocket-backup', {})
  const [lastBackupTime, setLastBackupTime] = useLocalStorage<string | null>('tcg-pocket-backup-time', null)
  const [dbCollection, setDbCollection] = useState<Collection | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const fetchedRef = useRef(false)

  const isLoggedIn = status === 'authenticated' && !!session?.user

  // Merge collections: show local immediately, overlay DB data when available
  const collection = useMemo(() => {
    if (!isLoggedIn) return localCollection
    if (dbCollection === null) return localCollection
    return dbCollection
  }, [isLoggedIn, localCollection, dbCollection])

  // Check if there's any local collection data
  const hasLocalCollection = useMemo(() => {
    return Object.values(localCollection).some(count => count > 0)
  }, [localCollection])

  // Fetch collection from database when user logs in
  useEffect(() => {
    if (!isLoggedIn) {
      setDbCollection(null)
      fetchedRef.current = false
      return
    }

    if (fetchedRef.current) return
    fetchedRef.current = true

    async function fetchCollection() {
      try {
        const response = await fetch('/api/collection')
        if (response.ok) {
          const data = await response.json()
          // API now returns { cards: Record<string, number> }
          setDbCollection(data.cards || {})
        }
      } catch (error) {
        console.error('Failed to fetch collection:', error)
        setDbCollection(localCollection)
      }
    }

    fetchCollection()
  }, [isLoggedIn, localCollection])

  // Sync card count to database
  const syncCardToDb = useCallback((cardId: string, count: number) => {
    if (!isLoggedIn) return

    fetch('/api/collection', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId, count }),
    }).catch(error => {
      console.error('Failed to sync card:', error)
    })
  }, [isLoggedIn])

  // Toggle card between owned (count 1) and not owned (count 0)
  const toggleCard = useCallback((cardId: string) => {
    const currentCount = collection[cardId] || 0
    const newCount = currentCount > 0 ? 0 : 1

    if (isLoggedIn && dbCollection !== null) {
      setDbCollection(prev => prev ? { ...prev, [cardId]: newCount } : { [cardId]: newCount })
      syncCardToDb(cardId, newCount)
    } else {
      setLocalCollection(prev => ({ ...prev, [cardId]: newCount }))
    }
  }, [collection, isLoggedIn, dbCollection, syncCardToDb, setLocalCollection])

  // Set specific count for a card
  const setCardCount = useCallback((cardId: string, count: number) => {
    const validCount = Math.max(0, Math.floor(count))

    if (isLoggedIn && dbCollection !== null) {
      setDbCollection(prev => prev ? { ...prev, [cardId]: validCount } : { [cardId]: validCount })
      syncCardToDb(cardId, validCount)
    } else {
      setLocalCollection(prev => ({ ...prev, [cardId]: validCount }))
    }
  }, [isLoggedIn, dbCollection, syncCardToDb, setLocalCollection])

  const isOwned = useCallback((cardId: string) => {
    return (collection[cardId] || 0) > 0
  }, [collection])

  const getCardCount = useCallback((cardId: string) => {
    return collection[cardId] || 0
  }, [collection])

  const getOwnedCount = useCallback((cardIds: string[]) => {
    return cardIds.filter(id => (collection[id] || 0) > 0).length
  }, [collection])

  // Get total cards including duplicates
  const getTotalCards = useCallback((cardIds: string[]) => {
    return cardIds.reduce((total, id) => total + (collection[id] || 0), 0)
  }, [collection])

  const addCards = useCallback((cardIds: string[]) => {
    if (isLoggedIn && dbCollection !== null) {
      setDbCollection(prev => {
        const updated = { ...(prev || {}) }
        for (const id of cardIds) {
          updated[id] = (updated[id] || 0) + 1
        }
        return updated
      })

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
          updated[id] = (updated[id] || 0) + 1
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
          updated[id] = 0
        }
        return updated
      })

      for (const cardId of cardIds) {
        syncCardToDb(cardId, 0)
      }
    } else {
      setLocalCollection(prev => {
        const updated = { ...prev }
        for (const id of cardIds) {
          updated[id] = 0
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

      // Filter to only cards with count > 0
      const cardsToImport: Record<string, number> = {}
      for (const [cardId, count] of Object.entries(localCollection)) {
        if (count > 0) {
          cardsToImport[cardId] = count
        }
      }

      await fetch('/api/collection/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: cardsToImport }),
      })

      // Merge into DB collection
      setDbCollection(prev => {
        const updated = { ...(prev || {}) }
        for (const [id, count] of Object.entries(cardsToImport)) {
          updated[id] = count
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

  // Automatic backup to local storage when collection changes
  useEffect(() => {
    // Only backup if we have actual data (not empty)
    const hasData = Object.values(collection).some(count => count > 0)
    if (hasData) {
      setBackupCollection(collection)
      setLastBackupTime(new Date().toISOString())
    }
  }, [collection, setBackupCollection, setLastBackupTime])

  // Export collection to JSON file
  const exportCollection = useCallback(() => {
    const data = {
      version: 2,
      exportedAt: new Date().toISOString(),
      collection: collection,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tcg-pocket-collection-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [collection])

  // Import collection from JSON file
  const importCollectionFromFile = useCallback(async (file: File) => {
    try {
      setIsSyncing(true)
      const text = await file.text()
      const data = JSON.parse(text)

      // Validate the data structure
      if (!data.collection || typeof data.collection !== 'object') {
        throw new Error('Invalid backup file format')
      }

      const importedCollection: Collection = data.collection

      if (isLoggedIn) {
        // Sync to database
        await fetch('/api/collection/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cards: importedCollection }),
        })
        setDbCollection(importedCollection)
      } else {
        setLocalCollection(importedCollection)
      }

      // Also update the backup
      setBackupCollection(importedCollection)
      setLastBackupTime(new Date().toISOString())
    } catch (error) {
      console.error('Failed to import collection:', error)
      throw error
    } finally {
      setIsSyncing(false)
    }
  }, [isLoggedIn, setLocalCollection, setBackupCollection, setLastBackupTime])

  // Parse last backup time
  const parsedLastBackupTime = useMemo(() => {
    return lastBackupTime ? new Date(lastBackupTime) : null
  }, [lastBackupTime])

  return (
    <CollectionContext.Provider
      value={{
        collection,
        toggleCard,
        setCardCount,
        isOwned,
        getCardCount,
        getOwnedCount,
        getTotalCards,
        addCards,
        removeCards,
        clearCollection,
        isSyncing,
        importLocalCollection,
        hasLocalCollection,
        exportCollection,
        importCollectionFromFile,
        lastBackupTime: parsedLastBackupTime,
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

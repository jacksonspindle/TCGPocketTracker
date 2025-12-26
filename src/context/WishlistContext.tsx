'use client'

import { createContext, useContext, ReactNode, useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useLocalStorage } from '../hooks/useLocalStorage'

type Wishlist = Record<string, boolean>

interface WishlistContextType {
  wishlist: Wishlist
  toggleWishlist: (cardId: string) => void
  isWishlisted: (cardId: string) => boolean
  getWishlistCount: (cardIds: string[]) => number
  clearWishlist: () => void
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [localWishlist, setLocalWishlist] = useLocalStorage<Wishlist>('tcg-pocket-wishlist', {})
  const [dbWishlist, setDbWishlist] = useState<Wishlist | null>(null)
  const fetchedRef = useRef(false)

  const isLoggedIn = status === 'authenticated' && !!session?.user

  const wishlist = useMemo(() => {
    if (!isLoggedIn) return localWishlist
    if (dbWishlist === null) return localWishlist
    return dbWishlist
  }, [isLoggedIn, localWishlist, dbWishlist])

  // Fetch wishlist from database when user logs in
  useEffect(() => {
    if (!isLoggedIn) {
      setDbWishlist(null)
      fetchedRef.current = false
      return
    }

    if (fetchedRef.current) return
    fetchedRef.current = true

    async function fetchWishlist() {
      try {
        const response = await fetch('/api/wishlist')
        if (response.ok) {
          const data = await response.json()
          const wishlistMap: Wishlist = {}
          for (const cardId of data.cards) {
            wishlistMap[cardId] = true
          }
          setDbWishlist(wishlistMap)
        }
      } catch (error) {
        console.error('Failed to fetch wishlist:', error)
        setDbWishlist(localWishlist)
      }
    }

    fetchWishlist()
  }, [isLoggedIn, localWishlist])

  // Fire-and-forget sync to database
  const syncWishlistToDb = useCallback((cardId: string, wishlisted: boolean) => {
    if (!isLoggedIn) return

    fetch('/api/wishlist', {
      method: wishlisted ? 'POST' : 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId }),
    }).catch(error => {
      console.error('Failed to sync wishlist:', error)
    })
  }, [isLoggedIn])

  const toggleWishlist = useCallback((cardId: string) => {
    const newWishlisted = !wishlist[cardId]

    if (isLoggedIn && dbWishlist !== null) {
      setDbWishlist(prev => prev ? { ...prev, [cardId]: newWishlisted } : { [cardId]: newWishlisted })
      syncWishlistToDb(cardId, newWishlisted)
    } else {
      setLocalWishlist(prev => ({ ...prev, [cardId]: newWishlisted }))
    }
  }, [wishlist, isLoggedIn, dbWishlist, syncWishlistToDb, setLocalWishlist])

  const isWishlisted = useCallback((cardId: string) => {
    return wishlist[cardId] === true
  }, [wishlist])

  const getWishlistCount = useCallback((cardIds: string[]) => {
    return cardIds.filter(id => wishlist[id]).length
  }, [wishlist])

  const clearWishlist = useCallback(() => {
    if (isLoggedIn) {
      setDbWishlist({})
    } else {
      setLocalWishlist({})
    }
  }, [isLoggedIn, setLocalWishlist])

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isWishlisted,
        getWishlistCount,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}

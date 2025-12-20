'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useCollection } from '@/context/CollectionContext'

export default function UserMenu() {
  const { data: session, status } = useSession()
  const { isSyncing, hasLocalCollection, importLocalCollection } = useCollection()
  const [isOpen, setIsOpen] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Show import modal when user logs in and has local collection
  useEffect(() => {
    if (status === 'authenticated' && hasLocalCollection) {
      setShowImportModal(true)
    }
  }, [status, hasLocalCollection])

  const handleImport = async () => {
    await importLocalCollection()
    setShowImportModal(false)
  }

  if (status === 'loading') {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
    )
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn('google')}
        className="sku-button px-4 py-2 text-sm font-medium text-gray-700 hover:text-teal-600 flex items-center gap-2"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign In
      </button>
    )
  }

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          {session.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || 'User'}
              className="w-9 h-9 rounded-full"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">
              {session.user?.name?.[0] || 'U'}
            </div>
          )}
          {isSyncing && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 border border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="font-medium text-gray-800 truncate">{session.user?.name}</p>
              <p className="text-sm text-gray-500 truncate">{session.user?.email}</p>
            </div>
            <button
              onClick={() => {
                setIsOpen(false)
                signOut()
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Import Your Collection?</h3>
            <p className="text-gray-600 mb-6">
              We found a collection saved on this device. Would you like to import it to your account?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 px-4 py-2.5 text-gray-700 sku-button font-medium"
              >
                Skip
              </button>
              <button
                onClick={handleImport}
                disabled={isSyncing}
                className="flex-1 px-4 py-2.5 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 disabled:opacity-50"
              >
                {isSyncing ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

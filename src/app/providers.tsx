'use client'

import { SessionProvider } from '@/components/SessionProvider'
import { CollectionProvider } from '@/context/CollectionContext'
import { WishlistProvider } from '@/context/WishlistContext'
import { ChatProvider } from '@/context/ChatContext'
import { ThemeProvider } from '@/context/ThemeContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SessionProvider>
        <CollectionProvider>
          <WishlistProvider>
            <ChatProvider>
              {children}
            </ChatProvider>
          </WishlistProvider>
        </CollectionProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}

'use client'

import { SessionProvider } from '@/components/SessionProvider'
import { CollectionProvider } from '@/context/CollectionContext'
import { ChatProvider } from '@/context/ChatContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CollectionProvider>
        <ChatProvider>
          {children}
        </ChatProvider>
      </CollectionProvider>
    </SessionProvider>
  )
}

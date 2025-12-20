'use client'

import { useChatContext } from '../../context/ChatContext'
import { Card, TCGPocketSet } from '../../types'
import ChatHeader from './ChatHeader'
import ChatMessages from './ChatMessages'
import ChatInput from './ChatInput'

interface ChatPanelProps {
  cards: Card[];
  sets: TCGPocketSet[];
}

export default function ChatPanel({ cards, sets }: ChatPanelProps) {
  const { isOpen, setIsOpen, messages, isLoading, error, setError } = useChatContext();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <ChatHeader onClose={() => setIsOpen(false)} />

          <ChatMessages messages={messages} isLoading={isLoading} />

          {error && (
            <div className="px-4 py-3 bg-red-50 border-t border-red-100">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm text-red-600">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="text-xs text-red-500 hover:text-red-700 underline mt-1"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          <ChatInput cards={cards} sets={sets} />
        </div>
      </div>
    </>
  );
}

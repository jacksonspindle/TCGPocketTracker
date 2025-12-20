'use client'

import { useChatContext } from '../../context/ChatContext'

export default function ChatToggleButton() {
  const { setIsOpen, isOpen } = useChatContext();

  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="sku-button w-10 h-10 rounded-full flex items-center justify-center text-teal-500 hover:text-teal-600"
      title="Chat with AI assistant"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    </button>
  );
}

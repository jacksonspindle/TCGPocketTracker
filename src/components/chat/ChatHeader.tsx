'use client'

import { useChatContext } from '../../context/ChatContext'

interface ChatHeaderProps {
  onClose: () => void;
}

export default function ChatHeader({ onClose }: ChatHeaderProps) {
  const { clearMessages, messages } = useChatContext();

  return (
    <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <img
          src="/pockettrackerIcon.png"
          alt="Collection Companion"
          className="w-10 h-10 rounded-xl"
        />
        <h2 className="font-semibold text-gray-100">Collection Companion</h2>
      </div>
      <div className="flex items-center gap-2">
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-white/10 rounded-lg transition-colors"
            title="Clear chat"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-200 hover:bg-white/10 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

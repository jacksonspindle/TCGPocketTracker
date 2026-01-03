'use client'

import { useState, FormEvent } from 'react'
import { useChatContext } from '../../context/ChatContext'
import { useCollection } from '../../context/CollectionContext'
import { useWishlist } from '../../context/WishlistContext'
import { useCollectionSummary } from '../../hooks/useCollectionSummary'
import { useBoosterSummaries } from '../../hooks/useBoosterSummaries'
import { sendChatMessage } from '../../services/claude'
import { Card, TCGPocketSet } from '../../types'
import { ClaudeMessage } from '../../types/chat'

interface ChatInputProps {
  cards: Card[];
  sets: TCGPocketSet[];
}

export default function ChatInput({ cards, sets }: ChatInputProps) {
  const [input, setInput] = useState('');
  const { messages, addMessage, isLoading, setIsLoading, setError } = useChatContext();
  const { collection } = useCollection();
  const { wishlist } = useWishlist();

  const collectionSummary = useCollectionSummary(cards, collection, wishlist);
  const boosterSummaries = useBoosterSummaries(cards, sets, collection);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    addMessage({ role: 'user', content: userMessage });
    setIsLoading(true);
    setError(null);

    try {
      const contextData = {
        collectionSummary,
        boosterSummaries,
      };

      // Build message history for API (last 10 messages max to control tokens)
      const recentMessages = messages.slice(-10);
      const allMessages: ClaudeMessage[] = [
        ...recentMessages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: userMessage },
      ];

      const response = await sendChatMessage(allMessages, contextData);
      addMessage({
        role: 'assistant',
        content: response.text,
        filterAction: response.filterAction,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get response';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-md">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your collection..."
          disabled={isLoading}
          className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 disabled:bg-white/5 disabled:text-gray-500 backdrop-blur-sm"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-4 py-3 bg-blue-500/80 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors backdrop-blur-sm"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </form>
  );
}

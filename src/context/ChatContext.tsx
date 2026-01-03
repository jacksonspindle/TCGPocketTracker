'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { ChatMessage, FilterAction } from '../types/chat'

interface ApplyFiltersOptions {
  search?: string;
  rarity?: string;
  type?: string;
  stage?: string;
  collectionFilter?: 'all' | 'owned' | 'missing' | 'wishlist';
}

interface ChatContextType {
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  onApplyFilters: ((filters: ApplyFiltersOptions) => void) | null;
  setOnApplyFilters: (callback: ((filters: ApplyFiltersOptions) => void) | null) => void;
  applyFilterAction: (action: FilterAction) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onApplyFiltersRef, setOnApplyFiltersRef] = useState<{ callback: ((filters: ApplyFiltersOptions) => void) | null }>({ callback: null });

  const setOnApplyFilters = useCallback((callback: ((filters: ApplyFiltersOptions) => void) | null) => {
    setOnApplyFiltersRef({ callback });
  }, []);

  const onApplyFilters = onApplyFiltersRef.callback;

  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    }]);
  };

  const clearMessages = () => setMessages([]);

  const applyFilterAction = useCallback((action: FilterAction) => {
    if (onApplyFilters) {
      onApplyFilters(action.filters);
      setIsOpen(false);
    }
  }, [onApplyFilters]);

  return (
    <ChatContext.Provider value={{
      messages,
      addMessage,
      clearMessages,
      isOpen,
      setIsOpen,
      isLoading,
      setIsLoading,
      error,
      setError,
      onApplyFilters,
      setOnApplyFilters,
      applyFilterAction,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}

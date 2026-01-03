'use client'

import { useState, useEffect, useRef } from 'react'
import { ChatMessage as ChatMessageType } from '../../types/chat'
import { useChatContext } from '../../context/ChatContext'

interface ChatMessageProps {
  message: ChatMessageType;
}

// Render inline markdown (bold)
function renderInlineMarkdown(text: string, keyPrefix: string = '') {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${keyPrefix}-${index}`} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// Parse and render markdown with proper formatting
function renderFormattedContent(text: string) {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let listKey = 0;

  const flushList = () => {
    if (currentList) {
      const ListTag = currentList.type === 'ul' ? 'ul' : 'ol';
      elements.push(
        <ListTag
          key={`list-${listKey++}`}
          className={`text-sm my-2 space-y-1 ${currentList.type === 'ul' ? 'list-disc' : 'list-decimal'} list-inside`}
        >
          {currentList.items.map((item, i) => (
            <li key={i} className="leading-relaxed">{renderInlineMarkdown(item, `li-${listKey}-${i}`)}</li>
          ))}
        </ListTag>
      );
      currentList = null;
    }
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Check for headers (# ## ### etc)
    const headerMatch = trimmedLine.match(/^(#{1,4})\s+(.+)$/);
    if (headerMatch) {
      flushList();
      const level = headerMatch[1].length;
      const content = headerMatch[2];
      const headerClasses: Record<number, string> = {
        1: 'text-lg font-bold mt-3 mb-2 text-blue-400',
        2: 'text-base font-bold mt-3 mb-1.5 text-blue-400',
        3: 'text-[15px] font-semibold mt-2 mb-1 text-blue-400',
        4: 'text-sm font-semibold mt-2 mb-1 text-blue-400',
      };
      elements.push(
        <p key={`h-${index}`} className={headerClasses[level] || headerClasses[4]}>
          {renderInlineMarkdown(content, `h-${index}`)}
        </p>
      );
    }
    // Check for unordered list item (- or •)
    else if (trimmedLine.match(/^[-•]\s+/)) {
      const content = trimmedLine.replace(/^[-•]\s+/, '');
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(content);
    }
    // Check for ordered list item (1. 2. etc)
    else if (trimmedLine.match(/^\d+\.\s+/)) {
      const content = trimmedLine.replace(/^\d+\.\s+/, '');
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(content);
    }
    // Regular paragraph
    else {
      flushList();
      if (trimmedLine) {
        elements.push(
          <p key={`p-${index}`} className="text-sm leading-relaxed my-1">
            {renderInlineMarkdown(trimmedLine, `p-${index}`)}
          </p>
        );
      } else if (index > 0 && index < lines.length - 1) {
        // Add spacing for empty lines between content
        elements.push(<div key={`space-${index}`} className="h-2" />);
      }
    }
  });

  flushList();
  return elements;
}

// Typing animation hook
function useTypingAnimation(text: string, isAssistant: boolean, speed: number = 8) {
  const [displayedText, setDisplayedText] = useState(isAssistant ? '' : text);
  const [isComplete, setIsComplete] = useState(!isAssistant);
  const animationRef = useRef<number | null>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!isAssistant) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    // Reset for new message
    indexRef.current = 0;
    setDisplayedText('');
    setIsComplete(false);

    const animate = () => {
      if (indexRef.current < text.length) {
        // Add multiple characters per frame for smoother, faster animation
        const charsToAdd = Math.min(speed, text.length - indexRef.current);
        indexRef.current += charsToAdd;
        setDisplayedText(text.slice(0, indexRef.current));
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsComplete(true);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [text, isAssistant, speed]);

  return { displayedText, isComplete };
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const { applyFilterAction } = useChatContext();
  const { displayedText, isComplete } = useTypingAnimation(message.content, !isUser);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] px-4 py-3 rounded-2xl backdrop-blur-sm ${
          isUser
            ? 'bg-blue-500/80 text-white rounded-br-md'
            : 'bg-white/10 text-gray-100 rounded-bl-md border border-white/5'
        }`}
      >
        <div className="prose prose-sm prose-invert">
          {isUser ? (
            <p className="text-sm">{message.content}</p>
          ) : (
            renderFormattedContent(displayedText)
          )}
        </div>

        {message.filterAction && isComplete && (
          <button
            type="button"
            onClick={() => applyFilterAction(message.filterAction!)}
            className="mt-3 flex items-center gap-2 px-3 py-2 bg-blue-500/80 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-all w-full justify-center cursor-pointer opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]"
            style={{ animationDelay: '0.1s' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {message.filterAction.label}
          </button>
        )}
      </div>
    </div>
  );
}

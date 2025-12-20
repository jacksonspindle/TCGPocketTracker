'use client'

import { Card } from '../types'
import { useCollection } from '../context/CollectionContext'

interface CardItemProps {
  card: Card;
}

export default function CardItem({ card }: CardItemProps) {
  const { isOwned, toggleCard } = useCollection();
  const owned = isOwned(card.id);

  const imageUrl = card.image ? `${card.image}/high.webp` : null;

  return (
    <div
      className="card-item relative cursor-pointer rounded-lg overflow-hidden"
      onClick={() => toggleCard(card.id)}
    >
      {/* Card Image Container */}
      <div className="aspect-[2.5/3.5] relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={card.name}
            className={`w-full h-full object-cover transition-none ${!owned ? 'opacity-30 grayscale' : ''}`}
            loading="lazy"
          />
        ) : (
          <div className="card-placeholder w-full h-full">
            <span className="text-2xl font-bold text-gray-400">{card.localId}</span>
          </div>
        )}

        {/* Owned checkmark badge */}
        {owned && (
          <div className="absolute top-1.5 right-1.5 w-6 h-6 bg-gradient-to-br from-teal-400 to-teal-500 rounded-full flex items-center justify-center shadow-md">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Card Name - only show for owned cards like in the app */}
      {owned && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6">
          <p className="text-white text-xs font-medium truncate text-center">{card.name}</p>
        </div>
      )}
    </div>
  );
}

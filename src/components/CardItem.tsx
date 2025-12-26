'use client'

import { Card } from '../types'
import { useCollection } from '../context/CollectionContext'
import { useWishlist } from '../context/WishlistContext'

interface CardItemProps {
  card: Card;
  onCardClick?: (card: Card) => void;
}

export default function CardItem({ card, onCardClick }: CardItemProps) {
  const { isOwned, toggleCard } = useCollection();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const owned = isOwned(card.id);
  const wishlisted = isWishlisted(card.id);

  const imageUrl = card.image ? `${card.image}/high.webp` : null;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(card.id);
  };

  const handleOwnedClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCard(card.id);
  };

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(card);
    } else {
      toggleCard(card.id);
    }
  };

  return (
    <div
      className="card-item relative cursor-pointer rounded-lg overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Card Image Container */}
      <div className="aspect-[2.5/3.5] relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={card.name}
            className={`w-full h-full object-cover transition-all duration-200 ${!owned ? 'opacity-30 grayscale hover:opacity-100 hover:grayscale-0' : ''}`}
            loading="lazy"
          />
        ) : (
          <div className="card-placeholder w-full h-full">
            <span className="text-2xl font-bold text-gray-400">{card.localId}</span>
          </div>
        )}

        {/* Wishlist heart badge */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-1.5 left-1.5 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-all ${
            wishlisted
              ? 'bg-gradient-to-br from-pink-400 to-rose-500'
              : 'bg-black/30 hover:bg-black/50'
          }`}
        >
          <svg
            className={`w-3.5 h-3.5 ${wishlisted ? 'text-white' : 'text-white/70'}`}
            fill={wishlisted ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Owned checkmark badge */}
        <button
          onClick={handleOwnedClick}
          className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-all ${
            owned
              ? 'bg-gradient-to-br from-teal-400 to-teal-500'
              : 'bg-black/30 hover:bg-black/50'
          }`}
        >
          <svg className={`w-4 h-4 ${owned ? 'text-white' : 'text-white/70'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={owned ? 3 : 2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </button>
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

'use client'

import { Card } from '../types'
import CardItem from './CardItem'

interface CardGridProps {
  cards: Card[];
  loading?: boolean;
  gridSize: number;
  onCardClick?: (card: Card) => void;
}

const gridClasses: Record<number, string> = {
  3: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4',
  4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5',
  5: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6',
  6: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-7',
  7: 'grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-7 xl:grid-cols-8',
  8: 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-8 xl:grid-cols-10',
};

export default function CardGrid({ cards, loading, gridSize, onCardClick }: CardGridProps) {
  const gridClass = gridClasses[gridSize] || gridClasses[5];

  if (loading) {
    return (
      <div className={`grid ${gridClass} gap-3`}>
        {Array.from({ length: 21 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[2.5/3.5] bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="sku-card p-12 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No cards found</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridClass} gap-3`}>
      {cards.map((card) => (
        <CardItem key={card.id} card={card} onCardClick={onCardClick} />
      ))}
    </div>
  );
}

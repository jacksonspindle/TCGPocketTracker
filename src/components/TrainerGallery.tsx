'use client'

import { useMemo } from 'react'
import { Card } from '../types'
import { useCollection } from '../context/CollectionContext'
import { tierConfig, getTrainerTier, TrainerTier } from '../data/trainerTiers'

interface TrainerGalleryProps {
  cards: Card[]
  loading?: boolean
  onCardClick?: (card: Card) => void
}

interface TrainerCard extends Card {
  tier: TrainerTier
}

export default function TrainerGallery({ cards, loading, onCardClick }: TrainerGalleryProps) {
  const { isOwned } = useCollection()

  // Filter for 2-star trainer cards and assign tiers
  const trainersByTier = useMemo(() => {
    const trainers = cards.filter(card =>
      card.category === 'Trainer' &&
      card.rarity === 'Two Star' &&
      getTrainerTier(card.name) !== null
    )

    // Group by tier
    const grouped: Record<TrainerTier, TrainerCard[]> = {
      'S': [],
      'A+': [],
      'A': [],
      'B': [],
      'C': [],
      'D': [],
      'F': [],
    }

    // Track unique trainers by name to avoid duplicates
    const seenTrainers = new Set<string>()

    trainers.forEach(card => {
      const tier = getTrainerTier(card.name)
      if (tier && !seenTrainers.has(card.name)) {
        seenTrainers.add(card.name)
        grouped[tier].push({ ...card, tier })
      }
    })

    return grouped
  }, [cards])

  if (loading) {
    return (
      <div className="space-y-4">
        {tierConfig.map(tier => (
          <div key={tier.name} className="flex rounded-lg overflow-hidden animate-pulse">
            <div
              className="w-16 flex-shrink-0 flex items-center justify-center font-bold text-xl"
              style={{ backgroundColor: tier.bgColor, color: tier.color }}
            >
              {tier.name}
            </div>
            <div className="flex-1 bg-gray-800 dark:bg-gray-900 p-4 min-h-[100px]">
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-16 h-24 bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {tierConfig.map(tier => {
        const trainersInTier = trainersByTier[tier.name]

        return (
          <div key={tier.name} className="flex rounded-lg overflow-hidden">
            {/* Tier Label */}
            <div
              className="w-14 sm:w-16 flex-shrink-0 flex items-center justify-center font-bold text-xl sm:text-2xl"
              style={{ backgroundColor: tier.bgColor, color: tier.color }}
            >
              {tier.name}
            </div>

            {/* Cards Row */}
            <div className="flex-1 bg-gray-800 dark:bg-gray-900 p-2 sm:p-3 min-h-[80px] sm:min-h-[100px]">
              {trainersInTier.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {trainersInTier.map(trainer => {
                    const owned = isOwned(trainer.id)
                    const imageUrl = trainer.image ? `${trainer.image}/high.webp` : null

                    return (
                      <div
                        key={trainer.id}
                        className="relative w-14 sm:w-16 md:w-20 flex-shrink-0 cursor-pointer"
                        title={trainer.name}
                        onClick={() => onCardClick?.(trainer)}
                      >
                        <div className="aspect-[2.5/3.5] rounded overflow-hidden">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={trainer.name}
                              className={`w-full h-full object-cover transition-all duration-200 ${
                                !owned ? 'opacity-30 grayscale hover:opacity-100 hover:grayscale-0' : ''
                              }`}
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                              <span className="text-xs text-gray-400 text-center px-1">{trainer.name}</span>
                            </div>
                          )}
                        </div>
                        {/* Trainer name label */}
                        <p className="text-[8px] sm:text-[10px] text-gray-400 text-center mt-0.5 truncate">
                          {trainer.name}
                        </p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500 text-sm">No trainers in this tier</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

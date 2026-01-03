'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Card, Booster } from '../types'
import { useCollection } from '../context/CollectionContext'
import { useWishlist } from '../context/WishlistContext'
import { singleBoosterSets, boosterOrder } from '../data/boosters'

interface CardDetailPanelProps {
  card: Card | null
  onClose: () => void
}

// Energy type colors
const typeColors: Record<string, string> = {
  Grass: '#78C850',
  Fire: '#F08030',
  Water: '#6890F0',
  Lightning: '#F8D030',
  Psychic: '#F85888',
  Fighting: '#C03028',
  Darkness: '#705848',
  Metal: '#B8B8D0',
  Dragon: '#7038F8',
  Fairy: '#EE99AC',
  Colorless: '#A8A878',
}

// Energy type icons (simplified)
function EnergyIcon({ type, size = 'md' }: { type: string; size?: 'sm' | 'md' }) {
  const color = typeColors[type] || typeColors.Colorless
  const sizeClass = size === 'sm' ? 'w-4 h-4 text-[8px]' : 'w-6 h-6 text-[10px]'

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center text-white font-bold shadow-md`}
      style={{ backgroundColor: color }}
      title={type}
    >
      {type[0]}
    </div>
  )
}

// Helper to get booster name from booster ID
function getBoosterDisplayName(boosterId: string): string {
  // Extract the name part after the last dash, capitalize it
  const parts = boosterId.replace('boo_', '').split('-')
  if (parts.length > 1) {
    // Get everything after the set ID (e.g., "A1-charizard" -> "Charizard")
    const name = parts.slice(1).join(' ')
    return name.charAt(0).toUpperCase() + name.slice(1)
  }
  return boosterId
}

// Get availability info for a card (boosters or fallback to set)
function getCardAvailability(card: Card): { type: 'boosters' | 'set'; items: { id: string; name: string }[] } {
  // If card has booster data from API, use it
  if (card.boosters && card.boosters.length > 0) {
    return { type: 'boosters', items: card.boosters }
  }

  const setId = card.set.id

  // For single-booster sets, we can determine the booster
  if (singleBoosterSets.has(setId)) {
    const boosterIds = boosterOrder[setId]
    if (boosterIds && boosterIds.length > 0) {
      return {
        type: 'boosters',
        items: boosterIds.map(id => ({
          id,
          name: getBoosterDisplayName(id)
        }))
      }
    }
  }

  // Fallback to showing the set name
  return {
    type: 'set',
    items: [{ id: setId, name: card.set.name }]
  }
}

export default function CardDetailPanel({ card, onClose }: CardDetailPanelProps) {
  const { isOwned, getCardCount, setCardCount } = useCollection()
  const { isWishlisted, toggleWishlist } = useWishlist()

  if (!card) return null

  const owned = isOwned(card.id)
  const count = getCardCount(card.id)
  const wishlisted = isWishlisted(card.id)
  const imageUrl = card.image ? `${card.image}/high.webp` : null

  return (
    <AnimatePresence>
      {card && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={onClose}
          >
            <div
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white/10 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 dark:border-gray-700/50">
                  <div className="flex items-center gap-3">
                    {card.types?.map(type => (
                      <EnergyIcon key={type} type={type} />
                    ))}
                    <div>
                      <h2 className="text-xl font-bold text-white">{card.name}</h2>
                      <p className="text-sm text-gray-300">{card.set.name} · {card.localId}</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Card Image */}
                    <div className="flex-shrink-0 mx-auto sm:mx-0">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={card.name}
                          className="w-56 sm:w-64 rounded-xl shadow-2xl"
                        />
                      ) : (
                        <div className="w-56 sm:w-64 aspect-[2.5/3.5] bg-gray-700 rounded-xl flex items-center justify-center">
                          <span className="text-gray-400">{card.name}</span>
                        </div>
                      )}

                      {/* Collection Counter */}
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-300">Owned</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setCardCount(card.id, Math.max(0, count - 1))}
                              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={count === 0}
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                              </svg>
                            </button>
                            <span className={`w-10 text-center text-lg font-bold ${owned ? 'text-teal-400' : 'text-gray-400'}`}>
                              {count}
                            </span>
                            <button
                              onClick={() => setCardCount(card.id, count + 1)}
                              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-2">
                          {!owned && (
                            <button
                              onClick={() => setCardCount(card.id, 1)}
                              className="flex-1 py-2 rounded-xl font-medium text-sm bg-teal-500 hover:bg-teal-600 text-white transition-colors"
                            >
                              Add to Collection
                            </button>
                          )}
                          <button
                            onClick={() => toggleWishlist(card.id)}
                            className={`${owned ? 'flex-1' : ''} px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-2 ${
                              wishlisted
                                ? 'bg-pink-500 text-white'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                          >
                            <svg
                              className="w-5 h-5"
                              fill={wishlisted ? 'currentColor' : 'none'}
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {owned && <span className="text-sm font-medium">{wishlisted ? 'Wishlisted' : 'Wishlist'}</span>}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Card Details */}
                    <div className="flex-1 space-y-4">
                      {/* Availability - Boosters or Set */}
                      {(() => {
                        const availability = getCardAvailability(card)
                        return (
                          <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                              {availability.type === 'boosters' ? 'Available In' : 'Set'}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {availability.items.map((item) => (
                                <div
                                  key={item.id}
                                  className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
                                    availability.type === 'boosters'
                                      ? 'bg-amber-500/20 border border-amber-500/30'
                                      : 'bg-blue-500/20 border border-blue-500/30'
                                  }`}
                                >
                                  <div className={`w-2 h-2 rounded-full ${
                                    availability.type === 'boosters' ? 'bg-amber-400' : 'bg-blue-400'
                                  }`} />
                                  <span className={`text-sm font-medium ${
                                    availability.type === 'boosters' ? 'text-amber-200' : 'text-blue-200'
                                  }`}>{item.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })()}

                      {/* Stats Row */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {card.category && (
                          <div className="bg-white/5 rounded-xl p-3">
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Category</p>
                            <p className="text-lg font-semibold text-white">{card.category}</p>
                          </div>
                        )}
                        {card.trainerType && (
                          <div className="bg-white/5 rounded-xl p-3">
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Trainer Type</p>
                            <p className="text-lg font-semibold text-white">{card.trainerType}</p>
                          </div>
                        )}
                        {card.hp && (
                          <div className="bg-white/5 rounded-xl p-3">
                            <p className="text-xs text-gray-400 uppercase tracking-wide">HP</p>
                            <p className="text-2xl font-bold text-white">{card.hp}</p>
                          </div>
                        )}
                        {card.types && card.types.length > 0 && (
                          <div className="bg-white/5 rounded-xl p-3">
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Type</p>
                            <div className="flex items-center gap-2 mt-1">
                              {card.types.map(type => (
                                <span key={type} className="text-lg font-semibold text-white">{type}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {card.rarity && (
                          <div className="bg-white/5 rounded-xl p-3">
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Rarity</p>
                            <p className="text-lg font-semibold text-white">{card.rarity}</p>
                          </div>
                        )}
                        {card.stage && (
                          <div className="bg-white/5 rounded-xl p-3">
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Stage</p>
                            <p className="text-lg font-semibold text-white">{card.stage}</p>
                          </div>
                        )}
                        {card.evolveFrom && (
                          <div className="bg-white/5 rounded-xl p-3">
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Evolves From</p>
                            <p className="text-lg font-semibold text-white">{card.evolveFrom}</p>
                          </div>
                        )}
                        {card.retreat !== undefined && (
                          <div className="bg-white/5 rounded-xl p-3">
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Retreat</p>
                            <div className="flex items-center gap-1 mt-1">
                              {Array.from({ length: card.retreat }).map((_, i) => (
                                <EnergyIcon key={i} type="Colorless" size="sm" />
                              ))}
                              {card.retreat === 0 && <span className="text-white">Free</span>}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Trainer Effect */}
                      {card.effect && (
                        <div className="space-y-2">
                          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Effect</h3>
                          <div className="bg-white/5 rounded-xl p-4">
                            <p className="text-sm text-gray-200 leading-relaxed">{card.effect}</p>
                          </div>
                        </div>
                      )}

                      {/* Attacks */}
                      {card.attacks && card.attacks.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Attacks</h3>
                          {card.attacks.map((attack, index) => (
                            <div key={index} className="bg-white/5 rounded-xl p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {/* Energy Cost */}
                                  <div className="flex items-center gap-1">
                                    {attack.cost?.map((energy, i) => (
                                      <EnergyIcon key={i} type={energy} size="sm" />
                                    ))}
                                  </div>
                                  <span className="font-semibold text-white">{attack.name}</span>
                                </div>
                                {attack.damage && (
                                  <span className="text-xl font-bold text-white">{attack.damage}</span>
                                )}
                              </div>
                              {attack.effect && (
                                <p className="text-sm text-gray-300">{attack.effect}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Weakness */}
                      {card.weaknesses && card.weaknesses.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Weakness</h3>
                          <div className="flex gap-2">
                            {card.weaknesses.map((weakness, index) => (
                              <div key={index} className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
                                <EnergyIcon type={weakness.type} size="sm" />
                                <span className="text-white font-medium">{weakness.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      {card.description && (
                        <div className="space-y-2">
                          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Description</h3>
                          <p className="text-sm text-gray-300 italic">{card.description}</p>
                        </div>
                      )}

                      {/* Illustrator */}
                      {card.illustrator && (
                        <div className="pt-4 border-t border-white/10">
                          <p className="text-xs text-gray-400">
                            Illustrated by <span className="text-gray-300">{card.illustrator}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

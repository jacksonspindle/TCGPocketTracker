'use client'

import { TCGPocketSet, Card, Booster } from '../types'
import { useCollection } from '../context/CollectionContext'
import { boosterOrder, excludedSets, getBoosterImageUrl, boosterToSetId, singleBoosterSets } from '../data/boosters'

export const ALL_SETS_ID = 'all';

interface BoosterDisplay {
  id: string;
  name: string;
  setId: string;
  setName: string;
  image: string;
}

interface SetSelectorProps {
  sets: TCGPocketSet[];
  cards: Card[];
  selectedBoosterId: string;
  onSelectBooster: (boosterId: string) => void;
  loading?: boolean;
}

function getBoostersFromSets(sets: TCGPocketSet[]): BoosterDisplay[] {
  const boosters: BoosterDisplay[] = [];

  for (const set of sets) {
    // Skip excluded sets (e.g., promos that don't come from boosters)
    if (excludedSets.has(set.id)) {
      continue;
    }

    // Get booster order for this set, or use API order
    const orderedBoosterIds = boosterOrder[set.id] || [];
    const apiBoosters = set.boosters || [];

    // Create a map of booster data from API
    const boosterMap = new Map<string, Booster>();
    for (const booster of apiBoosters) {
      boosterMap.set(booster.id, booster);
    }

    // Add boosters in the specified order
    for (const boosterId of orderedBoosterIds) {
      const booster = boosterMap.get(boosterId);
      if (booster) {
        boosters.push({
          id: booster.id,
          name: booster.name,
          setId: set.id,
          setName: set.name,
          image: getBoosterImageUrl(booster.id),
        });
        boosterMap.delete(boosterId);
      }
    }

    // Add any remaining boosters not in our order list
    for (const [, booster] of boosterMap) {
      boosters.push({
        id: booster.id,
        name: booster.name,
        setId: set.id,
        setName: set.name,
        image: getBoosterImageUrl(booster.id),
      });
    }
  }

  return boosters;
}

function getCardsForBooster(cards: Card[], boosterId: string): Card[] {
  const setId = boosterToSetId[boosterId];

  // For single-booster sets (mini-sets), filter by set ID
  // because those cards don't have the boosters field in the API
  if (setId && singleBoosterSets.has(setId)) {
    return cards.filter(card => card.set.id === setId);
  }

  // For multi-booster sets, filter by booster ID
  return cards.filter(card =>
    card.boosters?.some(booster => booster.id === boosterId)
  );
}

export default function SetSelector({
  sets,
  cards,
  selectedBoosterId,
  onSelectBooster,
  loading,
}: SetSelectorProps) {
  const { getOwnedCount, collection } = useCollection();

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2 px-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-gray-200 h-24 w-16 rounded-lg flex-shrink-0"
          ></div>
        ))}
      </div>
    );
  }

  const boosters = getBoostersFromSets(sets);
  const totalOwned = Object.values(collection).filter(Boolean).length;
  const totalCards = cards.length;

  return (
    <div className="flex gap-3 overflow-x-auto py-2 px-2 -mx-2">
      {/* All Sets Button */}
      <button
        onClick={() => onSelectBooster(ALL_SETS_ID)}
        className={`flex-shrink-0 flex flex-col items-center p-2 rounded-xl transition-all ${
          selectedBoosterId === ALL_SETS_ID
            ? 'bg-teal-50 ring-2 ring-teal-400'
            : 'hover:bg-gray-50'
        }`}
      >
        <div className="w-14 h-20 flex items-center justify-center bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg mb-1">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <span className="text-xs font-medium text-gray-700">All</span>
        <span className="text-xs text-gray-400">{totalOwned}/{totalCards}</span>
      </button>

      {boosters.map((booster) => {
        const isSelected = booster.id === selectedBoosterId;
        const boosterCards = getCardsForBooster(cards, booster.id);
        const ownedCount = getOwnedCount(boosterCards.map(c => c.id));
        const boosterTotal = boosterCards.length;

        return (
          <button
            key={booster.id}
            onClick={() => onSelectBooster(booster.id)}
            className={`flex-shrink-0 flex flex-col items-center p-2 rounded-xl transition-all ${
              isSelected
                ? 'bg-teal-50 ring-2 ring-teal-400'
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="w-14 h-20 flex items-center justify-center mb-1">
              {booster.image ? (
                <img
                  src={booster.image}
                  alt={booster.name}
                  className="h-full w-auto object-contain drop-shadow-md"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `<span class="text-xs font-bold text-gray-500 text-center px-1">${booster.name}</span>`;
                  }}
                />
              ) : (
                <span className="text-xs font-bold text-gray-500 text-center px-1">{booster.name}</span>
              )}
            </div>
            <span className="text-xs font-medium text-gray-700 max-w-[60px] truncate">{booster.name}</span>
            <span className="text-xs text-gray-400">{ownedCount}/{boosterTotal}</span>
          </button>
        );
      })}
    </div>
  );
}

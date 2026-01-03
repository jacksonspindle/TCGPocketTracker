import { useMemo } from 'react';
import { Card, Collection, TCGPocketSet } from '../types';
import { BoosterSummary } from '../types/chat';
import { boosterToSetId, singleBoosterSets, excludedSets } from '../data/boosters';

function getCardsForBooster(cards: Card[], boosterId: string): Card[] {
  const setId = boosterToSetId[boosterId];

  // For single-booster sets (mini-sets), filter by set ID
  if (setId && singleBoosterSets.has(setId)) {
    return cards.filter(card => card.set.id === setId);
  }

  // For multi-booster sets, filter by booster ID
  return cards.filter(card =>
    card.boosters?.some(booster => booster.id === boosterId)
  );
}

export function useBoosterSummaries(
  cards: Card[],
  sets: TCGPocketSet[],
  collection: Collection
): BoosterSummary[] {
  return useMemo(() => {
    const summaries: BoosterSummary[] = [];

    for (const set of sets) {
      // Skip excluded sets (like promos)
      if (excludedSets.has(set.id)) {
        continue;
      }

      const boosters = set.boosters || [];

      for (const booster of boosters) {
        const boosterCards = getCardsForBooster(cards, booster.id);

        let ownedCount = 0;
        const missingByRarity: Record<string, number> = {};

        for (const card of boosterCards) {
          const isOwned = (collection[card.id] || 0) > 0;

          if (isOwned) {
            ownedCount++;
          } else {
            // Track missing cards by rarity
            const rarity = card.rarity || 'Unknown';
            missingByRarity[rarity] = (missingByRarity[rarity] || 0) + 1;
          }
        }

        const totalCards = boosterCards.length;
        const completionPercentage = totalCards > 0
          ? Math.round((ownedCount / totalCards) * 1000) / 10
          : 0;

        summaries.push({
          id: booster.id,
          name: booster.name,
          setId: set.id,
          setName: set.name,
          totalCards,
          ownedCards: ownedCount,
          completionPercentage,
          missingByRarity,
        });
      }
    }

    return summaries;
  }, [cards, sets, collection]);
}

import { useMemo } from 'react';
import { Card, Collection } from '../types';
import { CollectionSummary } from '../types/chat';

type Wishlist = Record<string, boolean>;

export function useCollectionSummary(
  cards: Card[],
  collection: Collection,
  wishlist: Wishlist = {}
): CollectionSummary {
  return useMemo(() => {
    const summary: CollectionSummary = {
      totalCards: cards.length,
      ownedCards: 0,
      completionPercentage: 0,
      wishlistedCards: 0,
      byRarity: {},
      byType: {},
      byCategory: {},
      byStage: {},
      byRarityAndCategory: {},
      byRarityAndType: {},
    };

    for (const card of cards) {
      const isOwned = (collection[card.id] || 0) > 0;
      const isWishlisted = wishlist[card.id] === true;
      if (isOwned) summary.ownedCards++;
      if (isWishlisted) summary.wishlistedCards++;

      const rarity = card.rarity || 'Unknown';
      const category = card.category || 'Unknown';

      // Aggregate by rarity
      if (!summary.byRarity[rarity]) {
        summary.byRarity[rarity] = { owned: 0, total: 0, wishlisted: 0 };
      }
      summary.byRarity[rarity].total++;
      if (isOwned) summary.byRarity[rarity].owned++;
      if (isWishlisted) summary.byRarity[rarity].wishlisted++;

      // Aggregate by type
      for (const type of card.types || []) {
        if (!summary.byType[type]) {
          summary.byType[type] = { owned: 0, total: 0, wishlisted: 0 };
        }
        summary.byType[type].total++;
        if (isOwned) summary.byType[type].owned++;
        if (isWishlisted) summary.byType[type].wishlisted++;

        // Cross-dimensional: rarity + type
        if (!summary.byRarityAndType[rarity]) {
          summary.byRarityAndType[rarity] = {};
        }
        if (!summary.byRarityAndType[rarity][type]) {
          summary.byRarityAndType[rarity][type] = { owned: 0, total: 0 };
        }
        summary.byRarityAndType[rarity][type].total++;
        if (isOwned) summary.byRarityAndType[rarity][type].owned++;
      }

      // Aggregate by category
      if (!summary.byCategory[category]) {
        summary.byCategory[category] = { owned: 0, total: 0, wishlisted: 0 };
      }
      summary.byCategory[category].total++;
      if (isOwned) summary.byCategory[category].owned++;
      if (isWishlisted) summary.byCategory[category].wishlisted++;

      // Cross-dimensional: rarity + category
      if (!summary.byRarityAndCategory[rarity]) {
        summary.byRarityAndCategory[rarity] = {};
      }
      if (!summary.byRarityAndCategory[rarity][category]) {
        summary.byRarityAndCategory[rarity][category] = { owned: 0, total: 0 };
      }
      summary.byRarityAndCategory[rarity][category].total++;
      if (isOwned) summary.byRarityAndCategory[rarity][category].owned++;

      // Aggregate by stage
      const stage = card.stage || 'N/A';
      if (!summary.byStage[stage]) {
        summary.byStage[stage] = { owned: 0, total: 0 };
      }
      summary.byStage[stage].total++;
      if (isOwned) summary.byStage[stage].owned++;
    }

    summary.completionPercentage = cards.length > 0
      ? Math.round((summary.ownedCards / summary.totalCards) * 1000) / 10
      : 0;

    return summary;
  }, [cards, collection, wishlist]);
}

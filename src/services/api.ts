import { Card, CardBrief, TCGPocketSeries, TCGPocketSet } from '../types';

const BASE_URL = 'https://api.tcgdex.net/v2/en';
const TCG_POCKET_SERIES_ID = 'tcgp';

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchWithCache<T>(url: string): Promise<T> {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const data = await response.json();
  cache.set(url, { data, timestamp: Date.now() });
  return data;
}

export async function getTCGPocketSeries(): Promise<TCGPocketSeries> {
  return fetchWithCache<TCGPocketSeries>(`${BASE_URL}/series/${TCG_POCKET_SERIES_ID}`);
}

export async function getSet(setId: string): Promise<TCGPocketSet> {
  return fetchWithCache<TCGPocketSet>(`${BASE_URL}/sets/${setId}`);
}

export async function getCard(cardId: string): Promise<Card> {
  return fetchWithCache<Card>(`${BASE_URL}/cards/${cardId}`);
}

export async function getCardsFromSet(setId: string): Promise<Card[]> {
  const set = await getSet(setId);
  if (!set.cards || set.cards.length === 0) {
    return [];
  }

  // Fetch full card details for each card in parallel
  const cardPromises = set.cards.map((card: CardBrief) => getCard(card.id));
  const cards = await Promise.all(cardPromises);
  return cards;
}

export async function getAllTCGPocketSets(): Promise<TCGPocketSet[]> {
  const series = await getTCGPocketSeries();
  // Fetch full set data for each set to get boosters info
  const setPromises = series.sets.map(set => getSet(set.id));
  const fullSets = await Promise.all(setPromises);
  return fullSets;
}

export async function getAllCards(
  onProgress?: (loaded: number, total: number) => void,
  existingSets?: TCGPocketSet[]
): Promise<Card[]> {
  // Use existing sets if provided, otherwise fetch them
  const sets = existingSets || await getAllTCGPocketSets();
  const allCards: Card[] = [];
  let loadedSets = 0;

  // Load cards from each set
  for (const set of sets) {
    if (set.cards && set.cards.length > 0) {
      // Fetch full card details for each card
      const cardPromises = set.cards.map((card: CardBrief) => getCard(card.id));
      const cards = await Promise.all(cardPromises);
      allCards.push(...cards);
    }
    loadedSets++;
    onProgress?.(loadedSets, sets.length);
  }

  return allCards;
}

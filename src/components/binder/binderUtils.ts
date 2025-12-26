import { Card } from '@/types'

export const CARDS_PER_PAGE = 9
export const PAGES_PER_SPREAD = 2

export function calculateTotalPages(cardCount: number): number {
  return Math.ceil(cardCount / CARDS_PER_PAGE)
}

export function calculateTotalSpreads(cardCount: number): number {
  const totalPages = calculateTotalPages(cardCount)
  return Math.ceil(totalPages / PAGES_PER_SPREAD)
}

export function getCardsForPage(cards: Card[], pageIndex: number): Card[] {
  const startIndex = pageIndex * CARDS_PER_PAGE
  return cards.slice(startIndex, startIndex + CARDS_PER_PAGE)
}

export function getCardsForSpread(cards: Card[], spreadIndex: number): {
  leftPage: Card[]
  rightPage: Card[]
} {
  const leftPageIndex = spreadIndex * 2
  const rightPageIndex = spreadIndex * 2 + 1
  return {
    leftPage: getCardsForPage(cards, leftPageIndex),
    rightPage: getCardsForPage(cards, rightPageIndex)
  }
}

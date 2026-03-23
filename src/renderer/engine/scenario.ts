/**
 * Scenario Analyzer: calculates equity for each possible next card (turn/river).
 */

import { type Card, buildDeck, cardToString } from './evaluator';
import { calculateEquity, type EquityResult } from './equity';
import type { RangeMatrix } from './ranges';

export interface CardEquity {
  card: Card;
  label: string;
  equities: number[]; // equity per player for this card
}

export interface ScenarioResult {
  cards: CardEquity[];
  baseEquities: number[]; // equity without the extra card (reference)
  timeMs: number;
}

/**
 * Analyze all possible next cards (turn or river).
 * Given ranges, a partial board, and dead cards, calculates equity
 * for each remaining card that could come next.
 */
export function analyzeScenario(
  ranges: RangeMatrix[],
  board: Card[],
  deadCards: Card[],
  iterationsPerCard: number = 5000,
): ScenarioResult {
  const startTime = performance.now();

  const usedCards = new Set<number>([...board, ...deadCards]);
  const remainingCards = buildDeck().filter(c => !usedCards.has(c));

  // Base equity (without additional card)
  const baseResult = calculateEquity({
    ranges,
    board,
    deadCards,
    iterations: iterationsPerCard * 2,
  });

  const cards: CardEquity[] = [];

  for (const card of remainingCards) {
    const newBoard = [...board, card];
    const result = calculateEquity({
      ranges,
      board: newBoard,
      deadCards,
      iterations: iterationsPerCard,
    });

    cards.push({
      card,
      label: cardToString(card),
      equities: result.equity,
    });
  }

  // Sort by equity of player 0 (hero) descending
  cards.sort((a, b) => b.equities[0] - a.equities[0]);

  return {
    cards,
    baseEquities: baseResult.equity,
    timeMs: performance.now() - startTime,
  };
}

/**
 * Equity Heatmap: calculates equity of each individual hand in hero's range
 * against the villain's entire range.
 */

import { type Card, evaluate7, buildDeck } from './evaluator';
import { generateCombosFromRange, generateCombosForHand, sampleCombo } from './combos';
import type { RangeMatrix } from './ranges';
import { type Combo } from './combos';

export interface HeatmapResult {
  /** 13x13 matrix of equity values (0-1), NaN if hand not in range */
  equities: number[][];
  timeMs: number;
}

/**
 * Calculate equity for each hand in hero's range vs villain's range.
 */
export function calculateHeatmap(
  heroRange: RangeMatrix,
  villainRange: RangeMatrix,
  board: Card[] = [],
  deadCards: Card[] = [],
  iterationsPerHand: number = 2000,
): HeatmapResult {
  const startTime = performance.now();
  const equities: number[][] = Array.from({ length: 13 }, () => Array(13).fill(NaN));

  const baseDead = new Set<Card>([...board, ...deadCards]);
  const villainCombos = generateCombosFromRange(villainRange, baseDead);
  const boardCardsToDeal = 5 - board.length;
  const baseDeckCards = buildDeck().filter(c => !baseDead.has(c));

  for (let row = 0; row < 13; row++) {
    for (let col = 0; col < 13; col++) {
      if (heroRange[row][col] <= 0) continue;

      const heroCombos = generateCombosForHand(row, col, 1, baseDead);
      if (heroCombos.length === 0) continue;

      let totalWins = 0;
      let totalTies = 0;
      let totalSims = 0;

      for (let iter = 0; iter < iterationsPerHand; iter++) {
        // Pick a random hero combo
        const heroIdx = Math.floor(Math.random() * heroCombos.length);
        const heroHand = heroCombos[heroIdx].cards;

        // Filter villain combos that don't conflict
        const available = villainCombos.filter(
          c => c.cards[0] !== heroHand[0] && c.cards[0] !== heroHand[1] &&
               c.cards[1] !== heroHand[0] && c.cards[1] !== heroHand[1]
        );
        if (available.length === 0) continue;

        const vIdx = sampleCombo(available);
        if (vIdx === -1) continue;
        const villainHand = available[vIdx].cards;

        // Deal board
        const usedInHands = new Set<number>([heroHand[0], heroHand[1], villainHand[0], villainHand[1]]);
        const deckForRound = baseDeckCards.filter(c => !usedInHands.has(c));
        if (deckForRound.length < boardCardsToDeal) continue;

        const fullBoard = [...board];
        for (let i = 0; i < boardCardsToDeal; i++) {
          const j = i + Math.floor(Math.random() * (deckForRound.length - i));
          const tmp = deckForRound[i];
          deckForRound[i] = deckForRound[j];
          deckForRound[j] = tmp;
          fullBoard.push(deckForRound[i]);
        }

        const heroRank = evaluate7([...heroHand, ...fullBoard]);
        const villainRank = evaluate7([...villainHand, ...fullBoard]);

        if (heroRank < villainRank) totalWins++;
        else if (heroRank === villainRank) totalTies++;
        totalSims++;
      }

      if (totalSims > 0) {
        equities[row][col] = (totalWins + totalTies / 2) / totalSims;
      }
    }
  }

  return { equities, timeMs: performance.now() - startTime };
}

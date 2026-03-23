/**
 * Combo generation: converts range matrix entries into concrete card pairs.
 * Handles card removal (dead cards / board cards / other players' cards).
 */

import { Card, makeCard } from './evaluator';
import { RANKS, SUITS } from './constants';
import type { RangeMatrix } from './ranges';

// Suit indices matching evaluator: s=0, h=1, d=2, c=3
const SUIT_INDEX: Record<string, number> = { s: 0, h: 1, d: 2, c: 3 };

/** A concrete combo: two cards + a weight (0-1) */
export interface Combo {
  cards: [Card, Card];
  weight: number;
}

/**
 * Rank index in RANKS array to evaluator rank (2-14).
 * RANKS[0] = 'A' → 14, RANKS[12] = '2' → 2
 */
function ranksIndexToEvalRank(idx: number): number {
  return 14 - idx; // A=14, K=13, ..., 2=2
}

/**
 * Generate all concrete combos for a single hand cell in the range grid.
 * Excludes combos containing any dead card.
 */
export function generateCombosForHand(
  row: number,
  col: number,
  weight: number,
  deadCards: Set<Card>,
): Combo[] {
  if (weight <= 0) return [];

  const rank1 = ranksIndexToEvalRank(row);
  const rank2 = ranksIndexToEvalRank(col);
  const combos: Combo[] = [];

  if (row === col) {
    // Pair: C(4,2) = 6 combos
    for (let s1 = 0; s1 < 4; s1++) {
      for (let s2 = s1 + 1; s2 < 4; s2++) {
        const c1 = makeCard(rank1, s1);
        const c2 = makeCard(rank2, s2);
        if (!deadCards.has(c1) && !deadCards.has(c2)) {
          combos.push({ cards: [c1, c2], weight });
        }
      }
    }
  } else if (row < col) {
    // Suited: 4 combos (same suit)
    for (let s = 0; s < 4; s++) {
      const c1 = makeCard(rank1, s);
      const c2 = makeCard(rank2, s);
      if (!deadCards.has(c1) && !deadCards.has(c2)) {
        combos.push({ cards: [c1, c2], weight });
      }
    }
  } else {
    // Offsuit: 12 combos (different suits)
    // Note: row > col means the grid label is RANKS[col]+RANKS[row]+"o"
    // but rank1 corresponds to row, rank2 to col
    for (let s1 = 0; s1 < 4; s1++) {
      for (let s2 = 0; s2 < 4; s2++) {
        if (s1 === s2) continue;
        const c1 = makeCard(rank1, s1);
        const c2 = makeCard(rank2, s2);
        if (!deadCards.has(c1) && !deadCards.has(c2)) {
          combos.push({ cards: [c1, c2], weight });
        }
      }
    }
  }

  return combos;
}

/**
 * Generate all concrete combos from a range matrix, excluding dead cards.
 */
export function generateCombosFromRange(
  range: RangeMatrix,
  deadCards: Set<Card> = new Set(),
): Combo[] {
  const combos: Combo[] = [];
  for (let row = 0; row < 13; row++) {
    for (let col = 0; col < 13; col++) {
      const weight = range[row][col];
      if (weight > 0) {
        const handCombos = generateCombosForHand(row, col, weight, deadCards);
        combos.push(...handCombos);
      }
    }
  }
  return combos;
}

/**
 * Sample a random combo from a list, respecting weights.
 * Returns the combo index, or -1 if no valid combo exists.
 */
export function sampleCombo(combos: Combo[]): number {
  if (combos.length === 0) return -1;

  // If all weights are 1, simple random pick
  const allFull = combos.every(c => c.weight >= 1);
  if (allFull) {
    return Math.floor(Math.random() * combos.length);
  }

  // Weighted sampling: accept/reject
  for (let attempt = 0; attempt < 1000; attempt++) {
    const idx = Math.floor(Math.random() * combos.length);
    if (Math.random() < combos[idx].weight) {
      return idx;
    }
  }

  // Fallback: pick any non-zero weight combo
  for (let i = 0; i < combos.length; i++) {
    if (combos[i].weight > 0) return i;
  }
  return -1;
}

/**
 * Parse a specific hand string like "AsKh" into a card pair.
 */
export function parseSpecificHand(hand: string): [Card, Card] | null {
  if (hand.length !== 4) return null;

  const rankMap: Record<string, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
  };

  const r1 = rankMap[hand[0].toUpperCase()];
  const s1 = SUIT_INDEX[hand[1].toLowerCase()];
  const r2 = rankMap[hand[2].toUpperCase()];
  const s2 = SUIT_INDEX[hand[3].toLowerCase()];

  if (r1 === undefined || s1 === undefined || r2 === undefined || s2 === undefined) {
    return null;
  }

  return [makeCard(r1, s1), makeCard(r2, s2)];
}

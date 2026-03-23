/**
 * Monte Carlo equity calculator.
 * Optimized: avoids allocations in hot loop, uses array indexing instead of Set/filter.
 */

import { Card, evaluate7, buildDeck } from './evaluator';
import { Combo, generateCombosFromRange, sampleCombo } from './combos';
import type { RangeMatrix } from './ranges';

export interface EquityResult {
  equity: number[];
  wins: number[];
  ties: number[];
  iterations: number;
  timeMs: number;
}

export interface EquityInput {
  ranges: RangeMatrix[];
  board: Card[];
  deadCards: Card[];
  iterations?: number;
}

/**
 * Run Monte Carlo equity simulation (optimized).
 */
export function calculateEquity(input: EquityInput): EquityResult {
  const startTime = performance.now();
  const numPlayers = input.ranges.length;
  const maxIterations = input.iterations ?? 100000;

  const wins = new Int32Array(numPlayers);
  const ties = new Int32Array(numPlayers);
  let validIterations = 0;

  const baseDead = new Set<Card>([...input.board, ...input.deadCards]);
  const playerCombos: Combo[][] = input.ranges.map(range =>
    generateCombosFromRange(range, baseDead)
  );
  const boardCardsToDeal = 5 - input.board.length;
  const baseDeckCards = buildDeck().filter(c => !baseDead.has(c));

  // Pre-allocate reusable arrays
  const used = new Uint8Array(52); // card usage flags
  const tempDeck = new Array(baseDeckCards.length);
  const board7 = new Array(7); // reusable 7-card hand
  const ranks = new Array(numPlayers);
  const playerHands = new Array(numPlayers);

  for (let iter = 0; iter < maxIterations; iter++) {
    // Reset used flags
    used.fill(0);
    let valid = true;

    for (let p = 0; p < numPlayers; p++) {
      const combos = playerCombos[p];
      // Sample with rejection for card conflicts
      let found = false;
      for (let attempt = 0; attempt < 100; attempt++) {
        const idx = Math.floor(Math.random() * combos.length);
        const combo = combos[idx];
        const c0 = combo.cards[0];
        const c1 = combo.cards[1];
        if (used[c0] || used[c1]) continue;
        // Weight check
        if (combo.weight < 1 && Math.random() >= combo.weight) continue;
        playerHands[p] = combo.cards;
        used[c0] = 1;
        used[c1] = 1;
        found = true;
        break;
      }
      if (!found) { valid = false; break; }
    }
    if (!valid) continue;

    // Build available deck for this round
    let deckLen = 0;
    for (let i = 0; i < baseDeckCards.length; i++) {
      if (!used[baseDeckCards[i]]) {
        tempDeck[deckLen++] = baseDeckCards[i];
      }
    }
    if (deckLen < boardCardsToDeal) continue;

    // Copy fixed board cards
    const boardLen = input.board.length;
    for (let i = 0; i < boardLen; i++) {
      board7[2 + i] = input.board[i];
    }
    // Deal remaining board cards (partial Fisher-Yates)
    for (let i = 0; i < boardCardsToDeal; i++) {
      const j = i + Math.floor(Math.random() * (deckLen - i));
      const tmp = tempDeck[i];
      tempDeck[i] = tempDeck[j];
      tempDeck[j] = tmp;
      board7[2 + boardLen + i] = tempDeck[i];
    }

    // Evaluate hands
    let bestRank = Infinity;
    for (let p = 0; p < numPlayers; p++) {
      const hand = playerHands[p];
      board7[0] = hand[0];
      board7[1] = hand[1];
      ranks[p] = evaluate7(board7);
      if (ranks[p] < bestRank) bestRank = ranks[p];
    }

    // Count winners
    let winnerCount = 0;
    let singleWinner = -1;
    for (let p = 0; p < numPlayers; p++) {
      if (ranks[p] === bestRank) {
        winnerCount++;
        singleWinner = p;
      }
    }

    if (winnerCount === 1) {
      wins[singleWinner]++;
    } else {
      for (let p = 0; p < numPlayers; p++) {
        if (ranks[p] === bestRank) ties[p]++;
      }
    }

    validIterations++;
  }

  const equity = new Array(numPlayers);
  const winPct = new Array(numPlayers);
  const tiePct = new Array(numPlayers);

  for (let p = 0; p < numPlayers; p++) {
    if (validIterations > 0) {
      winPct[p] = wins[p] / validIterations;
      tiePct[p] = ties[p] / validIterations;
      equity[p] = winPct[p] + tiePct[p] / 2;
    } else {
      winPct[p] = 0;
      tiePct[p] = 0;
      equity[p] = 0;
    }
  }

  return {
    equity, wins: winPct, ties: tiePct,
    iterations: validIterations,
    timeMs: performance.now() - startTime,
  };
}

/**
 * Calculate equity for a specific hand vs a range (optimized).
 */
export function calculateHandVsRange(
  hand: [Card, Card],
  villainRange: RangeMatrix,
  board: Card[] = [],
  deadCards: Card[] = [],
  iterations: number = 100000,
): EquityResult {
  const startTime = performance.now();

  let heroWins = 0;
  let tieCount = 0;
  let validIterations = 0;

  const baseDead = new Set<Card>([...board, ...deadCards, hand[0], hand[1]]);
  const villainCombos = generateCombosFromRange(villainRange, baseDead);
  if (villainCombos.length === 0) {
    return { equity: [0, 0], wins: [0, 0], ties: [0, 0], iterations: 0, timeMs: 0 };
  }

  const boardCardsToDeal = 5 - board.length;
  const baseDeckCards = buildDeck().filter(c => !baseDead.has(c));

  const tempDeck = new Array(baseDeckCards.length);
  const hero7 = new Array(7);
  const villain7 = new Array(7);
  hero7[0] = hand[0];
  hero7[1] = hand[1];
  for (let i = 0; i < board.length; i++) {
    hero7[2 + i] = board[i];
    villain7[2 + i] = board[i];
  }

  for (let iter = 0; iter < iterations; iter++) {
    // Sample villain combo
    const idx = Math.floor(Math.random() * villainCombos.length);
    const combo = villainCombos[idx];
    if (combo.weight < 1 && Math.random() >= combo.weight) continue;

    const vc0 = combo.cards[0];
    const vc1 = combo.cards[1];

    // Build deck excluding villain cards
    let deckLen = 0;
    for (let i = 0; i < baseDeckCards.length; i++) {
      const c = baseDeckCards[i];
      if (c !== vc0 && c !== vc1) tempDeck[deckLen++] = c;
    }
    if (deckLen < boardCardsToDeal) continue;

    // Deal board cards
    for (let i = 0; i < boardCardsToDeal; i++) {
      const j = i + Math.floor(Math.random() * (deckLen - i));
      const tmp = tempDeck[i];
      tempDeck[i] = tempDeck[j];
      tempDeck[j] = tmp;
      hero7[2 + board.length + i] = tempDeck[i];
      villain7[2 + board.length + i] = tempDeck[i];
    }

    villain7[0] = vc0;
    villain7[1] = vc1;

    const heroRank = evaluate7(hero7);
    const villainRank = evaluate7(villain7);

    if (heroRank < villainRank) heroWins++;
    else if (heroRank === villainRank) tieCount++;

    validIterations++;
  }

  const heroWinPct = validIterations > 0 ? heroWins / validIterations : 0;
  const heroTiePct = validIterations > 0 ? tieCount / validIterations : 0;
  const heroEquity = heroWinPct + heroTiePct / 2;

  return {
    equity: [heroEquity, 1 - heroEquity],
    wins: [heroWinPct, 1 - heroWinPct - heroTiePct],
    ties: [heroTiePct, heroTiePct],
    iterations: validIterations,
    timeMs: performance.now() - startTime,
  };
}

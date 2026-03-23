/**
 * Monte Carlo equity calculator.
 * Calculates win/tie/lose probabilities for range vs range scenarios.
 */

import { Card, evaluate7, buildDeck, cardToString } from './evaluator';
import { Combo, generateCombosFromRange, sampleCombo } from './combos';
import type { RangeMatrix } from './ranges';

export interface EquityResult {
  /** Equity per player (0-1) */
  equity: number[];
  /** Win percentage per player */
  wins: number[];
  /** Tie percentage per player */
  ties: number[];
  /** Total simulations run */
  iterations: number;
  /** Time in ms */
  timeMs: number;
}

export interface EquityInput {
  /** Range matrix per player (at least 2) */
  ranges: RangeMatrix[];
  /** Board cards (0-5 cards) */
  board: Card[];
  /** Dead cards */
  deadCards: Card[];
  /** Number of iterations (default 100000) */
  iterations?: number;
}

/**
 * Run Monte Carlo equity simulation.
 *
 * For each iteration:
 * 1. Sample a random combo from each player's range (respecting card removal)
 * 2. Deal remaining board cards from the deck
 * 3. Evaluate each player's 7-card hand
 * 4. Track wins and ties
 */
export function calculateEquity(input: EquityInput): EquityResult {
  const startTime = performance.now();
  const numPlayers = input.ranges.length;
  const maxIterations = input.iterations ?? 100000;

  const wins = new Array(numPlayers).fill(0);
  const ties = new Array(numPlayers).fill(0);
  let validIterations = 0;

  // Dead cards set: board + explicitly dead cards
  const baseDead = new Set<Card>([...input.board, ...input.deadCards]);

  // Pre-generate combos for each player (excluding board + dead cards)
  const playerCombos: Combo[][] = input.ranges.map(range =>
    generateCombosFromRange(range, baseDead)
  );

  // Number of board cards to deal
  const boardCardsToDeal = 5 - input.board.length;

  // Available deck (excluding board + dead cards)
  const baseDeckCards = buildDeck().filter(c => !baseDead.has(c));

  for (let iter = 0; iter < maxIterations; iter++) {
    // Sample a combo for each player, respecting mutual card removal
    const usedCards = new Set<Card>();
    const playerHands: [Card, Card][] = [];
    let valid = true;

    for (let p = 0; p < numPlayers; p++) {
      // Filter combos that don't conflict with already-used cards
      const available = playerCombos[p].filter(
        c => !usedCards.has(c.cards[0]) && !usedCards.has(c.cards[1])
      );

      if (available.length === 0) {
        valid = false;
        break;
      }

      const idx = sampleCombo(available);
      if (idx === -1) {
        valid = false;
        break;
      }

      const combo = available[idx];
      playerHands.push(combo.cards);
      usedCards.add(combo.cards[0]);
      usedCards.add(combo.cards[1]);
    }

    if (!valid) continue;

    // Deal remaining board cards
    const deckForRound = baseDeckCards.filter(c => !usedCards.has(c));

    if (deckForRound.length < boardCardsToDeal) continue;

    // Partial Fisher-Yates to pick boardCardsToDeal cards
    const board = [...input.board];
    for (let i = 0; i < boardCardsToDeal; i++) {
      const j = i + Math.floor(Math.random() * (deckForRound.length - i));
      const tmp = deckForRound[i];
      deckForRound[i] = deckForRound[j];
      deckForRound[j] = tmp;
      board.push(deckForRound[i]);
    }

    // Evaluate each player's hand (2 hole cards + 5 board cards = 7 cards)
    const ranks = new Array(numPlayers);
    for (let p = 0; p < numPlayers; p++) {
      const sevenCards = [...playerHands[p], ...board];
      ranks[p] = evaluate7(sevenCards);
    }

    // Find winner(s) - lowest rank wins
    let bestRank = Infinity;
    for (let p = 0; p < numPlayers; p++) {
      if (ranks[p] < bestRank) bestRank = ranks[p];
    }

    const winners: number[] = [];
    for (let p = 0; p < numPlayers; p++) {
      if (ranks[p] === bestRank) winners.push(p);
    }

    if (winners.length === 1) {
      wins[winners[0]]++;
    } else {
      for (const w of winners) {
        ties[w]++;
      }
    }

    validIterations++;
  }

  // Calculate equity: win + tie_share
  const equity = new Array(numPlayers);
  const winPct = new Array(numPlayers);
  const tiePct = new Array(numPlayers);

  for (let p = 0; p < numPlayers; p++) {
    if (validIterations > 0) {
      winPct[p] = wins[p] / validIterations;
      tiePct[p] = ties[p] / validIterations;
      // Equity = win% + (tie% / avg_tied_players) — simplified as win + tie_share
      equity[p] = winPct[p] + tiePct[p] / 2;
    } else {
      winPct[p] = 0;
      tiePct[p] = 0;
      equity[p] = 0;
    }
  }

  return {
    equity,
    wins: winPct,
    ties: tiePct,
    iterations: validIterations,
    timeMs: performance.now() - startTime,
  };
}

/**
 * Calculate equity for a specific hand vs a range.
 * Convenience wrapper where player 1 has a specific hand.
 */
export function calculateHandVsRange(
  hand: [Card, Card],
  villainRange: RangeMatrix,
  board: Card[] = [],
  deadCards: Card[] = [],
  iterations: number = 100000,
): EquityResult {
  const startTime = performance.now();
  const maxIterations = iterations;

  let wins = 0;
  let tiesCount = 0;
  let validIterations = 0;

  // Dead cards: board + dead + hero's hand
  const baseDead = new Set<Card>([...board, ...deadCards, hand[0], hand[1]]);

  // Villain combos
  const villainCombos = generateCombosFromRange(villainRange, baseDead);
  if (villainCombos.length === 0) {
    return { equity: [0, 0], wins: [0, 0], ties: [0, 0], iterations: 0, timeMs: 0 };
  }

  const boardCardsToDeal = 5 - board.length;
  const baseDeckCards = buildDeck().filter(c => !baseDead.has(c));

  for (let iter = 0; iter < maxIterations; iter++) {
    // Sample villain's hand
    const available = villainCombos;
    const idx = sampleCombo(available);
    if (idx === -1) continue;

    const villainHand = available[idx].cards;

    // Deal board
    const deckForRound = baseDeckCards.filter(
      c => c !== villainHand[0] && c !== villainHand[1]
    );

    if (deckForRound.length < boardCardsToDeal) continue;

    const fullBoard = [...board];
    for (let i = 0; i < boardCardsToDeal; i++) {
      const j = i + Math.floor(Math.random() * (deckForRound.length - i));
      const tmp = deckForRound[i];
      deckForRound[i] = deckForRound[j];
      deckForRound[j] = tmp;
      fullBoard.push(deckForRound[i]);
    }

    const heroRank = evaluate7([...hand, ...fullBoard]);
    const villainRank = evaluate7([...villainHand, ...fullBoard]);

    if (heroRank < villainRank) {
      wins++;
    } else if (heroRank === villainRank) {
      tiesCount++;
    }

    validIterations++;
  }

  const heroWinPct = validIterations > 0 ? wins / validIterations : 0;
  const heroTiePct = validIterations > 0 ? tiesCount / validIterations : 0;
  const heroEquity = heroWinPct + heroTiePct / 2;

  return {
    equity: [heroEquity, 1 - heroEquity],
    wins: [heroWinPct, 1 - heroWinPct - heroTiePct],
    ties: [heroTiePct, heroTiePct],
    iterations: validIterations,
    timeMs: performance.now() - startTime,
  };
}

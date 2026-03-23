/**
 * Fast poker hand evaluator.
 * Evaluates 5-card and 7-card hands, returning a numeric rank (lower = stronger).
 *
 * Uses bit manipulation for speed:
 * - Each card is represented as a number 0-51
 * - Rank = card >> 2 (0=2, 1=3, ..., 12=Ace)
 * - Suit = card & 3 (0=spade, 1=heart, 2=diamond, 3=club)
 */

// Card representation: 0-51
// rank = card >> 2  (0=2, 1=3, 2=4, ..., 8=T, 9=J, 10=Q, 11=K, 12=A)
// suit = card & 3   (0=s, 1=h, 2=d, 3=c)

export type Card = number;

export const CARD_RANKS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] as const; // 2-14 (A=14)

// Hand categories (lower = stronger)
export const enum HandCategory {
  STRAIGHT_FLUSH = 0,
  FOUR_OF_A_KIND = 1,
  FULL_HOUSE = 2,
  FLUSH = 3,
  STRAIGHT = 4,
  THREE_OF_A_KIND = 5,
  TWO_PAIR = 6,
  ONE_PAIR = 7,
  HIGH_CARD = 8,
}

// Convert rank/suit to card number
export function makeCard(rank: number, suit: number): Card {
  // rank: 2=0, 3=1, ..., A=12
  return (rank - 2) * 4 + suit;
}

// Parse card string like "As", "Th", "2d" to card number
export function parseCard(s: string): Card {
  const rankChar = s[0].toUpperCase();
  const suitChar = s[1].toLowerCase();

  const rankMap: Record<string, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
  };
  const suitMap: Record<string, number> = { 's': 0, 'h': 1, 'd': 2, 'c': 3 };

  const rank = rankMap[rankChar];
  const suit = suitMap[suitChar];
  if (rank === undefined || suit === undefined) {
    throw new Error(`Invalid card: ${s}`);
  }
  return makeCard(rank, suit);
}

export function cardRank(card: Card): number {
  return (card >> 2) + 2; // 2-14
}

export function cardSuit(card: Card): number {
  return card & 3; // 0-3
}

export function cardToString(card: Card): string {
  const ranks = '23456789TJQKA';
  const suits = 'shdc';
  return ranks[card >> 2] + suits[card & 3];
}

/**
 * Evaluate a 5-card hand. Returns a numeric rank where lower = stronger.
 * The rank encodes category + kickers for proper comparison.
 *
 * Rank structure: category * 10^8 + kicker_value
 * This ensures any hand in a better category always beats any hand in a worse category.
 */
export function evaluate5(cards: Card[]): number {
  // Extract ranks and suits
  const ranks = new Array(5);
  const suits = new Array(5);
  for (let i = 0; i < 5; i++) {
    ranks[i] = cardRank(cards[i]);
    suits[i] = cardSuit(cards[i]);
  }

  // Sort ranks descending
  ranks.sort((a: number, b: number) => b - a);

  // Check flush
  const isFlush = suits[0] === suits[1] && suits[1] === suits[2] &&
                  suits[2] === suits[3] && suits[3] === suits[4];

  // Check straight
  let isStraight = false;
  let straightHigh = 0;

  if (ranks[0] - ranks[4] === 4 &&
      new Set(ranks).size === 5) {
    isStraight = true;
    straightHigh = ranks[0];
  }
  // Wheel: A-2-3-4-5
  if (ranks[0] === 14 && ranks[1] === 5 && ranks[2] === 4 &&
      ranks[3] === 3 && ranks[4] === 2) {
    isStraight = true;
    straightHigh = 5; // 5-high straight
  }

  // Count rank frequencies
  const freq = new Map<number, number>();
  for (const r of ranks) {
    freq.set(r, (freq.get(r) || 0) + 1);
  }

  const counts = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1] || b[0] - a[0]); // Sort by count desc, then rank desc

  // Invert rank: A(14)→0, K(13)→1, ..., 2→12
  // This way lower = better (higher poker rank)
  const inv = (r: number) => 14 - r;

  // Straight flush
  if (isFlush && isStraight) {
    return HandCategory.STRAIGHT_FLUSH * 100000000 + inv(straightHigh);
  }

  // Four of a kind
  if (counts[0][1] === 4) {
    return HandCategory.FOUR_OF_A_KIND * 100000000 +
           inv(counts[0][0]) * 100 + inv(counts[1][0]);
  }

  // Full house
  if (counts[0][1] === 3 && counts[1][1] === 2) {
    return HandCategory.FULL_HOUSE * 100000000 +
           inv(counts[0][0]) * 100 + inv(counts[1][0]);
  }

  // Flush
  if (isFlush) {
    return HandCategory.FLUSH * 100000000 +
           inv(ranks[0]) * 1000000 + inv(ranks[1]) * 10000 + inv(ranks[2]) * 1000 +
           inv(ranks[3]) * 100 + inv(ranks[4]);
  }

  // Straight
  if (isStraight) {
    return HandCategory.STRAIGHT * 100000000 + inv(straightHigh);
  }

  // Three of a kind
  if (counts[0][1] === 3) {
    const kickers = counts.filter(c => c[1] === 1).map(c => c[0]).sort((a, b) => b - a);
    return HandCategory.THREE_OF_A_KIND * 100000000 +
           inv(counts[0][0]) * 10000 + inv(kickers[0]) * 100 + inv(kickers[1]);
  }

  // Two pair
  if (counts[0][1] === 2 && counts[1][1] === 2) {
    const pairs = [counts[0][0], counts[1][0]].sort((a, b) => b - a);
    const kicker = counts[2][0];
    return HandCategory.TWO_PAIR * 100000000 +
           inv(pairs[0]) * 10000 + inv(pairs[1]) * 100 + inv(kicker);
  }

  // One pair
  if (counts[0][1] === 2) {
    const kickers = counts.filter(c => c[1] === 1).map(c => c[0]).sort((a, b) => b - a);
    return HandCategory.ONE_PAIR * 100000000 +
           inv(counts[0][0]) * 1000000 + inv(kickers[0]) * 10000 + inv(kickers[1]) * 100 + inv(kickers[2]);
  }

  // High card
  return HandCategory.HIGH_CARD * 100000000 +
         inv(ranks[0]) * 1000000 + inv(ranks[1]) * 10000 + inv(ranks[2]) * 1000 +
         inv(ranks[3]) * 100 + inv(ranks[4]);
}

/**
 * Evaluate the best 5-card hand from 7 cards.
 * Checks all C(7,5) = 21 combinations and returns the best (lowest) rank.
 */
export function evaluate7(cards: Card[]): number {
  let best = Infinity;
  // Generate all C(7,5) = 21 combinations
  for (let i = 0; i < 7; i++) {
    for (let j = i + 1; j < 7; j++) {
      // Exclude cards[i] and cards[j]
      const hand: Card[] = [];
      for (let k = 0; k < 7; k++) {
        if (k !== i && k !== j) hand.push(cards[k]);
      }
      const rank = evaluate5(hand);
      if (rank < best) best = rank;
    }
  }
  return best;
}

/**
 * Get the hand category name from a rank value.
 */
export function handCategoryName(rank: number): string {
  const cat = Math.floor(rank / 100000000);
  switch (cat) {
    case HandCategory.STRAIGHT_FLUSH: return 'Straight Flush';
    case HandCategory.FOUR_OF_A_KIND: return 'Four of a Kind';
    case HandCategory.FULL_HOUSE: return 'Full House';
    case HandCategory.FLUSH: return 'Flush';
    case HandCategory.STRAIGHT: return 'Straight';
    case HandCategory.THREE_OF_A_KIND: return 'Three of a Kind';
    case HandCategory.TWO_PAIR: return 'Two Pair';
    case HandCategory.ONE_PAIR: return 'One Pair';
    case HandCategory.HIGH_CARD: return 'High Card';
    default: return 'Unknown';
  }
}

/**
 * Build a full 52-card deck.
 */
export function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (let i = 0; i < 52; i++) {
    deck.push(i);
  }
  return deck;
}

/**
 * Fisher-Yates shuffle (in-place).
 */
export function shuffleDeck(deck: Card[]): void {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = deck[i];
    deck[i] = deck[j];
    deck[j] = tmp;
  }
}

export const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const;
export type Rank = (typeof RANKS)[number];

export const SUITS = ['s', 'h', 'd', 'c'] as const;
export type Suit = (typeof SUITS)[number];

export const SUIT_SYMBOLS: Record<Suit, string> = {
  s: '♠',
  h: '♥',
  d: '♦',
  c: '♣',
};

export const SUIT_COLORS: Record<Suit, string> = {
  s: '#1a1a2e',
  h: '#dc2626',
  d: '#2563eb',
  c: '#16a34a',
};

export type HandType = 'pair' | 'suited' | 'offsuit';

export interface HandCombo {
  rank1: Rank;
  rank2: Rank;
  label: string;
  type: HandType;
  combos: number;
}

// Build the 13x13 grid labels
export function getHandLabel(row: number, col: number): string {
  const r1 = RANKS[row];
  const r2 = RANKS[col];
  if (row === col) return `${r1}${r2}`;
  if (row < col) return `${r1}${r2}s`;
  return `${r2}${r1}o`;
}

export function getHandType(row: number, col: number): HandType {
  if (row === col) return 'pair';
  if (row < col) return 'suited';
  return 'offsuit';
}

export function getComboCount(type: HandType): number {
  switch (type) {
    case 'pair': return 6;
    case 'suited': return 4;
    case 'offsuit': return 12;
  }
}

export const TOTAL_COMBOS = 1326;

// Hand rankings from best to worst (169 unique hands)
// Based on preflop all-in equity vs random hand
export const HAND_RANKINGS: string[] = [
  // ~Top 1-2%
  'AA', 'KK', 'QQ', 'AKs', 'JJ',
  // ~Top 3-5%
  'AQs', 'TT', 'AKo', 'AJs', 'KQs',
  '99', 'ATs', 'AQo', 'KJs', '88',
  // ~Top 8-10%
  'KTs', 'QJs', 'A9s', 'AJo', 'QTs',
  '77', 'KQo', 'JTs', 'A8s', 'K9s',
  // ~Top 13-15%
  'ATo', 'A5s', 'A7s', '66', 'KJo',
  'A4s', 'A6s', 'A3s', 'QJo', 'K8s',
  // ~Top 18-20%
  'Q9s', 'JTo', 'A2s', '55', 'KTo',
  'J9s', 'QTo', 'T9s', 'K7s', 'A9o',
  // ~Top 23-25%
  'K6s', '44', 'Q8s', 'J8s', '98s',
  'T8s', 'K5s', 'A8o', 'K4s', 'Q9o',
  // ~Top 28-30%
  '33', '87s', 'J9o', 'A5o', 'Q7s',
  '97s', 'A7o', 'T9o', 'K3s', 'J7s',
  // ~Top 33-35%
  '76s', '22', 'K2s', 'Q6s', 'A4o',
  '98o', '86s', 'T7s', 'A6o', 'K9o',
  // ~Top 38-40%
  '65s', 'A3o', 'Q5s', 'J8o', '96s',
  '54s', 'T8o', '87o', 'Q4s', 'K8o',
  // ~Top 43-45%
  '75s', 'A2o', 'Q3s', 'J6s', '85s',
  'K7o', 'Q8o', '97o', 'J5s', '64s',
  // ~Top 48-50%
  'Q2s', 'T6s', '53s', '76o', 'J4s',
  '86o', 'K6o', '95s', 'J3s', '43s',
  // ~Top 53-55%
  'T7o', '74s', 'J2s', '65o', 'K5o',
  // ~Top 58-60%
  'Q7o', '54o', '84s', 'T5s', '96o',
  // ~Top 63-65%
  'K4o', '63s', '93s', 'T4s', '75o',
  // ~Top 68-70%
  'Q6o', '85o', '52s', 'K3o', 'T3s',
  // ~Top 73-75%
  '42s', '64o', 'Q5o', '94o', 'T2s',
  // ~Top 78-80%
  'K2o', '92s', '83s', '53o', '73s',
  // ~Top 83-85%
  'Q4o', '43o', '74o', 'J7o', '82s',
  // ~Top 88-90%
  'Q3o', '62s', '84o', '93o', '72s',
  // ~Top 93-95%
  'Q2o', '63o', '52o', '73o', '42o',
  // ~Top 96-100%
  'J6o', '32s', '82o', '92o', '62o',
  'T6o', 'J5o', '32o', 'J4o', 'J3o',
  'J2o', 'T5o', 'T4o', 'T3o', 'T2o',
  '95o', '94s', '83o', '72o',
];

// Build a map from hand label to ranking index for fast lookup
export const HAND_RANK_MAP: Map<string, number> = new Map();
HAND_RANKINGS.forEach((hand, idx) => {
  HAND_RANK_MAP.set(hand, idx);
});

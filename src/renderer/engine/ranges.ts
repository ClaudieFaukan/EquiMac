import { RANKS, HAND_RANKINGS, getHandLabel, getHandType, getComboCount, TOTAL_COMBOS, type HandType } from './constants';

// A range is a 13x13 matrix of weights (0.0 to 1.0)
export type RangeMatrix = number[][];

export function createEmptyRange(): RangeMatrix {
  return Array.from({ length: 13 }, () => Array(13).fill(0));
}

export function createFullRange(): RangeMatrix {
  return Array.from({ length: 13 }, () => Array(13).fill(1));
}

export function cloneRange(range: RangeMatrix): RangeMatrix {
  return range.map(row => [...row]);
}

// Count selected combos (weighted)
export function countCombos(range: RangeMatrix): number {
  let total = 0;
  for (let r = 0; r < 13; r++) {
    for (let c = 0; c < 13; c++) {
      if (range[r][c] > 0) {
        const type = getHandType(r, c);
        total += getComboCount(type) * range[r][c];
      }
    }
  }
  return Math.round(total * 100) / 100;
}

// Percentage of total combos
export function rangePercentage(range: RangeMatrix): number {
  return (countCombos(range) / TOTAL_COMBOS) * 100;
}

// Select top X% of hands based on HAND_RANKINGS
export function selectTopPercent(percent: number): RangeMatrix {
  const range = createEmptyRange();
  if (percent <= 0) return range;
  if (percent >= 100) return createFullRange();

  const targetCombos = (percent / 100) * TOTAL_COMBOS;
  let accumulated = 0;

  for (const hand of HAND_RANKINGS) {
    const { row, col } = handToGridPosition(hand);
    const type = getHandType(row, col);
    const combos = getComboCount(type);

    if (accumulated + combos <= targetCombos) {
      range[row][col] = 1;
      accumulated += combos;
    } else {
      // Partial weight for the boundary hand
      const remaining = targetCombos - accumulated;
      if (remaining > 0) {
        range[row][col] = Math.round((remaining / combos) * 100) / 100;
        accumulated += remaining;
      }
      break;
    }
  }

  return range;
}

// Select hands between two percentages (for double slider)
export function selectPercentRange(lowPercent: number, highPercent: number): RangeMatrix {
  const fullRange = selectTopPercent(highPercent);
  const excludeRange = selectTopPercent(lowPercent);
  const range = createEmptyRange();

  for (let r = 0; r < 13; r++) {
    for (let c = 0; c < 13; c++) {
      range[r][c] = Math.max(0, fullRange[r][c] - excludeRange[r][c]);
    }
  }

  return range;
}

// Convert hand label to grid position
export function handToGridPosition(hand: string): { row: number; col: number } {
  const r1 = hand[0];
  const r2 = hand[1];
  const suffix = hand[2] as 's' | 'o' | undefined;

  const idx1 = RANKS.indexOf(r1 as any);
  const idx2 = RANKS.indexOf(r2 as any);

  if (idx1 === idx2) {
    // Pair
    return { row: idx1, col: idx1 };
  } else if (suffix === 's') {
    // Suited: higher rank is row, lower rank is col (above diagonal)
    const highIdx = Math.min(idx1, idx2);
    const lowIdx = Math.max(idx1, idx2);
    return { row: highIdx, col: lowIdx };
  } else {
    // Offsuit: higher rank is col, lower rank is row (below diagonal)
    const highIdx = Math.min(idx1, idx2);
    const lowIdx = Math.max(idx1, idx2);
    return { row: lowIdx, col: highIdx };
  }
}

// Parse a range notation string into a RangeMatrix
export function parseRangeNotation(notation: string): RangeMatrix {
  const range = createEmptyRange();
  if (!notation.trim()) return range;

  const parts = notation.split(',').map(s => s.trim()).filter(Boolean);

  for (const part of parts) {
    const hands = expandNotation(part);
    for (const hand of hands) {
      const { row, col } = handToGridPosition(hand);
      range[row][col] = 1;
    }
  }

  return range;
}

// Expand a single notation part into hand labels
function expandNotation(part: string): string[] {
  // Specific combo like AhKh - skip for grid (handled at combo level)
  if (part.length === 4 && 'shdc'.includes(part[1]) && 'shdc'.includes(part[3])) {
    return [];
  }

  // Range with + suffix: TT+ or ATs+
  if (part.endsWith('+')) {
    const base = part.slice(0, -1);
    return expandPlus(base);
  }

  // Range with dash: TT-77 or A2s-A5s
  if (part.includes('-')) {
    const [start, end] = part.split('-');
    return expandDash(start, end);
  }

  // Single hand: AA, AKs, AKo, AK
  if (part.length === 2) {
    const r1 = part[0];
    const r2 = part[1];
    if (r1 === r2) return [part]; // Pair
    return [`${part}s`, `${part}o`]; // Both suited and offsuit
  }

  if (part.length === 3 && (part[2] === 's' || part[2] === 'o')) {
    return [part];
  }

  return [];
}

function expandPlus(base: string): string[] {
  const hands: string[] = [];
  const r1 = base[0];
  const r2 = base.length > 1 ? base[1] : r1;
  const suffix = base.length === 3 ? base[2] : undefined;

  const idx1 = RANKS.indexOf(r1 as any);
  const idx2 = RANKS.indexOf(r2 as any);

  if (r1 === r2) {
    // Pair+: TT+ means TT, JJ, QQ, KK, AA
    for (let i = idx1; i >= 0; i--) {
      hands.push(`${RANKS[i]}${RANKS[i]}`);
    }
  } else if (suffix === 's' || suffix === 'o') {
    // Suited/offsuit+: ATs+ means ATs, AJs, AQs, AKs
    const highIdx = Math.min(idx1, idx2);
    const lowIdx = Math.max(idx1, idx2);
    const highRank = RANKS[highIdx];
    for (let i = lowIdx; i > highIdx; i--) {
      hands.push(`${highRank}${RANKS[i]}${suffix}`);
    }
  }

  return hands;
}

function expandDash(start: string, end: string): string[] {
  const hands: string[] = [];

  const r1s = start[0];
  const r2s = start.length >= 2 ? start[1] : r1s;
  const suffixS = start.length === 3 ? start[2] : undefined;

  const r1e = end[0];
  const r2e = end.length >= 2 ? end[1] : r1e;

  if (r1s === r2s && r1e === r2e) {
    // Pair range: TT-77
    const idxHigh = RANKS.indexOf(r1s as any);
    const idxLow = RANKS.indexOf(r1e as any);
    const from = Math.min(idxHigh, idxLow);
    const to = Math.max(idxHigh, idxLow);
    for (let i = from; i <= to; i++) {
      hands.push(`${RANKS[i]}${RANKS[i]}`);
    }
  } else if (suffixS) {
    // Same first rank, varying second: A2s-A5s
    const high = r1s;
    const idxStart = RANKS.indexOf(r2s as any);
    const idxEnd = RANKS.indexOf(r2e as any);
    const from = Math.min(idxStart, idxEnd);
    const to = Math.max(idxStart, idxEnd);
    for (let i = from; i <= to; i++) {
      hands.push(`${high}${RANKS[i]}${suffixS}`);
    }
  }

  return hands;
}

// Serialize a RangeMatrix to text notation
export function rangeToNotation(range: RangeMatrix): string {
  const selectedHands: string[] = [];

  for (let r = 0; r < 13; r++) {
    for (let c = 0; c < 13; c++) {
      if (range[r][c] >= 1) {
        selectedHands.push(getHandLabel(r, c));
      }
    }
  }

  if (selectedHands.length === 0) return '';

  return compressNotation(selectedHands, range);
}

function compressNotation(hands: string[], range: RangeMatrix): string {
  const pairs: string[] = [];
  const suited: Map<string, string[]> = new Map();
  const offsuit: Map<string, string[]> = new Map();

  for (const hand of hands) {
    if (hand.length === 2) {
      pairs.push(hand);
    } else if (hand[2] === 's') {
      const high = hand[0];
      if (!suited.has(high)) suited.set(high, []);
      suited.get(high)!.push(hand);
    } else {
      const high = hand[0];
      if (!offsuit.has(high)) offsuit.set(high, []);
      offsuit.get(high)!.push(hand);
    }
  }

  const parts: string[] = [];

  // Compress pairs
  if (pairs.length > 0) {
    parts.push(...compressPairs(pairs));
  }

  // Compress suited
  for (const [, suitedHands] of suited) {
    parts.push(...compressConnected(suitedHands, 's'));
  }

  // Compress offsuit
  for (const [, offsuitHands] of offsuit) {
    parts.push(...compressConnected(offsuitHands, 'o'));
  }

  return parts.join(', ');
}

function compressPairs(pairs: string[]): string[] {
  const indices = pairs.map(p => RANKS.indexOf(p[0] as any)).sort((a, b) => a - b);
  const results: string[] = [];
  let i = 0;

  while (i < indices.length) {
    let j = i;
    while (j + 1 < indices.length && indices[j + 1] === indices[j] + 1) {
      j++;
    }

    if (indices[i] === 0) {
      // Starts at AA
      if (j === i) {
        results.push('AA');
      } else {
        results.push(`${RANKS[indices[j]]}${RANKS[indices[j]]}+`);
      }
    } else if (j > i) {
      results.push(`${RANKS[indices[i]]}${RANKS[indices[i]]}-${RANKS[indices[j]]}${RANKS[indices[j]]}`);
    } else {
      results.push(`${RANKS[indices[i]]}${RANKS[indices[i]]}`);
    }
    i = j + 1;
  }

  return results;
}

function compressConnected(hands: string[], suffix: 's' | 'o'): string[] {
  if (hands.length === 0) return [];

  const high = hands[0][0];
  const highIdx = RANKS.indexOf(high as any);
  const lowIndices = hands
    .map(h => RANKS.indexOf(h[1] as any))
    .sort((a, b) => a - b);

  const results: string[] = [];
  let i = 0;

  while (i < lowIndices.length) {
    let j = i;
    while (j + 1 < lowIndices.length && lowIndices[j + 1] === lowIndices[j] + 1) {
      j++;
    }

    if (lowIndices[i] === highIdx + 1) {
      // Adjacent to high card
      if (j === i) {
        results.push(`${high}${RANKS[lowIndices[i]]}${suffix}`);
      } else {
        results.push(`${high}${RANKS[lowIndices[j]]}${suffix}+`);
      }
    } else if (j > i) {
      results.push(`${high}${RANKS[lowIndices[j]]}${suffix}-${high}${RANKS[lowIndices[i]]}${suffix}`);
    } else {
      results.push(`${high}${RANKS[lowIndices[i]]}${suffix}`);
    }
    i = j + 1;
  }

  return results;
}

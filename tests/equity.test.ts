import { describe, it, expect } from 'vitest';
import { calculateHandVsRange, calculateEquity } from '../src/renderer/engine/equity';
import { parseCard } from '../src/renderer/engine/evaluator';
import { createFullRange, parseRangeNotation } from '../src/renderer/engine/ranges';

function cards(strs: string[]) {
  return strs.map(parseCard);
}

describe('Hand vs Range equity', () => {
  it('AA vs random range ≈ 85%', () => {
    const hand: [number, number] = [parseCard('As'), parseCard('Ah')];
    const result = calculateHandVsRange(hand, createFullRange(), [], [], 50000);
    expect(result.equity[0]).toBeCloseTo(0.85, 1);
  }, 30000);

  it('72o vs random range ≈ 34%', () => {
    const hand: [number, number] = [parseCard('7s'), parseCard('2h')];
    const result = calculateHandVsRange(hand, createFullRange(), [], [], 50000);
    expect(result.equity[0]).toBeCloseTo(0.34, 1);
  }, 30000);
});

describe('Range vs Range equity', () => {
  it('AA vs KK preflop ≈ 82%', () => {
    const aaRange = parseRangeNotation('AA');
    const kkRange = parseRangeNotation('KK');
    const result = calculateEquity({
      ranges: [aaRange, kkRange],
      board: [],
      deadCards: [],
      iterations: 50000,
    });
    expect(result.equity[0]).toBeCloseTo(0.82, 1);
  }, 30000);

  it('AKs vs QQ preflop ≈ 46%', () => {
    const akRange = parseRangeNotation('AKs');
    const qqRange = parseRangeNotation('QQ');
    const result = calculateEquity({
      ranges: [akRange, qqRange],
      board: [],
      deadCards: [],
      iterations: 50000,
    });
    expect(result.equity[0]).toBeCloseTo(0.46, 1);
  }, 30000);

  it('AA vs KK on board with flop', () => {
    const aaRange = parseRangeNotation('AA');
    const kkRange = parseRangeNotation('KK');
    const board = cards(['Ks', '7h', '2d']); // K on flop helps KK
    const result = calculateEquity({
      ranges: [aaRange, kkRange],
      board,
      deadCards: [],
      iterations: 50000,
    });
    // KK has a set, should win most of the time now
    expect(result.equity[1]).toBeGreaterThan(0.8);
  }, 30000);
});

describe('Combo counting', () => {
  it('Returns correct number of iterations', () => {
    const aaRange = parseRangeNotation('AA');
    const kkRange = parseRangeNotation('KK');
    const result = calculateEquity({
      ranges: [aaRange, kkRange],
      board: [],
      deadCards: [],
      iterations: 1000,
    });
    // Should get close to 1000 valid iterations
    expect(result.iterations).toBeGreaterThan(500);
    expect(result.iterations).toBeLessThanOrEqual(1000);
  });
});

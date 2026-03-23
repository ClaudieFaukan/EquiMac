import { describe, it, expect } from 'vitest';
import {
  parseRangeNotation, rangeToNotation, countCombos, rangePercentage,
  createEmptyRange, createFullRange, selectTopPercent, handToGridPosition,
} from '../src/renderer/engine/ranges';
import { getHandLabel } from '../src/renderer/engine/constants';

describe('parseRangeNotation', () => {
  it('parses single pair', () => {
    const range = parseRangeNotation('AA');
    expect(range[0][0]).toBe(1); // AA at [0,0]
    expect(countCombos(range)).toBe(6);
  });

  it('parses pair+ notation', () => {
    const range = parseRangeNotation('TT+');
    // TT, JJ, QQ, KK, AA
    expect(countCombos(range)).toBe(30); // 5 pairs × 6 combos
  });

  it('parses pair range TT-77', () => {
    const range = parseRangeNotation('TT-77');
    // 77, 88, 99, TT
    expect(countCombos(range)).toBe(24); // 4 pairs × 6
  });

  it('parses suited hand', () => {
    const range = parseRangeNotation('AKs');
    expect(countCombos(range)).toBe(4);
  });

  it('parses offsuit hand', () => {
    const range = parseRangeNotation('AKo');
    expect(countCombos(range)).toBe(12);
  });

  it('parses AK (both suited and offsuit)', () => {
    const range = parseRangeNotation('AK');
    expect(countCombos(range)).toBe(16); // 4 suited + 12 offsuit
  });

  it('parses suited+ notation', () => {
    const range = parseRangeNotation('ATs+');
    // ATs, AJs, AQs, AKs
    expect(countCombos(range)).toBe(16); // 4 hands × 4 combos
  });

  it('parses suited range A2s-A5s', () => {
    const range = parseRangeNotation('A2s-A5s');
    // A2s, A3s, A4s, A5s
    expect(countCombos(range)).toBe(16); // 4 hands × 4 combos
  });

  it('parses complex notation', () => {
    const range = parseRangeNotation('QQ+, AKs, AKo');
    // QQ(6) + KK(6) + AA(6) + AKs(4) + AKo(12) = 34
    expect(countCombos(range)).toBe(34);
  });

  it('handles empty string', () => {
    const range = parseRangeNotation('');
    expect(countCombos(range)).toBe(0);
  });

  it('handles spaces', () => {
    const range = parseRangeNotation('  AA , KK  ');
    expect(countCombos(range)).toBe(12);
  });
});

describe('rangeToNotation', () => {
  it('serializes single pair', () => {
    const range = parseRangeNotation('AA');
    const notation = rangeToNotation(range);
    expect(notation).toBe('AA');
  });

  it('serializes pair+ range', () => {
    const range = parseRangeNotation('TT+');
    const notation = rangeToNotation(range);
    expect(notation).toContain('TT+');
  });

  it('round-trips complex notation', () => {
    const original = 'QQ+, AKs';
    const range = parseRangeNotation(original);
    const notation = rangeToNotation(range);
    const range2 = parseRangeNotation(notation);
    expect(countCombos(range)).toBe(countCombos(range2));
  });
});

describe('countCombos', () => {
  it('full range = 1326', () => {
    expect(countCombos(createFullRange())).toBe(1326);
  });

  it('empty range = 0', () => {
    expect(countCombos(createEmptyRange())).toBe(0);
  });
});

describe('rangePercentage', () => {
  it('full range = 100%', () => {
    expect(rangePercentage(createFullRange())).toBeCloseTo(100, 0);
  });
});

describe('selectTopPercent', () => {
  it('0% = empty', () => {
    const range = selectTopPercent(0);
    expect(countCombos(range)).toBe(0);
  });

  it('100% = full', () => {
    const range = selectTopPercent(100);
    expect(countCombos(range)).toBe(1326);
  });

  it('~5% selects premium hands', () => {
    const range = selectTopPercent(5);
    const combos = countCombos(range);
    expect(combos).toBeGreaterThan(50);
    expect(combos).toBeLessThan(80);
    // AA should be selected
    expect(range[0][0]).toBe(1);
  });
});

describe('handToGridPosition', () => {
  it('AA → [0,0]', () => {
    expect(handToGridPosition('AA')).toEqual({ row: 0, col: 0 });
  });

  it('AKs → [0,1] (above diagonal)', () => {
    expect(handToGridPosition('AKs')).toEqual({ row: 0, col: 1 });
  });

  it('AKo → [1,0] (below diagonal)', () => {
    expect(handToGridPosition('AKo')).toEqual({ row: 1, col: 0 });
  });

  it('22 → [12,12]', () => {
    expect(handToGridPosition('22')).toEqual({ row: 12, col: 12 });
  });
});

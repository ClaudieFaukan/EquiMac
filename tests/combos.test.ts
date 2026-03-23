import { describe, it, expect } from 'vitest';
import { generateCombosFromRange, generateCombosForHand, parseSpecificHand } from '../src/renderer/engine/combos';
import { parseRangeNotation, createFullRange } from '../src/renderer/engine/ranges';
import { parseCard } from '../src/renderer/engine/evaluator';

describe('generateCombosForHand', () => {
  it('pair generates 6 combos', () => {
    const combos = generateCombosForHand(0, 0, 1, new Set()); // AA
    expect(combos).toHaveLength(6);
  });

  it('suited generates 4 combos', () => {
    const combos = generateCombosForHand(0, 1, 1, new Set()); // AKs
    expect(combos).toHaveLength(4);
  });

  it('offsuit generates 12 combos', () => {
    const combos = generateCombosForHand(1, 0, 1, new Set()); // AKo
    expect(combos).toHaveLength(12);
  });

  it('weight 0 generates no combos', () => {
    const combos = generateCombosForHand(0, 0, 0, new Set());
    expect(combos).toHaveLength(0);
  });

  it('dead cards remove combos', () => {
    const dead = new Set([parseCard('As')]); // Remove Ace of spades
    const combos = generateCombosForHand(0, 0, 1, dead); // AA
    // AA normally has 6 combos, removing As removes 3 (AsAh, AsAd, AsAc)
    expect(combos).toHaveLength(3);
  });

  it('dead card removes suited combos', () => {
    const dead = new Set([parseCard('As')]); // Remove Ace of spades
    const combos = generateCombosForHand(0, 1, 1, dead); // AKs
    // AKs: AsKs removed, but AhKh, AdKd, AcKc remain
    expect(combos).toHaveLength(3);
  });
});

describe('generateCombosFromRange', () => {
  it('full range generates 1326 combos', () => {
    const combos = generateCombosFromRange(createFullRange());
    expect(combos).toHaveLength(1326);
  });

  it('AA range generates 6 combos', () => {
    const range = parseRangeNotation('AA');
    const combos = generateCombosFromRange(range);
    expect(combos).toHaveLength(6);
  });

  it('respects dead cards', () => {
    const range = parseRangeNotation('AA');
    const dead = new Set([parseCard('As'), parseCard('Ah')]);
    const combos = generateCombosFromRange(range, dead);
    // Without As and Ah: only combos with Ad and Ac remain = 1 combo (AdAc)
    expect(combos).toHaveLength(1);
  });
});

describe('parseSpecificHand', () => {
  it('parses AsKh', () => {
    const result = parseSpecificHand('AsKh');
    expect(result).not.toBeNull();
    expect(result![0]).toBe(parseCard('As'));
    expect(result![1]).toBe(parseCard('Kh'));
  });

  it('returns null for invalid input', () => {
    expect(parseSpecificHand('XY')).toBeNull();
    expect(parseSpecificHand('A')).toBeNull();
  });
});

import { describe, it, expect } from 'vitest';
import {
  evaluate5, evaluate7, parseCard, makeCard, cardRank, cardSuit,
  cardToString, handCategoryName, HandCategory,
} from '../src/renderer/engine/evaluator';

function cards(strs: string[]) {
  return strs.map(parseCard);
}

describe('Card utilities', () => {
  it('parseCard and cardToString round-trip', () => {
    expect(cardToString(parseCard('As'))).toBe('As');
    expect(cardToString(parseCard('Th'))).toBe('Th');
    expect(cardToString(parseCard('2c'))).toBe('2c');
  });

  it('cardRank returns correct rank', () => {
    expect(cardRank(parseCard('As'))).toBe(14);
    expect(cardRank(parseCard('Kh'))).toBe(13);
    expect(cardRank(parseCard('2c'))).toBe(2);
    expect(cardRank(parseCard('Td'))).toBe(10);
  });

  it('cardSuit returns correct suit', () => {
    expect(cardSuit(parseCard('As'))).toBe(0);
    expect(cardSuit(parseCard('Ah'))).toBe(1);
    expect(cardSuit(parseCard('Ad'))).toBe(2);
    expect(cardSuit(parseCard('Ac'))).toBe(3);
  });
});

describe('5-card hand evaluation', () => {
  it('Royal flush', () => {
    const rank = evaluate5(cards(['As', 'Ks', 'Qs', 'Js', 'Ts']));
    expect(Math.floor(rank / 100000000)).toBe(HandCategory.STRAIGHT_FLUSH);
  });

  it('Straight flush (9-high)', () => {
    const rank = evaluate5(cards(['9h', '8h', '7h', '6h', '5h']));
    expect(Math.floor(rank / 100000000)).toBe(HandCategory.STRAIGHT_FLUSH);
  });

  it('Wheel straight flush (A-5)', () => {
    const rank = evaluate5(cards(['5d', '4d', '3d', '2d', 'Ad']));
    const cat = Math.floor(rank / 100000000);
    expect(cat).toBe(HandCategory.STRAIGHT_FLUSH);
  });

  it('Royal flush beats other straight flush', () => {
    const royal = evaluate5(cards(['As', 'Ks', 'Qs', 'Js', 'Ts']));
    const sf9 = evaluate5(cards(['9h', '8h', '7h', '6h', '5h']));
    expect(royal).toBeLessThan(sf9);
  });

  it('Four of a kind', () => {
    const rank = evaluate5(cards(['As', 'Ah', 'Ad', 'Ac', 'Ks']));
    expect(Math.floor(rank / 100000000)).toBe(HandCategory.FOUR_OF_A_KIND);
  });

  it('Full house', () => {
    const rank = evaluate5(cards(['As', 'Ah', 'Ad', 'Ks', 'Kh']));
    expect(Math.floor(rank / 100000000)).toBe(HandCategory.FULL_HOUSE);
  });

  it('Flush', () => {
    const rank = evaluate5(cards(['As', 'Qs', '9s', '6s', '3s']));
    expect(Math.floor(rank / 100000000)).toBe(HandCategory.FLUSH);
  });

  it('Straight', () => {
    const rank = evaluate5(cards(['Ts', '9h', '8d', '7c', '6s']));
    expect(Math.floor(rank / 100000000)).toBe(HandCategory.STRAIGHT);
  });

  it('Wheel straight (A-5)', () => {
    const rank = evaluate5(cards(['5s', '4h', '3d', '2c', 'As']));
    expect(Math.floor(rank / 100000000)).toBe(HandCategory.STRAIGHT);
  });

  it('Three of a kind', () => {
    const rank = evaluate5(cards(['As', 'Ah', 'Ad', 'Ks', 'Qh']));
    expect(Math.floor(rank / 100000000)).toBe(HandCategory.THREE_OF_A_KIND);
  });

  it('Two pair', () => {
    const rank = evaluate5(cards(['As', 'Ah', 'Ks', 'Kh', 'Qs']));
    expect(Math.floor(rank / 100000000)).toBe(HandCategory.TWO_PAIR);
  });

  it('One pair', () => {
    const rank = evaluate5(cards(['As', 'Ah', 'Ks', 'Qh', 'Jd']));
    expect(Math.floor(rank / 100000000)).toBe(HandCategory.ONE_PAIR);
  });

  it('High card', () => {
    const rank = evaluate5(cards(['As', 'Kh', 'Qd', 'Jc', '9s']));
    expect(Math.floor(rank / 100000000)).toBe(HandCategory.HIGH_CARD);
  });

  // Category ordering: better hands have lower rank numbers
  it('Categories are correctly ordered', () => {
    const straightFlush = evaluate5(cards(['9h', '8h', '7h', '6h', '5h']));
    const quads = evaluate5(cards(['As', 'Ah', 'Ad', 'Ac', 'Ks']));
    const fullHouse = evaluate5(cards(['As', 'Ah', 'Ad', 'Ks', 'Kh']));
    const flush = evaluate5(cards(['As', 'Qs', '9s', '6s', '3s']));
    const straight = evaluate5(cards(['Ts', '9h', '8d', '7c', '6s']));
    const trips = evaluate5(cards(['As', 'Ah', 'Ad', 'Ks', 'Qh']));
    const twoPair = evaluate5(cards(['As', 'Ah', 'Ks', 'Kh', 'Qs']));
    const onePair = evaluate5(cards(['As', 'Ah', 'Ks', 'Qh', 'Jd']));
    const highCard = evaluate5(cards(['As', 'Kh', 'Qd', 'Jc', '9s']));

    expect(straightFlush).toBeLessThan(quads);
    expect(quads).toBeLessThan(fullHouse);
    expect(fullHouse).toBeLessThan(flush);
    expect(flush).toBeLessThan(straight);
    expect(straight).toBeLessThan(trips);
    expect(trips).toBeLessThan(twoPair);
    expect(twoPair).toBeLessThan(onePair);
    expect(onePair).toBeLessThan(highCard);
  });

  // Same category comparisons
  it('Higher pair beats lower pair', () => {
    const aa = evaluate5(cards(['As', 'Ah', 'Kd', 'Qc', 'Js']));
    const kk = evaluate5(cards(['Ks', 'Kh', 'Ad', 'Qc', 'Js']));
    expect(aa).toBeLessThan(kk);
  });

  it('Higher two pair beats lower two pair', () => {
    const aaKK = evaluate5(cards(['As', 'Ah', 'Ks', 'Kh', '2d']));
    const aaQQ = evaluate5(cards(['As', 'Ah', 'Qs', 'Qh', 'Kd']));
    expect(aaKK).toBeLessThan(aaQQ);
  });

  it('Higher kicker breaks ties', () => {
    const pairAK = evaluate5(cards(['As', 'Ah', 'Ks', 'Qh', '2d']));
    const pairAQ = evaluate5(cards(['As', 'Ah', 'Qs', 'Jh', '2d']));
    expect(pairAK).toBeLessThan(pairAQ);
  });
});

describe('7-card hand evaluation', () => {
  it('Finds best 5-card hand from 7 cards', () => {
    // Board: Ks Qs Js Ts 2h  Hand: As 3c → Royal flush
    const rank = evaluate7(cards(['As', '3c', 'Ks', 'Qs', 'Js', 'Ts', '2h']));
    expect(Math.floor(rank / 100000000)).toBe(HandCategory.STRAIGHT_FLUSH);
  });

  it('Full house from 7 cards', () => {
    // Hand: As Ah  Board: Ad Ks Kh 7c 2d → Full house AAA KK
    const rank = evaluate7(cards(['As', 'Ah', 'Ad', 'Ks', 'Kh', '7c', '2d']));
    expect(Math.floor(rank / 100000000)).toBe(HandCategory.FULL_HOUSE);
  });

  it('Picks the best hand when multiple categories possible', () => {
    // Hand: 9s 8s  Board: 7s 6s 5s Ac Kd → Straight flush beats high card A
    const rank = evaluate7(cards(['9s', '8s', '7s', '6s', '5s', 'Ac', 'Kd']));
    expect(Math.floor(rank / 100000000)).toBe(HandCategory.STRAIGHT_FLUSH);
  });
});

describe('handCategoryName', () => {
  it('Returns correct names', () => {
    expect(handCategoryName(HandCategory.STRAIGHT_FLUSH * 100000000)).toBe('Straight Flush');
    expect(handCategoryName(HandCategory.FOUR_OF_A_KIND * 100000000 + 50)).toBe('Four of a Kind');
    expect(handCategoryName(HandCategory.HIGH_CARD * 100000000)).toBe('High Card');
  });
});

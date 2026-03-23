import { useState } from 'react';
import { type Card, cardSuit } from '../../engine/evaluator';
import { SUIT_SYMBOLS, type Suit } from '../../engine/constants';
import { useSuitColors } from '../../hooks/useSuitColors';
import { CardPicker } from '../BoardSelector/CardPicker';

interface DeadCardsProps {
  deadCards: Card[];
  onDeadCardsChange: (cards: Card[]) => void;
  usedCards: Set<number>;
}

const SUITS_MAP: Suit[] = ['s', 'h', 'd', 'c'];

export function DeadCards({ deadCards, onDeadCardsChange, usedCards }: DeadCardsProps) {
  const suitColors = useSuitColors();
  const [showPicker, setShowPicker] = useState(false);
  const [pickerPos, setPickerPos] = useState<{ x: number; y: number } | undefined>();

  const handleAdd = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setPickerPos({ x: rect.left, y: rect.bottom + 4 });
    setShowPicker(true);
  };

  const handleSelect = (card: Card) => {
    onDeadCardsChange([...deadCards, card]);
    setShowPicker(false);
  };

  const handleRemove = (index: number) => {
    onDeadCardsChange(deadCards.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Dead Cards</span>
        {deadCards.length > 0 && (
          <button
            onClick={() => onDeadCardsChange([])}
            className="text-[10px] text-zinc-600 hover:text-zinc-300 transition-colors"
            title="Vider les dead cards"
          >
            ✕ clear
          </button>
        )}
      </div>
      <div className="flex gap-1 flex-wrap items-center">
        {deadCards.map((card, i) => {
          const ranks = '23456789TJQKA';
          const rankChar = ranks[card >> 2];
          const suit = SUITS_MAP[card & 3];
          return (
            <button
              key={i}
              onClick={() => handleRemove(i)}
              className="w-7 h-8 rounded bg-zinc-700 border border-zinc-600 text-[11px] font-mono-poker font-bold flex items-center justify-center hover:bg-red-900/50 transition-colors"
              style={{ color: suitColors[suit] }}
              title="Cliquer pour retirer"
            >
              {rankChar}{SUIT_SYMBOLS[suit]}
            </button>
          );
        })}
        <button
          onClick={handleAdd}
          className="w-7 h-8 rounded bg-zinc-700 border border-zinc-600 border-dashed text-zinc-500 text-xs flex items-center justify-center hover:bg-zinc-600 transition-colors"
        >
          +
        </button>
      </div>

      {showPicker && (
        <CardPicker
          onSelect={handleSelect}
          onClose={() => setShowPicker(false)}
          usedCards={usedCards}
          position={pickerPos}
        />
      )}
    </div>
  );
}

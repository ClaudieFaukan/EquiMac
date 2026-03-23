import { useState } from 'react';
import { type Card, cardToString, cardRank, cardSuit } from '../../engine/evaluator';
import { SUIT_SYMBOLS, SUIT_COLORS, type Suit } from '../../engine/constants';
import { CardPicker } from './CardPicker';

interface BoardSelectorProps {
  board: Card[];
  onBoardChange: (board: Card[]) => void;
  usedCards: Set<number>;
}

const SUITS_MAP: Suit[] = ['s', 'h', 'd', 'c'];

function CardDisplay({ card, onClick, placeholder }: { card?: Card; onClick: (e: React.MouseEvent) => void; placeholder: string }) {
  if (card === undefined) {
    return (
      <button
        onClick={onClick}
        className="w-10 h-12 rounded bg-zinc-700 border border-zinc-600 border-dashed text-zinc-500 text-[10px] font-mono-poker flex items-center justify-center hover:bg-zinc-600 transition-colors"
      >
        {placeholder}
      </button>
    );
  }

  const ranks = '23456789TJQKA';
  const rankChar = ranks[card >> 2];
  const suit = SUITS_MAP[card & 3];

  return (
    <button
      onClick={onClick}
      className="w-10 h-12 rounded bg-zinc-700 border border-zinc-500 text-sm font-mono-poker font-bold flex items-center justify-center hover:bg-zinc-600 transition-colors"
      style={{ color: SUIT_COLORS[suit] }}
    >
      {rankChar}{SUIT_SYMBOLS[suit]}
    </button>
  );
}

export function BoardSelector({ board, onBoardChange, usedCards }: BoardSelectorProps) {
  const [pickerSlot, setPickerSlot] = useState<number | null>(null);
  const [pickerPos, setPickerPos] = useState<{ x: number; y: number } | undefined>();

  const handleSlotClick = (index: number, e: React.MouseEvent) => {
    // If card exists, remove it on click
    if (index < board.length) {
      const newBoard = [...board];
      newBoard.splice(index, 1);
      onBoardChange(newBoard);
      return;
    }
    // Only allow adding cards in sequence
    if (index > board.length) return;
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setPickerPos({ x: rect.left, y: rect.bottom + 4 });
    setPickerSlot(index);
  };

  const handleSelect = (card: Card) => {
    if (pickerSlot === null) return;
    const newBoard = [...board];
    newBoard[pickerSlot] = card;
    onBoardChange(newBoard);
    setPickerSlot(null);
  };

  return (
    <div>
      <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Board</div>
      <div className="flex gap-1">
        {/* Flop */}
        <div className="flex gap-0.5">
          {[0, 1, 2].map(i => (
            <CardDisplay
              key={i}
              card={board[i]}
              onClick={(e) => handleSlotClick(i, e)}
              placeholder="F"
            />
          ))}
        </div>
        <div className="w-px bg-zinc-700 mx-0.5" />
        {/* Turn */}
        <CardDisplay
          card={board[3]}
          onClick={(e) => handleSlotClick(3, e)}
          placeholder="T"
        />
        <div className="w-px bg-zinc-700 mx-0.5" />
        {/* River */}
        <CardDisplay
          card={board[4]}
          onClick={(e) => handleSlotClick(4, e)}
          placeholder="R"
        />
      </div>

      {pickerSlot !== null && (
        <CardPicker
          onSelect={handleSelect}
          onClose={() => setPickerSlot(null)}
          usedCards={usedCards}
          position={pickerPos}
        />
      )}
    </div>
  );
}

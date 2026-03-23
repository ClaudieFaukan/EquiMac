import { useState, useCallback } from 'react';
import { type Card, cardToString, parseCard } from '../../engine/evaluator';
import { SUIT_SYMBOLS, type Suit } from '../../engine/constants';
import { useSuitColors } from '../../hooks/useSuitColors';
import { CardPicker } from './CardPicker';
import { useT } from '../../hooks/useT';

interface BoardSelectorProps {
  board: Card[];
  onBoardChange: (board: Card[]) => void;
  usedCards: Set<number>;
}

const SUITS_MAP: Suit[] = ['s', 'h', 'd', 'c'];

function CardDisplay({ card, onClick, placeholder, suitColors }: { card?: Card; onClick: (e: React.MouseEvent) => void; placeholder: string; suitColors: Record<Suit, string> }) {
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
      style={{ color: suitColors[suit] }}
    >
      {rankChar}{SUIT_SYMBOLS[suit]}
    </button>
  );
}

/** Convert board cards to text like "Ah,Kd,2s" */
function boardToText(board: Card[]): string {
  return board.map(cardToString).join(',');
}

/** Parse text like "Ah,Kd,2s" to card array. Returns null on invalid input. */
function textToBoard(text: string): Card[] | null {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const parts = trimmed.split(/[,\s]+/).filter(Boolean);
  if (parts.length > 5) return null;
  try {
    return parts.map(parseCard);
  } catch {
    return null;
  }
}

export function BoardSelector({ board, onBoardChange, usedCards }: BoardSelectorProps) {
  const t = useT();
  const suitColors = useSuitColors();
  const [pickerSlot, setPickerSlot] = useState<number | null>(null);
  const [pickerPos, setPickerPos] = useState<{ x: number; y: number } | undefined>();
  const [textInput, setTextInput] = useState('');
  const [textFocused, setTextFocused] = useState(false);

  // Text displayed: when not focused, always show the board state
  const displayText = textFocused ? textInput : boardToText(board);

  const handleSlotClick = (index: number, e: React.MouseEvent) => {
    if (index < board.length) {
      const newBoard = [...board];
      newBoard.splice(index, 1);
      onBoardChange(newBoard);
      return;
    }
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

  const handleTextFocus = () => {
    setTextFocused(true);
    setTextInput(boardToText(board));
  };

  const handleTextBlur = () => {
    setTextFocused(false);
    // Apply on blur
    const parsed = textToBoard(textInput);
    if (parsed !== null) {
      onBoardChange(parsed);
    }
  };

  const handleTextChange = (value: string) => {
    setTextInput(value);
    // Live sync: apply valid input immediately
    const parsed = textToBoard(value);
    if (parsed !== null) {
      onBoardChange(parsed);
    }
  };

  const handleTextKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLElement).blur();
    }
  };

  const isTextInvalid = textFocused && textInput.trim() !== '' && textToBoard(textInput) === null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Board</span>
        {board.length > 0 && (
          <button
            onClick={() => onBoardChange([])}
            className="text-[10px] text-zinc-600 hover:text-zinc-300 transition-colors"
            title={t('clear_board')}
          >
            ✕ clear
          </button>
        )}
      </div>

      {/* Visual cards */}
      <div className="flex gap-1">
        <div className="flex gap-0.5">
          {[0, 1, 2].map(i => (
            <CardDisplay
              key={i}
              card={board[i]}
              onClick={(e) => handleSlotClick(i, e)}
              placeholder="F"
              suitColors={suitColors}
            />
          ))}
        </div>
        <div className="w-px bg-zinc-700 mx-0.5" />
        <CardDisplay
          card={board[3]}
          onClick={(e) => handleSlotClick(3, e)}
          placeholder="T"
          suitColors={suitColors}
        />
        <div className="w-px bg-zinc-700 mx-0.5" />
        <CardDisplay
          card={board[4]}
          onClick={(e) => handleSlotClick(4, e)}
          placeholder="R"
          suitColors={suitColors}
        />
      </div>

      {/* Text input */}
      <input
        type="text"
        value={displayText}
        onChange={(e) => handleTextChange(e.target.value)}
        onFocus={handleTextFocus}
        onBlur={handleTextBlur}
        onKeyDown={handleTextKeyDown}
        placeholder="Ah,Kd,2s..."
        className={`mt-1.5 w-full bg-zinc-900 border rounded px-2 py-1 text-xs font-mono-poker text-zinc-200 placeholder-zinc-600 focus:outline-none transition-colors ${
          isTextInvalid ? 'border-red-600' : 'border-zinc-700 focus:border-zinc-500'
        }`}
      />

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

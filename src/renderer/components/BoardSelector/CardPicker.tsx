import { SUIT_SYMBOLS, SUIT_COLORS, type Suit } from '../../engine/constants';
import { type Card, makeCard, cardToString, cardRank, cardSuit } from '../../engine/evaluator';

const RANK_LABELS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
const RANK_VALUES = [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
const SUIT_ORDER: Suit[] = ['s', 'h', 'd', 'c'];

interface CardPickerProps {
  onSelect: (card: Card) => void;
  onClose: () => void;
  usedCards: Set<number>;
  position?: { x: number; y: number };
}

export function CardPicker({ onSelect, onClose, usedCards, position }: CardPickerProps) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 bg-zinc-800 border border-zinc-600 rounded-lg shadow-xl p-2"
        style={position ? { left: position.x, top: position.y } : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      >
        <div className="grid grid-cols-13 gap-0.5">
          {SUIT_ORDER.map((suit, si) => (
            RANK_LABELS.map((rankLabel, ri) => {
              const rank = RANK_VALUES[ri];
              const card = makeCard(rank, si);
              const used = usedCards.has(card);
              return (
                <button
                  key={`${rankLabel}${suit}`}
                  disabled={used}
                  onClick={() => { onSelect(card); onClose(); }}
                  className={`w-7 h-8 text-[11px] font-mono-poker font-bold rounded flex items-center justify-center transition-colors
                    ${used
                      ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed'
                      : 'bg-zinc-700 hover:bg-zinc-500 cursor-pointer'
                    }`}
                  style={!used ? { color: SUIT_COLORS[suit] } : undefined}
                >
                  {rankLabel}{SUIT_SYMBOLS[suit]}
                </button>
              );
            })
          ))}
        </div>
      </div>
    </>
  );
}

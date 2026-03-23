import React from 'react';
import { RANKS, SUITS, SUIT_SYMBOLS, SUIT_COLORS, getHandType } from '../../engine/constants';

interface SuitSubGridProps {
  row: number;
  col: number;
  position: { x: number; y: number };
  onClose: () => void;
}

interface ComboInfo {
  suit1: string;
  suit2: string;
  label: string;
}

function getCombos(row: number, col: number): ComboInfo[] {
  const type = getHandType(row, col);
  const r1 = RANKS[row];
  const r2 = RANKS[col];
  const combos: ComboInfo[] = [];

  if (type === 'pair') {
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        combos.push({
          suit1: SUITS[i],
          suit2: SUITS[j],
          label: `${r1}${SUIT_SYMBOLS[SUITS[i]]}${r2}${SUIT_SYMBOLS[SUITS[j]]}`,
        });
      }
    }
  } else if (type === 'suited') {
    for (const s of SUITS) {
      combos.push({
        suit1: s,
        suit2: s,
        label: `${r1}${SUIT_SYMBOLS[s]}${r2}${SUIT_SYMBOLS[s]}`,
      });
    }
  } else {
    // offsuit
    const highRank = RANKS[Math.min(row, col)];
    const lowRank = RANKS[Math.max(row, col)];
    for (const s1 of SUITS) {
      for (const s2 of SUITS) {
        if (s1 !== s2) {
          combos.push({
            suit1: s1,
            suit2: s2,
            label: `${highRank}${SUIT_SYMBOLS[s1]}${lowRank}${SUIT_SYMBOLS[s2]}`,
          });
        }
      }
    }
  }

  return combos;
}

export function SuitSubGrid({ row, col, position, onClose }: SuitSubGridProps) {
  const combos = getCombos(row, col);
  const type = getHandType(row, col);
  const r1 = RANKS[row];
  const r2 = RANKS[col];
  const label =
    type === 'pair' ? `${r1}${r2}` : type === 'suited' ? `${r1}${r2}s` : `${r2}${r1}o`;

  const cols = type === 'offsuit' ? 4 : type === 'pair' ? 3 : 2;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 bg-zinc-800 border border-zinc-600 rounded-lg shadow-xl p-3"
        style={{ left: position.x, top: position.y }}
      >
        <div className="text-xs font-semibold text-zinc-300 mb-2 text-center font-mono-poker">
          {label} — {combos.length} combos
        </div>
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {combos.map((combo) => (
            <div
              key={combo.label}
              className="px-2 py-1 text-xs font-mono-poker rounded bg-zinc-700 hover:bg-zinc-600 cursor-pointer text-center whitespace-nowrap"
            >
              <span style={{ color: SUIT_COLORS[combo.suit1 as keyof typeof SUIT_COLORS] }}>
                {combo.label.slice(0, 2)}
              </span>
              <span style={{ color: SUIT_COLORS[combo.suit2 as keyof typeof SUIT_COLORS] }}>
                {combo.label.slice(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

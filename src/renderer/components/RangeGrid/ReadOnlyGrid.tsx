import React from 'react';
import { RANKS, getHandLabel, getHandType, type HandType } from '../../engine/constants';
import type { RangeMatrix } from '../../engine/ranges';

interface ReadOnlyGridProps {
  range: RangeMatrix;
  /** Optional equity overlay (13x13, NaN = no data) */
  equities?: number[][];
}

const TYPE_BG: Record<HandType, string> = {
  pair: 'bg-amber-900/40',
  suited: 'bg-rose-900/30',
  offsuit: 'bg-sky-900/20',
};

const TYPE_SELECTED: Record<HandType, string> = {
  pair: 'rgb(217, 119, 6)',
  suited: 'rgb(220, 38, 38)',
  offsuit: 'rgb(37, 99, 235)',
};

export function ReadOnlyGrid({ range, equities }: ReadOnlyGridProps) {
  return (
    <div className="select-none">
      {/* Column headers */}
      <div className="grid grid-cols-[20px_repeat(13,1fr)] gap-0">
        <div />
        {RANKS.map((rank) => (
          <div
            key={rank}
            className="text-center text-[10px] text-zinc-500 font-mono-poker font-bold pb-0.5"
          >
            {rank}
          </div>
        ))}
      </div>

      {/* Grid rows */}
      <div className="grid grid-cols-[20px_repeat(13,1fr)] gap-0">
        {Array.from({ length: 13 }, (_, row) => (
          <React.Fragment key={row}>
            {/* Row header */}
            <div className="flex items-center justify-center text-[10px] text-zinc-500 font-mono-poker font-bold pr-0.5">
              {RANKS[row]}
            </div>
            {/* Cells */}
            {Array.from({ length: 13 }, (_, col) => {
              const weight = range[row][col];
              const label = getHandLabel(row, col);
              const type = getHandType(row, col);
              const isSelected = weight > 0;
              const eq = equities?.[row]?.[col];
              const hasEq = eq !== undefined && !isNaN(eq);

              const selectedColor = TYPE_SELECTED[type];
              const bgStyle = isSelected
                ? { backgroundColor: selectedColor, opacity: 0.3 + weight * 0.7 }
                : undefined;

              return (
                <div
                  key={`${row}-${col}`}
                  className={`
                    relative flex items-center justify-center
                    text-[10px] font-mono-poker font-semibold select-none
                    border border-zinc-700/50
                    ${!isSelected ? TYPE_BG[type] : ''}
                  `}
                  style={bgStyle}
                  title={hasEq && isSelected ? `${label}: ${(eq * 100).toFixed(1)}%` : label}
                >
                  <span className={isSelected ? 'text-white drop-shadow-sm' : 'text-zinc-400'}>
                    {label}
                  </span>
                  {isSelected && hasEq && (
                    <span className="absolute bottom-0 right-0.5 text-[7px] text-white/70">
                      {Math.round(eq * 100)}
                    </span>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

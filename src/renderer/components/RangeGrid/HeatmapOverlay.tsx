import React from 'react';
import { RANKS, getHandLabel } from '../../engine/constants';

interface HeatmapOverlayProps {
  equities: number[][]; // 13x13, NaN for hands not in range
}

function equityToColor(eq: number): string {
  if (isNaN(eq)) return 'transparent';
  // Red (high equity) -> Yellow (neutral) -> Blue (low equity)
  if (eq >= 0.7) return `rgba(16, 185, 129, ${0.4 + eq * 0.6})`; // emerald
  if (eq >= 0.55) return `rgba(245, 158, 11, ${0.3 + eq * 0.5})`; // amber
  if (eq >= 0.45) return `rgba(234, 179, 8, ${0.3 + eq * 0.4})`; // yellow
  if (eq >= 0.35) return `rgba(59, 130, 246, ${0.3 + (1 - eq) * 0.4})`; // blue
  return `rgba(239, 68, 68, ${0.3 + (1 - eq) * 0.5})`; // red (bad for hero)
}

export function HeatmapOverlay({ equities }: HeatmapOverlayProps) {
  return (
    <div>
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

      {/* Grid */}
      <div className="grid grid-cols-[20px_repeat(13,1fr)] gap-0">
        {Array.from({ length: 13 }, (_, row) => (
          <React.Fragment key={row}>
            <div className="flex items-center justify-center text-[10px] text-zinc-500 font-mono-poker font-bold pr-0.5">
              {RANKS[row]}
            </div>
            {Array.from({ length: 13 }, (_, col) => {
              const eq = equities[row][col];
              const label = getHandLabel(row, col);
              const hasValue = !isNaN(eq);
              return (
                <div
                  key={`${row}-${col}`}
                  className="relative flex items-center justify-center text-[10px] font-mono-poker font-semibold select-none border border-zinc-700/50"
                  style={{
                    backgroundColor: equityToColor(eq),
                  }}
                  title={hasValue ? `${label}: ${(eq * 100).toFixed(1)}%` : label}
                >
                  <span className={hasValue ? 'text-white drop-shadow-sm' : 'text-zinc-600'}>
                    {label}
                  </span>
                  {hasValue && (
                    <span className="absolute bottom-0 right-0.5 text-[7px] text-white/80">
                      {Math.round(eq * 100)}
                    </span>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-2 text-[9px] text-zinc-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.7)' }} />
          &lt;35%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 rounded" style={{ backgroundColor: 'rgba(59, 130, 246, 0.5)' }} />
          35-45%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 rounded" style={{ backgroundColor: 'rgba(234, 179, 8, 0.5)' }} />
          45-55%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 rounded" style={{ backgroundColor: 'rgba(245, 158, 11, 0.6)' }} />
          55-70%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 rounded" style={{ backgroundColor: 'rgba(16, 185, 129, 0.8)' }} />
          &gt;70%
        </span>
      </div>
    </div>
  );
}

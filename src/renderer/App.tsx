import { useCallback, useEffect, useState } from 'react';
import { RangeGrid } from './components/RangeGrid/RangeGrid';
import { RangeStats } from './components/RangeGrid/RangeStats';
import { PercentageSlider } from './components/PercentageSlider/PercentageSlider';
import { EquityCalculator } from './components/EquityCalculator/EquityCalculator';
import { BrushWeight } from './components/RangeGrid/BrushWeight';
import { useRangeStore } from './store/rangeStore';
import { type RangeMatrix } from './engine/ranges';

export default function App() {
  const [activePlayer, setActivePlayer] = useState<number>(0);
  const [externalRange, setExternalRange] = useState<{ playerIndex: number; range: RangeMatrix } | null>(null);

  const range = useRangeStore((s) => s.range);
  const setRange = useRangeStore((s) => s.setRange);

  // When a player clicks "Grille", load their range into the grid
  const handleOpenGrid = useCallback((playerIndex: number, playerRange: RangeMatrix) => {
    setActivePlayer(playerIndex);
    setRange(playerRange);
  }, [setRange]);

  // Send the grid's range back to the calculator when it changes
  useEffect(() => {
    setExternalRange({ playerIndex: activePlayer, range });
  }, [range, activePlayer]);

  return (
    <div className="h-screen flex flex-col bg-zinc-900 text-zinc-100">
      {/* Title bar drag region */}
      <div
        className="h-8 flex items-center justify-center text-xs text-zinc-500 shrink-0"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        EquiMac
      </div>

      {/* Main content */}
      <div className="flex-1 flex gap-4 p-4 pt-0 min-h-0">
        {/* Left panel: Range grid + slider */}
        <div className="flex flex-col gap-3 min-w-0">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
            Range — Joueur {activePlayer + 1}
          </div>
          <RangeGrid />
          <PercentageSlider />
          <BrushWeight />
          <RangeStats />
        </div>

        {/* Right panel: Equity calculator */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <EquityCalculator
            onOpenGrid={handleOpenGrid}
            externalRange={externalRange}
          />
        </div>
      </div>
    </div>
  );
}

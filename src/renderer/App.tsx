import { useCallback, useEffect, useState } from 'react';
import { RangeGrid } from './components/RangeGrid/RangeGrid';
import { RangeStats } from './components/RangeGrid/RangeStats';
import { PercentageSlider } from './components/PercentageSlider/PercentageSlider';
import { EquityCalculator } from './components/EquityCalculator/EquityCalculator';
import { BrushWeight } from './components/RangeGrid/BrushWeight';
import { HeatmapOverlay } from './components/RangeGrid/HeatmapOverlay';
import { useRangeStore } from './store/rangeStore';
import { type RangeMatrix } from './engine/ranges';
import type { HeatmapResult } from './engine/heatmap';

export default function App() {
  const [activePlayer, setActivePlayer] = useState<number>(0);
  const [externalRange, setExternalRange] = useState<{ playerIndex: number; range: RangeMatrix } | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapResult | null>(null);

  const range = useRangeStore((s) => s.range);
  const setRange = useRangeStore((s) => s.setRange);

  const handleOpenGrid = useCallback((playerIndex: number, playerRange: RangeMatrix) => {
    setActivePlayer(playerIndex);
    setRange(playerRange);
    setHeatmap(null); // Clear heatmap when switching to grid editing
  }, [setRange]);

  useEffect(() => {
    setExternalRange({ playerIndex: activePlayer, range });
  }, [range, activePlayer]);

  const handleHeatmapResult = useCallback((result: HeatmapResult | null) => {
    setHeatmap(result);
  }, []);

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
        {/* Left panel: Range grid or Heatmap */}
        <div className="flex flex-col gap-3 min-w-0">
          {heatmap ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                  Heatmap — J1 vs J2
                </span>
                <button
                  onClick={() => setHeatmap(null)}
                  className="text-[10px] text-zinc-500 hover:text-zinc-300 underline"
                >
                  Retour grille
                </button>
              </div>
              <HeatmapOverlay equities={heatmap.equities} />
              <div className="text-[10px] text-zinc-600 text-center">
                Calculé en {(heatmap.timeMs / 1000).toFixed(1)}s
              </div>
            </>
          ) : (
            <>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
                Range — Joueur {activePlayer + 1}
              </div>
              <RangeGrid />
              <PercentageSlider />
              <BrushWeight />
              <RangeStats />
            </>
          )}
        </div>

        {/* Right panel: Equity calculator */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <EquityCalculator
            onOpenGrid={handleOpenGrid}
            externalRange={externalRange}
            onHeatmapResult={handleHeatmapResult}
          />
        </div>
      </div>
    </div>
  );
}

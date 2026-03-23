import { RangeGrid } from './components/RangeGrid/RangeGrid';
import { RangeStats } from './components/RangeGrid/RangeStats';
import { PercentageSlider } from './components/PercentageSlider/PercentageSlider';
import { useRangeStore } from './store/rangeStore';

export default function App() {
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
          <RangeGrid />
          <PercentageSlider />
          <RangeStats />
        </div>

        {/* Right panel: Equity calculator (placeholder for Phase 4+) */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="flex-1 rounded-lg bg-zinc-800 border border-zinc-700 p-4 flex items-center justify-center text-zinc-500">
            Calculateur d'equity — Phase 4+
          </div>
        </div>
      </div>
    </div>
  );
}

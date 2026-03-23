import { useState } from 'react';
import { useRangeStore } from '../../store/rangeStore';

const PRESETS = [0.25, 0.5, 0.75, 1];

export function BrushWeight() {
  const brushWeight = useRangeStore((s) => s.brushWeight);
  const setBrushWeight = useRangeStore((s) => s.setBrushWeight);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-3">
        <div className="relative shrink-0 flex items-center gap-1">
          <span className="text-xs text-zinc-400">Poids</span>
          <span
            className="text-[10px] text-zinc-600 cursor-help w-3.5 h-3.5 rounded-full border border-zinc-600 inline-flex items-center justify-center hover:text-zinc-400 hover:border-zinc-400 transition-colors"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            ?
          </span>
          {showTooltip && (
            <div className="absolute left-0 top-full mt-1.5 z-50 w-56 bg-zinc-700 border border-zinc-600 rounded-lg p-2.5 shadow-xl text-[11px] text-zinc-300 leading-relaxed">
              Fréquence d'inclusion d'une main dans le range. Ex: 50% = la main est jouée une fois sur deux. Sélectionnez un poids puis peignez sur la grille.
            </div>
          )}
        </div>

        {/* Presets */}
        <div className="flex gap-1">
          {PRESETS.map((w) => (
            <button
              key={w}
              onClick={() => setBrushWeight(w)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono-poker font-bold transition-colors ${
                brushWeight === w
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
              }`}
            >
              {Math.round(w * 100)}%
            </button>
          ))}
        </div>

        {/* Slider */}
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={Math.round(brushWeight * 100)}
          onChange={(e) => setBrushWeight(Number(e.target.value) / 100)}
          className="flex-1 h-1 accent-emerald-500"
        />

        <span className="text-xs font-mono-poker text-emerald-400 font-bold w-8 text-right">
          {Math.round(brushWeight * 100)}%
        </span>
      </div>
    </div>
  );
}

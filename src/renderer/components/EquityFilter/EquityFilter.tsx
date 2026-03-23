import { useState, useRef, useEffect, useCallback } from 'react';
import { parseRangeNotation, rangeToNotation, createEmptyRange, selectTopPercent, countCombos, rangePercentage, type RangeMatrix } from '../../engine/ranges';
import { MiniPresetSelector } from '../EquityCalculator/MiniPresetSelector';
import { ReadOnlyGrid } from '../RangeGrid/ReadOnlyGrid';
import type { HeatmapResult } from '../../engine/heatmap';
import { useRangeStore } from '../../store/rangeStore';

interface EquityFilterProps {
  onApplyResult: (range: RangeMatrix) => void;
}

export function EquityFilter({ onApplyResult }: EquityFilterProps) {
  const gridRange = useRangeStore(s => s.range);
  const gridNotation = useRangeStore(s => s.getNotation);
  const importNotation = useRangeStore(s => s.importNotation);

  const [villainNotation, setVillainNotation] = useState('');
  const [villainTopPct, setVillainTopPct] = useState('');
  const [targetEquity, setTargetEquity] = useState('50');
  const [mode, setMode] = useState<'gte' | 'lte'>('gte');
  const [isCalculating, setIsCalculating] = useState(false);
  const [heatmapData, setHeatmapData] = useState<number[][] | null>(null);
  const [resultRange, setResultRange] = useState<RangeMatrix | null>(null);
  const [resultNotation, setResultNotation] = useState('');
  const [resultStats, setResultStats] = useState<{ matchCount: number; totalChecked: number; timeMs: number } | null>(null);

  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new Worker(
      new URL('../../../workers/equity-worker.ts', import.meta.url),
      { type: 'module' }
    );
    workerRef.current = worker;
    return () => worker.terminate();
  }, []);

  // Sync villain notation from grid
  useEffect(() => {
    const notation = gridNotation();
    if (notation !== villainNotation) {
      setVillainNotation(notation);
      // Auto-set target equity to the range percentage
      const pct = rangePercentage(gridRange);
      if (pct > 0) setTargetEquity(Math.round(pct).toString());
    }
  }, [gridRange]);

  const handleVillainTopPct = () => {
    const val = parseFloat(villainTopPct);
    if (isNaN(val) || val <= 0 || val > 100) return;
    const range = selectTopPercent(val);
    const notation = rangeToNotation(range);
    setVillainNotation(notation);
    setTargetEquity(Math.round(val).toString());
    importNotation(notation); // sync grid
  };

  const handleVillainNotationChange = (notation: string) => {
    setVillainNotation(notation);
    importNotation(notation); // sync grid
  };

  // Refilter from existing heatmap when target/mode changes
  const applyFilter = useCallback((equities: number[][], target: number, isGte: boolean) => {
    const filtered = createEmptyRange();
    let matchCount = 0;
    let totalChecked = 0;

    for (let row = 0; row < 13; row++) {
      for (let col = 0; col < 13; col++) {
        const eq = equities[row][col];
        if (isNaN(eq)) continue;
        totalChecked++;
        if (isGte ? eq >= target : eq <= target) {
          filtered[row][col] = 1;
          matchCount++;
        }
      }
    }

    setResultRange(filtered);
    setResultNotation(rangeToNotation(filtered));
    return { matchCount, totalChecked };
  }, []);

  // Recalculate filter when target or mode changes (if we have heatmap data)
  useEffect(() => {
    if (!heatmapData) return;
    const target = parseFloat(targetEquity) / 100;
    const { matchCount, totalChecked } = applyFilter(heatmapData, target, mode === 'gte');
    setResultStats(prev => prev ? { ...prev, matchCount, totalChecked } : null);
  }, [targetEquity, mode, heatmapData, applyFilter]);

  const handleCalculate = useCallback(() => {
    if (!workerRef.current || !villainNotation.trim()) return;
    setIsCalculating(true);

    const villainRange = parseRangeNotation(villainNotation);
    const fullRange = Array.from({ length: 13 }, () => Array(13).fill(1));

    const worker = workerRef.current;
    const handler = (e: MessageEvent) => {
      if (e.data.type === 'heatmap-result') {
        const heatmapResult: HeatmapResult = e.data.result;
        const equities = heatmapResult.equities;
        setHeatmapData(equities);

        const target = parseFloat(targetEquity) / 100;
        const { matchCount, totalChecked } = applyFilter(equities, target, mode === 'gte');

        setResultStats({ matchCount, totalChecked, timeMs: heatmapResult.timeMs });
        setIsCalculating(false);
      }
      worker.removeEventListener('message', handler);
    };

    worker.addEventListener('message', handler);
    worker.postMessage({
      type: 'heatmap',
      heroRange: fullRange,
      villainRange,
      board: [],
      deadCards: [],
      iterationsPerHand: 1500,
    });
  }, [villainNotation, targetEquity, mode, applyFilter]);

  const handleApply = () => {
    if (resultRange) onApplyResult(resultRange);
  };

  const villainRange = parseRangeNotation(villainNotation);
  const villainPct = rangePercentage(villainRange);
  const villainCombos = countCombos(villainRange);
  const resultCombos = resultRange ? countCombos(resultRange) : 0;
  const resultPct = resultRange ? rangePercentage(resultRange) : 0;

  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
        Filtre d'equity
      </span>
      <p className="text-[10px] text-zinc-600 leading-relaxed">
        Définissez le range adverse (synchro avec la grille), puis trouvez toutes les mains avec une equity cible contre ce range.
      </p>

      {/* Villain range input */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Range adverse</span>
          <span className="text-[10px] text-zinc-600">{villainCombos} combos · {villainPct.toFixed(1)}%</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={villainNotation}
            onChange={(e) => handleVillainNotationChange(e.target.value)}
            placeholder="TT+, AQs+, AKo..."
            className="flex-1 bg-zinc-900 border border-zinc-600 rounded px-2 py-1.5 text-xs font-mono-poker text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-600"
          />
          <MiniPresetSelector onSelect={handleVillainNotationChange} />
          {villainNotation && (
            <button onClick={() => handleVillainNotationChange('')} className="px-2 py-1.5 rounded text-xs text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700 transition-colors">✕</button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500">ou Top</span>
          <input
            type="text"
            value={villainTopPct}
            onChange={(e) => setVillainTopPct(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleVillainTopPct(); }}
            placeholder="%"
            className="w-12 bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-[10px] font-mono-poker text-zinc-300 text-center placeholder-zinc-600 focus:outline-none focus:border-emerald-600"
          />
          <button
            onClick={handleVillainTopPct}
            disabled={!villainTopPct}
            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-700 text-zinc-300 hover:bg-zinc-600 disabled:opacity-30 transition-colors"
          >
            OK
          </button>
        </div>
      </div>

      {/* Target equity */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 space-y-2">
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Equity cible</span>
        <div className="flex items-center gap-2">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as 'gte' | 'lte')}
            className="bg-zinc-900 border border-zinc-600 rounded px-2 py-1.5 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="gte">Au moins (≥)</option>
            <option value="lte">Au plus (≤)</option>
          </select>
          <input
            type="number"
            min={0}
            max={100}
            value={targetEquity}
            onChange={(e) => setTargetEquity(e.target.value)}
            className="w-16 bg-zinc-900 border border-zinc-600 rounded px-2 py-1.5 text-xs font-mono-poker text-zinc-200 text-center focus:outline-none focus:border-emerald-600"
          />
          <span className="text-xs text-zinc-500">%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={targetEquity}
          onChange={(e) => setTargetEquity(e.target.value)}
          className="w-full h-1 accent-emerald-500"
        />
      </div>

      {/* Calculate button */}
      <button
        onClick={handleCalculate}
        disabled={!villainNotation.trim() || isCalculating}
        className="w-full py-2.5 rounded-lg font-bold text-sm transition-colors bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isCalculating ? 'Calcul en cours...' : 'Trouver les mains'}
      </button>

      {/* Results */}
      {resultRange && resultStats && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">
              {resultStats.matchCount} mains · {resultCombos} combos · {resultPct.toFixed(1)}%
            </span>
            <span className="text-[10px] text-zinc-600">
              {(resultStats.timeMs / 1000).toFixed(1)}s
            </span>
          </div>

          {/* Result grid */}
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
              Mains avec {mode === 'gte' ? '≥' : '≤'}{targetEquity}% equity
            </div>
            <ReadOnlyGrid range={resultRange} equities={heatmapData ?? undefined} />
          </div>

          {/* Notation */}
          <div className="bg-zinc-900 rounded p-2">
            <div className="text-[10px] text-zinc-500 mb-1">Notation :</div>
            <div className="text-xs font-mono-poker text-zinc-200 break-all leading-relaxed max-h-16 overflow-y-auto">
              {resultNotation || '(aucune main)'}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleApply}
              disabled={!resultNotation}
              className="flex-1 py-2 rounded-lg font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition-colors"
            >
              Charger dans la grille
            </button>
            <button
              onClick={() => { if (resultNotation) navigator.clipboard.writeText(resultNotation); }}
              disabled={!resultNotation}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-zinc-700 text-zinc-300 hover:bg-zinc-600 disabled:opacity-40 transition-colors"
            >
              Copier
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import type { EquityResult } from '../../engine/equity';
import { selectTopPercent, rangeToNotation } from '../../engine/ranges';
import { MiniPresetSelector } from './MiniPresetSelector';
import { useT } from '../../hooks/useT';

interface PlayerPanelProps {
  index: number;
  label: string;
  notation: string;
  onNotationChange: (notation: string) => void;
  onOpenGrid: () => void;
  onActivate: () => void;
  result?: EquityResult;
  isActive: boolean;
  comboCount: number;
}

export function PlayerPanel({
  index,
  label,
  notation,
  onNotationChange,
  onOpenGrid,
  onActivate,
  result,
  isActive,
  comboCount,
}: PlayerPanelProps) {
  const t = useT();
  const equity = result?.equity[index];
  const win = result?.wins[index];
  const tie = result?.ties[index];
  const [topPct, setTopPct] = useState('');

  const handleTopPctApply = () => {
    const val = parseFloat(topPct);
    if (isNaN(val) || val <= 0 || val > 100) return;
    const range = selectTopPercent(val);
    const notation = rangeToNotation(range);
    onNotationChange(notation);
    setTopPct('');
  };

  const handleTopPctKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleTopPctApply();
  };

  return (
    <div className={`rounded-lg border p-3 transition-colors ${
      isActive ? 'bg-zinc-800 border-emerald-600' : 'bg-zinc-800/50 border-zinc-700'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          {label}
        </span>
        {equity !== undefined && (
          <span className="text-xl font-bold text-emerald-400 font-mono-poker">
            {(equity * 100).toFixed(1)}%
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={notation}
          onChange={(e) => onNotationChange(e.target.value)}
          onFocus={onActivate}
          placeholder="AA, AKs, QQ+..."
          className="flex-1 bg-zinc-900 border border-zinc-600 rounded px-2 py-1.5 text-xs font-mono-poker text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-600"
        />
        {notation && (
          <button
            onClick={() => onNotationChange('')}
            className="px-2 py-1.5 rounded text-xs text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700 transition-colors"
            title={t('clear')}
          >
            ✕
          </button>
        )}
        <MiniPresetSelector onSelect={onNotationChange} />
        <button
          onClick={onOpenGrid}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
            isActive
              ? 'bg-emerald-600 text-white'
              : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
          }`}
        >
          {t('grid')}
        </button>
      </div>

      {/* Top % quick input */}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-[10px] text-zinc-500">Top</span>
        <input
          type="text"
          value={topPct}
          onChange={(e) => setTopPct(e.target.value)}
          onKeyDown={handleTopPctKeyDown}
          onFocus={onActivate}
          placeholder="%"
          className="w-12 bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-[10px] font-mono-poker text-zinc-300 text-center placeholder-zinc-600 focus:outline-none focus:border-emerald-600"
        />
        <button
          onClick={handleTopPctApply}
          disabled={!topPct}
          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-700 text-zinc-300 hover:bg-zinc-600 disabled:opacity-30 transition-colors"
        >
          {t('apply')}
        </button>
        {result && (
          <div className="flex gap-3 ml-auto text-[10px] text-zinc-500">
            <span>Win: <span className="text-zinc-300">{((win ?? 0) * 100).toFixed(1)}%</span></span>
            <span>Tie: <span className="text-zinc-300">{((tie ?? 0) * 100).toFixed(1)}%</span></span>
            <span>{comboCount} combos</span>
          </div>
        )}
      </div>
    </div>
  );
}

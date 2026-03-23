import { useCallback, useEffect, useState } from 'react';
import { RangeGrid } from './components/RangeGrid/RangeGrid';
import { RangeStats } from './components/RangeGrid/RangeStats';
import { PercentageSlider } from './components/PercentageSlider/PercentageSlider';
import { EquityCalculator } from './components/EquityCalculator/EquityCalculator';
import { EquityTrainer } from './components/EquityTrainer/EquityTrainer';
import { BrushWeight } from './components/RangeGrid/BrushWeight';
import { PresetSelector } from './components/RangeGrid/PresetSelector';
import { HeatmapOverlay } from './components/RangeGrid/HeatmapOverlay';
import { RangeManager } from './components/RangeManager/RangeManager';
import { EquityFilter } from './components/EquityFilter/EquityFilter';
import { useRangeStore } from './store/rangeStore';
import { useThemeStore } from './store/themeStore';
import { useT } from './hooks/useT';
import { useLangStore } from './store/langStore';
import { rangeToNotation, type RangeMatrix } from './engine/ranges';
import type { HeatmapResult } from './engine/heatmap';

type RightTab = 'calculator' | 'trainer' | 'ranges' | 'filter';

export default function App() {
  const t = useT();
  const [activePlayer, setActivePlayer] = useState<number>(0);
  const [externalRange, setExternalRange] = useState<{ playerIndex: number; range: RangeMatrix } | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapResult | null>(null);
  const [rightTab, setRightTab] = useState<RightTab>('calculator');

  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const lang = useLangStore((s) => s.lang);
  const toggleLang = useLangStore((s) => s.toggleLang);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const range = useRangeStore((s) => s.range);
  const setRange = useRangeStore((s) => s.setRange);
  const undo = useRangeStore((s) => s.undo);
  const redo = useRangeStore((s) => s.redo);
  const clearRange = useRangeStore((s) => s.clearRange);
  const getNotation = useRangeStore((s) => s.getNotation);
  const importNotation = useRangeStore((s) => s.importNotation);

  const handleOpenGrid = useCallback((playerIndex: number, playerRange: RangeMatrix) => {
    setActivePlayer(playerIndex);
    setRange(playerRange);
    setHeatmap(null);
  }, [setRange]);

  useEffect(() => {
    setExternalRange({ playerIndex: activePlayer, range });
  }, [range, activePlayer]);

  const handleHeatmapResult = useCallback((result: HeatmapResult | null) => {
    setHeatmap(result);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';

      // Cmd+Z — Undo
      if (meta && !e.shiftKey && e.key === 'z' && !isInput) {
        e.preventDefault();
        undo();
        return;
      }
      // Cmd+Shift+Z — Redo
      if (meta && e.shiftKey && e.key === 'z' && !isInput) {
        e.preventDefault();
        redo();
        return;
      }
      // Cmd+C — Copy range notation (when not in input)
      if (meta && e.key === 'c' && !isInput) {
        e.preventDefault();
        const notation = getNotation();
        if (notation) navigator.clipboard.writeText(notation);
        return;
      }
      // Cmd+V — Paste range notation (when not in input)
      if (meta && e.key === 'v' && !isInput) {
        e.preventDefault();
        navigator.clipboard.readText().then(text => {
          if (text.trim()) importNotation(text.trim());
        });
        return;
      }
      // Cmd+N — Clear range
      if (meta && e.key === 'n' && !isInput) {
        e.preventDefault();
        clearRange();
        return;
      }
      // Escape — Close heatmap
      if (e.key === 'Escape') {
        if (heatmap) setHeatmap(null);
        return;
      }
      // 1-9 — Select player panel (when not in input)
      if (!isInput && e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key) - 1;
        if (idx >= 0) {
          setActivePlayer(idx);
        }
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, clearRange, getNotation, importNotation, heatmap]);

  return (
    <div className="h-screen flex flex-col bg-zinc-900 text-zinc-100">
      {/* Title bar drag region */}
      <div
        className="h-8 flex items-center justify-center text-xs text-zinc-500 shrink-0 relative"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        EquiMac
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <button
            onClick={toggleLang}
            className="w-7 h-6 rounded flex items-center justify-center text-[10px] font-bold text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700 transition-colors"
            title={lang === 'en' ? 'Passer en français' : 'Switch to English'}
          >
            {lang === 'en' ? 'FR' : 'EN'}
          </button>
        <button
          onClick={toggleTheme}
          className="w-6 h-6 rounded flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700 transition-colors"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          title={theme === 'dark' ? t('switch_light') : t('switch_dark')}
        >
          {theme === 'dark' ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex gap-4 p-4 pt-0 min-h-0">
        {/* Left panel: Range grid or Heatmap */}
        <div className="flex flex-col gap-3 min-w-0">
          {heatmap ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                  {t('heatmap_title')}
                </span>
                <button
                  onClick={() => setHeatmap(null)}
                  className="text-[10px] text-zinc-500 hover:text-zinc-300 underline"
                >
                  {t('back_to_grid')}
                </button>
              </div>
              <HeatmapOverlay equities={heatmap.equities} />
              <div className="text-[10px] text-zinc-600 text-center">
                {t('computed_in')} {(heatmap.timeMs / 1000).toFixed(1)}s
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                  {t('range_player')} {activePlayer + 1}
                </span>
                <PresetSelector />
              </div>
              <RangeGrid />
              <PercentageSlider />
              <BrushWeight />
              <RangeStats />
            </>
          )}
        </div>

        {/* Right panel: tabs */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Tab bar */}
          <div className="flex gap-1 mb-3 shrink-0">
            {([
              { id: 'calculator' as const, label: t('tab_calculator') },
              { id: 'trainer' as const, label: t('tab_quiz') },
              { id: 'filter' as const, label: t('tab_filter') },
              { id: 'ranges' as const, label: t('tab_ranges') },
            ]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setRightTab(tab.id)}
                className={`px-3 py-1.5 rounded-t text-xs font-semibold transition-colors ${
                  rightTab === tab.id
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 border-b-zinc-800'
                    : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">
            {rightTab === 'calculator' && (
              <EquityCalculator
                onOpenGrid={handleOpenGrid}
                externalRange={externalRange}
                onHeatmapResult={handleHeatmapResult}
              />
            )}
            {rightTab === 'trainer' && (
              <EquityTrainer />
            )}
            {rightTab === 'filter' && (
              <EquityFilter onApplyResult={(range) => {
                setRange(range);
                setHeatmap(null);
              }} />
            )}
            {rightTab === 'ranges' && (
              <RangeManager />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

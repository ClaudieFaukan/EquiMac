import { useState, useRef, useEffect } from 'react';
import { type Card } from '../../engine/evaluator';
import { SUIT_SYMBOLS, type Suit } from '../../engine/constants';
import { useSuitColors } from '../../hooks/useSuitColors';
import type { RangeMatrix } from '../../engine/ranges';
import type { ScenarioResult, CardEquity } from '../../engine/scenario';

interface ScenarioAnalyzerProps {
  ranges: RangeMatrix[];
  board: Card[];
  deadCards: Card[];
}

const SUITS_MAP: Suit[] = ['s', 'h', 'd', 'c'];

function equityColor(equity: number, baseEquity: number): string {
  const diff = equity - baseEquity;
  if (diff > 0.05) return 'text-emerald-400';
  if (diff > 0.01) return 'text-emerald-600';
  if (diff < -0.05) return 'text-red-400';
  if (diff < -0.01) return 'text-red-600';
  return 'text-zinc-400';
}

function CardLabel({ card, suitColors }: { card: Card; suitColors: Record<Suit, string> }) {
  const ranks = '23456789TJQKA';
  const rankChar = ranks[card >> 2];
  const suit = SUITS_MAP[card & 3];
  return (
    <span className="font-mono-poker font-bold" style={{ color: suitColors[suit] }}>
      {rankChar}{SUIT_SYMBOLS[suit]}
    </span>
  );
}

export function ScenarioAnalyzer({ ranges, board, deadCards }: ScenarioAnalyzerProps) {
  const suitColors = useSuitColors();
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [sortBy, setSortBy] = useState<'equity' | 'card'>('equity');
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new Worker(
      new URL('../../../workers/equity-worker.ts', import.meta.url),
      { type: 'module' }
    );
    workerRef.current = worker;
    return () => worker.terminate();
  }, []);

  const canAnalyze = ranges.length >= 2 && board.length >= 3 && board.length < 5;

  const handleAnalyze = () => {
    if (!canAnalyze || !workerRef.current) return;
    setIsCalculating(true);

    const worker = workerRef.current;
    const handler = (e: MessageEvent) => {
      if (e.data.type === 'scenario-result') {
        setResult(e.data.result);
      }
      setIsCalculating(false);
      worker.removeEventListener('message', handler);
    };
    worker.addEventListener('message', handler);
    worker.postMessage({
      type: 'scenario',
      ranges,
      board,
      deadCards,
      iterationsPerCard: 3000,
    });
  };

  const sortedCards = result?.cards ? [...result.cards] : [];
  if (sortBy === 'card') {
    sortedCards.sort((a, b) => a.card - b.card);
  }

  const boardLabel = board.length === 3 ? 'Turn' : 'River';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Analyseur — Cartes du {boardLabel}
        </span>
        <div className="flex gap-2">
          {result && (
            <button
              onClick={() => setResult(null)}
              className="px-2 py-1 rounded text-xs text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700 transition-colors"
              title="Fermer les résultats"
            >
              ✕
            </button>
          )}
          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze || isCalculating}
            className="px-3 py-1 rounded text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isCalculating ? 'Analyse...' : 'Analyser'}
          </button>
        </div>
      </div>

      {!canAnalyze && (
        <p className="text-[10px] text-zinc-600">
          Entrez 2 ranges et un flop (ou flop+turn) pour analyser les cartes suivantes.
        </p>
      )}

      {result && (
        <>
          <div className="flex gap-2 text-[10px] text-zinc-500">
            <span>Base: J1 {(result.baseEquities[0] * 100).toFixed(1)}%</span>
            <span className="text-zinc-700">|</span>
            <span>{result.cards.length} cartes analysées en {(result.timeMs / 1000).toFixed(1)}s</span>
            <span className="text-zinc-700">|</span>
            <button
              onClick={() => setSortBy(sortBy === 'equity' ? 'card' : 'equity')}
              className="text-zinc-400 hover:text-zinc-200 underline"
            >
              Trier par {sortBy === 'equity' ? 'carte' : 'equity'}
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto rounded border border-zinc-700">
            <table className="w-full text-[11px]">
              <thead className="bg-zinc-800 sticky top-0">
                <tr>
                  <th className="text-left px-2 py-1 text-zinc-500 font-normal">Carte</th>
                  <th className="text-right px-2 py-1 text-zinc-500 font-normal">J1</th>
                  <th className="text-right px-2 py-1 text-zinc-500 font-normal">J2</th>
                  <th className="text-right px-2 py-1 text-zinc-500 font-normal">Diff</th>
                </tr>
              </thead>
              <tbody>
                {sortedCards.map((ce) => {
                  const diff = ce.equities[0] - result.baseEquities[0];
                  return (
                    <tr key={ce.card} className="border-t border-zinc-800 hover:bg-zinc-800/50">
                      <td className="px-2 py-0.5">
                        <CardLabel card={ce.card} suitColors={suitColors} />
                      </td>
                      <td className={`text-right px-2 py-0.5 font-mono-poker ${equityColor(ce.equities[0], result.baseEquities[0])}`}>
                        {(ce.equities[0] * 100).toFixed(1)}%
                      </td>
                      <td className="text-right px-2 py-0.5 font-mono-poker text-zinc-500">
                        {(ce.equities[1] * 100).toFixed(1)}%
                      </td>
                      <td className={`text-right px-2 py-0.5 font-mono-poker ${equityColor(ce.equities[0], result.baseEquities[0])}`}>
                        {diff >= 0 ? '+' : ''}{(diff * 100).toFixed(1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

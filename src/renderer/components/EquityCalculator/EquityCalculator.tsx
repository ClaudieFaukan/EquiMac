import { useState, useCallback, useRef, useEffect } from 'react';
import { type EquityResult, type EquityInput } from '../../engine/equity';
import { parseRangeNotation, rangeToNotation, countCombos, type RangeMatrix } from '../../engine/ranges';
import { type Card } from '../../engine/evaluator';
import type { HeatmapResult } from '../../engine/heatmap';
import { PlayerPanel } from './PlayerPanel';
import { ResultsBar } from './ResultsBar';
import { BoardSelector } from '../BoardSelector/BoardSelector';
import { DeadCards } from './DeadCards';
import { ScenarioAnalyzer } from '../ScenarioAnalyzer/ScenarioAnalyzer';

interface PlayerState {
  notation: string;
  range: RangeMatrix;
}

interface EquityCalculatorProps {
  onOpenGrid?: (playerIndex: number, range: RangeMatrix) => void;
  externalRange?: { playerIndex: number; range: RangeMatrix } | null;
  onHeatmapResult?: (result: HeatmapResult | null) => void;
}

export function EquityCalculator({ onOpenGrid, externalRange, onHeatmapResult }: EquityCalculatorProps) {
  const [players, setPlayers] = useState<PlayerState[]>([
    { notation: '', range: parseRangeNotation('') },
    { notation: '', range: parseRangeNotation('') },
  ]);
  const [board, setBoard] = useState<Card[]>([]);
  const [deadCards, setDeadCards] = useState<Card[]>([]);
  const [result, setResult] = useState<EquityResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isHeatmapping, setIsHeatmapping] = useState(false);
  const [activePlayer, setActivePlayer] = useState<number>(0);
  const [iterations, setIterations] = useState(100000);
  const workerRef = useRef<Worker | null>(null);
  const heatmapWorkerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new Worker(
      new URL('../../../workers/equity-worker.ts', import.meta.url),
      { type: 'module' }
    );
    const heatWorker = new Worker(
      new URL('../../../workers/equity-worker.ts', import.meta.url),
      { type: 'module' }
    );
    workerRef.current = worker;
    heatmapWorkerRef.current = heatWorker;
    return () => { worker.terminate(); heatWorker.terminate(); };
  }, []);

  // Apply external range from grid
  if (externalRange) {
    const { playerIndex, range } = externalRange;
    if (playerIndex >= 0 && playerIndex < players.length) {
      const notation = rangeToNotation(range);
      if (notation !== players[playerIndex].notation) {
        const newPlayers = [...players];
        newPlayers[playerIndex] = { notation, range };
        setPlayers(newPlayers);
      }
    }
  }

  const updatePlayerNotation = useCallback((index: number, notation: string) => {
    setPlayers(prev => {
      const next = [...prev];
      next[index] = { notation, range: parseRangeNotation(notation) };
      return next;
    });
    setResult(null);
  }, []);

  const handleOpenGrid = useCallback((index: number) => {
    setActivePlayer(index);
    onOpenGrid?.(index, players[index].range);
  }, [onOpenGrid, players]);

  const addPlayer = useCallback(() => {
    if (players.length >= 6) return;
    setPlayers(prev => [...prev, { notation: '', range: parseRangeNotation('') }]);
    setResult(null);
  }, [players.length]);

  const removePlayer = useCallback(() => {
    if (players.length <= 2) return;
    setPlayers(prev => prev.slice(0, -1));
    setResult(null);
  }, [players.length]);

  const usedCards = new Set<number>([...board, ...deadCards]);
  const canCalculate = players.filter(p => countCombos(p.range) > 0).length >= 2;

  const handleCalculate = useCallback(() => {
    if (!canCalculate || !workerRef.current) return;
    setIsCalculating(true);

    const worker = workerRef.current;
    const input: EquityInput = {
      ranges: players.map(p => p.range),
      board,
      deadCards,
      iterations,
    };

    const handler = (e: MessageEvent) => {
      if (e.data.type === 'result') {
        setResult(e.data.result);
      }
      setIsCalculating(false);
      worker.removeEventListener('message', handler);
    };

    worker.addEventListener('message', handler);
    worker.postMessage({ type: 'calculate', input });
  }, [players, board, deadCards, iterations, canCalculate]);

  const handleHeatmap = useCallback(() => {
    if (!canCalculate || !heatmapWorkerRef.current || players.length < 2) return;
    setIsHeatmapping(true);

    const worker = heatmapWorkerRef.current;
    const handler = (e: MessageEvent) => {
      if (e.data.type === 'heatmap-result') {
        onHeatmapResult?.(e.data.result);
      }
      setIsHeatmapping(false);
      worker.removeEventListener('message', handler);
    };

    worker.addEventListener('message', handler);
    worker.postMessage({
      type: 'heatmap',
      heroRange: players[0].range,
      villainRange: players[1].range,
      board,
      deadCards,
      iterationsPerHand: 1500,
    });
  }, [players, board, deadCards, canCalculate, onHeatmapResult]);

  const playerLabels = players.map((_, i) => `Joueur ${i + 1}`);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Player panels */}
      <div className="flex flex-col gap-2">
        {players.map((player, i) => (
          <PlayerPanel
            key={i}
            index={i}
            label={`Joueur ${i + 1}`}
            notation={player.notation}
            onNotationChange={(n) => updatePlayerNotation(i, n)}
            onOpenGrid={() => handleOpenGrid(i)}
            result={result ?? undefined}
            isActive={activePlayer === i}
            comboCount={countCombos(player.range)}
          />
        ))}
      </div>

      {/* Add/Remove player buttons */}
      <div className="flex gap-2">
        <button
          onClick={addPlayer}
          disabled={players.length >= 6}
          className="flex-1 py-1 rounded text-xs font-semibold bg-zinc-700 text-zinc-300 hover:bg-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          + Joueur
        </button>
        <button
          onClick={removePlayer}
          disabled={players.length <= 2}
          className="flex-1 py-1 rounded text-xs font-semibold bg-zinc-700 text-zinc-300 hover:bg-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          − Joueur
        </button>
      </div>

      {/* Board selector */}
      <BoardSelector
        board={board}
        onBoardChange={setBoard}
        usedCards={usedCards}
      />

      {/* Dead cards */}
      <DeadCards
        deadCards={deadCards}
        onDeadCardsChange={setDeadCards}
        usedCards={usedCards}
      />

      {/* Iterations selector */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Itérations</span>
        <select
          value={iterations}
          onChange={(e) => setIterations(Number(e.target.value))}
          className="bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none"
        >
          <option value={10000}>10k</option>
          <option value={50000}>50k</option>
          <option value={100000}>100k</option>
          <option value={500000}>500k</option>
          <option value={1000000}>1M</option>
        </select>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleCalculate}
          disabled={!canCalculate || isCalculating}
          className="flex-1 py-2.5 rounded-lg font-bold text-sm transition-colors bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isCalculating ? 'Calcul...' : 'Calculer'}
        </button>
        <div className="relative group">
          <button
            onClick={handleHeatmap}
            disabled={!canCalculate || isHeatmapping}
            className="py-2.5 px-4 rounded-lg font-bold text-sm transition-colors bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isHeatmapping ? '...' : 'Heatmap'}
          </button>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-zinc-700 border border-zinc-600 rounded-lg p-2.5 shadow-xl text-[11px] text-zinc-300 leading-relaxed opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
            Affiche la force de chaque main du J1 contre le range du J2 par un code couleur sur la grille (vert = forte, rouge = faible).
          </div>
        </div>
      </div>

      {/* Results bar */}
      {result && (
        <div className="space-y-2">
          <ResultsBar equities={result.equity} labels={playerLabels} />
          <div className="text-[10px] text-zinc-600 text-center">
            {result.iterations.toLocaleString()} simulations en {result.timeMs.toFixed(0)}ms
          </div>
        </div>
      )}

      {/* Scenario analyzer */}
      <ScenarioAnalyzer
        ranges={players.map(p => p.range)}
        board={board}
        deadCards={deadCards}
      />
    </div>
  );
}

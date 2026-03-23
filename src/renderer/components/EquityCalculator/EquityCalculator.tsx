import { useState, useCallback, useRef } from 'react';
import { calculateEquity, type EquityResult, type EquityInput } from '../../engine/equity';
import { parseRangeNotation, rangeToNotation, countCombos, type RangeMatrix } from '../../engine/ranges';
import { type Card } from '../../engine/evaluator';
import { PlayerPanel } from './PlayerPanel';
import { ResultsBar } from './ResultsBar';
import { BoardSelector } from '../BoardSelector/BoardSelector';

interface PlayerState {
  notation: string;
  range: RangeMatrix;
}

interface EquityCalculatorProps {
  /** Called when a player panel requests to open the range grid */
  onOpenGrid?: (playerIndex: number, range: RangeMatrix) => void;
  /** Range received from the grid editor */
  externalRange?: { playerIndex: number; range: RangeMatrix } | null;
}

export function EquityCalculator({ onOpenGrid, externalRange }: EquityCalculatorProps) {
  const [players, setPlayers] = useState<PlayerState[]>([
    { notation: '', range: parseRangeNotation('') },
    { notation: '', range: parseRangeNotation('') },
  ]);
  const [board, setBoard] = useState<Card[]>([]);
  const [result, setResult] = useState<EquityResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activePlayer, setActivePlayer] = useState<number>(0);
  const [iterations, setIterations] = useState(100000);

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

  // Collect all used cards (board cards)
  const usedCards = new Set<number>(board);

  const canCalculate = players.filter(p => countCombos(p.range) > 0).length >= 2;

  const handleCalculate = useCallback(() => {
    if (!canCalculate) return;
    setIsCalculating(true);

    // Use setTimeout to let UI update before heavy computation
    setTimeout(() => {
      const input: EquityInput = {
        ranges: players.map(p => p.range),
        board,
        deadCards: [],
        iterations,
      };
      const res = calculateEquity(input);
      setResult(res);
      setIsCalculating(false);
    }, 10);
  }, [players, board, iterations, canCalculate]);

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

      {/* Calculate button */}
      <button
        onClick={handleCalculate}
        disabled={!canCalculate || isCalculating}
        className="w-full py-2.5 rounded-lg font-bold text-sm transition-colors bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isCalculating ? 'Calcul en cours...' : 'Calculer'}
      </button>

      {/* Results bar */}
      {result && (
        <div className="space-y-2">
          <ResultsBar equities={result.equity} labels={playerLabels} />
          <div className="text-[10px] text-zinc-600 text-center">
            {result.iterations.toLocaleString()} simulations en {result.timeMs.toFixed(0)}ms
          </div>
        </div>
      )}
    </div>
  );
}

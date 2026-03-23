import { useState, useRef, useEffect, useCallback } from 'react';
import { type Card, makeCard, cardToString } from '../../engine/evaluator';
import { SUIT_SYMBOLS, SUIT_COLORS, type Suit } from '../../engine/constants';
import { parseRangeNotation } from '../../engine/ranges';

const SUITS_MAP: Suit[] = ['s', 'h', 'd', 'c'];

interface QuizRound {
  heroCards: [Card, Card];
  villainNotation: string;
  board: Card[];
  correctEquity: number;
  guessedEquity: number | null;
  error: number | null;
}

function randomHeroHand(): { cards: [Card, Card] } {
  const rank1 = Math.floor(Math.random() * 13);
  const rank2 = Math.floor(Math.random() * 13);
  const s1 = Math.floor(Math.random() * 4);
  let s2 = Math.floor(Math.random() * 4);
  if (rank1 === rank2) {
    while (s2 === s1) s2 = Math.floor(Math.random() * 4);
  }
  return { cards: [makeCard(rank1 + 2, s1), makeCard(rank2 + 2, s2)] };
}

function randomVillainRange(): string {
  const options = [
    'AA, KK, QQ, JJ, AKs, AQs',
    'TT+, AQs+, AKo',
    '77+, ATs+, KQs, AJo+, KQo',
    '55+, A2s+, K9s+, Q9s+, J9s+, T9s, 98s, A9o+, KTo+, QJo',
    '22+, A2s+, K2s+, Q5s+, J8s+, T8s+, 97s+, 87s, A2o+, K7o+, Q9o+',
  ];
  return options[Math.floor(Math.random() * options.length)];
}

function randomBoard(mode: 'preflop' | 'flop'): Card[] {
  if (mode === 'preflop') return [];
  const used = new Set<number>();
  const board: Card[] = [];
  while (board.length < 3) {
    const c = Math.floor(Math.random() * 52);
    if (!used.has(c)) { board.push(c); used.add(c); }
  }
  return board;
}

function CardDisplay({ card }: { card: Card }) {
  const ranks = '23456789TJQKA';
  const rankChar = ranks[card >> 2];
  const suit = SUITS_MAP[card & 3];
  return (
    <span className="font-mono-poker font-bold" style={{ color: SUIT_COLORS[suit] }}>
      {rankChar}{SUIT_SYMBOLS[suit]}
    </span>
  );
}

function buildHeroRange(cards: [Card, Card]) {
  const r = Array.from({ length: 13 }, () => Array(13).fill(0));
  const g1 = 12 - (cards[0] >> 2);
  const g2 = 12 - (cards[1] >> 2);
  const s1 = cards[0] & 3;
  const s2 = cards[1] & 3;
  if (g1 === g2) {
    r[g1][g2] = 1;
  } else if (s1 === s2) {
    r[Math.min(g1, g2)][Math.max(g1, g2)] = 1;
  } else {
    r[Math.max(g1, g2)][Math.min(g1, g2)] = 1;
  }
  return r;
}

type Phase = 'setup' | 'playing' | 'results';

export function EquityTrainer() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [mode, setMode] = useState<'preflop' | 'flop'>('preflop');
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [customCount, setCustomCount] = useState('');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [round, setRound] = useState<QuizRound | null>(null);
  const [guess, setGuess] = useState(50);
  const [history, setHistory] = useState<QuizRound[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new Worker(
      new URL('../../../workers/equity-worker.ts', import.meta.url),
      { type: 'module' }
    );
    workerRef.current = worker;
    return () => worker.terminate();
  }, []);

  const generateRound = useCallback((useMode: 'preflop' | 'flop') => {
    if (!workerRef.current) return;
    setRevealed(false);
    setGuess(50);
    setIsCalculating(true);

    const hero = randomHeroHand();
    const villainNotation = randomVillainRange();
    const board = randomBoard(useMode);
    const villainRange = parseRangeNotation(villainNotation);

    const worker = workerRef.current;
    const handler = (e: MessageEvent) => {
      if (e.data.type === 'result') {
        setRound({
          heroCards: hero.cards,
          villainNotation,
          board,
          correctEquity: Math.round(e.data.result.equity[0] * 1000) / 10,
          guessedEquity: null,
          error: null,
        });
      }
      setIsCalculating(false);
      worker.removeEventListener('message', handler);
    };
    worker.addEventListener('message', handler);
    worker.postMessage({
      type: 'calculate',
      input: {
        ranges: [buildHeroRange(hero.cards), villainRange],
        board,
        deadCards: [],
        iterations: 30000,
      },
    });
  }, []);

  const handleStart = (m: 'preflop' | 'flop') => {
    setMode(m);
    setHistory([]);
    setCurrentIndex(0);
    setPhase('playing');
    generateRound(m);
  };

  const handleReveal = () => {
    if (!round) return;
    const error = Math.abs(guess - round.correctEquity);
    const updated = { ...round, guessedEquity: guess, error };
    setRound(updated);
    setHistory(prev => [...prev, updated]);
    setRevealed(true);
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= totalQuestions) {
      setPhase('results');
      return;
    }
    setCurrentIndex(nextIndex);
    generateRound(mode);
  };

  const handleBackToSetup = () => {
    setPhase('setup');
    setRound(null);
    setHistory([]);
    setCurrentIndex(0);
  };

  const avgError = history.length > 0
    ? history.reduce((sum, r) => sum + (r.error ?? 0), 0) / history.length
    : 0;

  const excellentCount = history.filter(r => (r.error ?? 99) <= 5).length;
  const okCount = history.filter(r => (r.error ?? 99) > 5 && (r.error ?? 99) <= 10).length;
  const badCount = history.filter(r => (r.error ?? 99) > 10).length;

  // ── SETUP SCREEN ──
  if (phase === 'setup') {
    return (
      <div className="flex flex-col gap-4">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Quiz d'equity</span>

        {/* Question count */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 space-y-3">
          <span className="text-xs text-zinc-400">Nombre de questions</span>
          <div className="flex gap-2">
            {[10, 20].map(n => (
              <button
                key={n}
                onClick={() => { setTotalQuestions(n); setCustomCount(''); }}
                className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
                  totalQuestions === n && !customCount
                    ? 'bg-purple-600 text-white'
                    : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                }`}
              >
                {n}
              </button>
            ))}
            <input
              type="number"
              min={1}
              max={99}
              value={customCount}
              onChange={(e) => {
                setCustomCount(e.target.value);
                const v = parseInt(e.target.value);
                if (v > 0 && v <= 99) setTotalQuestions(v);
              }}
              placeholder="Libre"
              className="w-20 bg-zinc-900 border border-zinc-600 rounded px-2 py-2 text-sm font-mono-poker text-zinc-200 placeholder-zinc-600 text-center focus:outline-none focus:border-purple-600"
            />
          </div>
        </div>

        {/* Mode buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => handleStart('preflop')}
            className="flex-1 py-4 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-colors space-y-1"
          >
            <div>Preflop</div>
            <div className="text-[10px] font-normal text-purple-200">Main vs Range</div>
          </button>
          <button
            onClick={() => handleStart('flop')}
            className="flex-1 py-4 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-colors space-y-1"
          >
            <div>Postflop</div>
            <div className="text-[10px] font-normal text-purple-200">Main vs Range + Board</div>
          </button>
        </div>
      </div>
    );
  }

  // ── RESULTS SCREEN ──
  if (phase === 'results') {
    return (
      <div className="flex flex-col gap-4">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Résultats — {mode === 'preflop' ? 'Preflop' : 'Postflop'}
        </span>

        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-5 space-y-4 text-center">
          <div className={`text-3xl font-bold font-mono-poker ${avgError <= 5 ? 'text-emerald-400' : avgError <= 10 ? 'text-amber-400' : 'text-red-400'}`}>
            {avgError.toFixed(1)}%
          </div>
          <div className="text-sm text-zinc-400">Écart moyen sur {history.length} questions</div>

          <div className="flex justify-center gap-6 text-sm">
            <div className="text-center">
              <div className="text-emerald-400 font-bold text-lg">{excellentCount}</div>
              <div className="text-[10px] text-zinc-500">Excellent</div>
              <div className="text-[10px] text-zinc-600">(&le;5%)</div>
            </div>
            <div className="text-center">
              <div className="text-amber-400 font-bold text-lg">{okCount}</div>
              <div className="text-[10px] text-zinc-500">Pas mal</div>
              <div className="text-[10px] text-zinc-600">(5-10%)</div>
            </div>
            <div className="text-center">
              <div className="text-red-400 font-bold text-lg">{badCount}</div>
              <div className="text-[10px] text-zinc-500">À travailler</div>
              <div className="text-[10px] text-zinc-600">(&gt;10%)</div>
            </div>
          </div>
        </div>

        {/* History detail */}
        <div className="max-h-48 overflow-y-auto rounded border border-zinc-700">
          <table className="w-full text-[11px]">
            <thead className="bg-zinc-800 sticky top-0">
              <tr>
                <th className="text-left px-2 py-1 text-zinc-500 font-normal">#</th>
                <th className="text-left px-2 py-1 text-zinc-500 font-normal">Main</th>
                <th className="text-right px-2 py-1 text-zinc-500 font-normal">Réponse</th>
                <th className="text-right px-2 py-1 text-zinc-500 font-normal">Estimation</th>
                <th className="text-right px-2 py-1 text-zinc-500 font-normal">Écart</th>
              </tr>
            </thead>
            <tbody>
              {history.map((r, i) => (
                <tr key={i} className="border-t border-zinc-800">
                  <td className="px-2 py-0.5 text-zinc-600">{i + 1}</td>
                  <td className="px-2 py-0.5">
                    <CardDisplay card={r.heroCards[0]} /> <CardDisplay card={r.heroCards[1]} />
                  </td>
                  <td className="text-right px-2 py-0.5 font-mono-poker text-zinc-300">{r.correctEquity}%</td>
                  <td className="text-right px-2 py-0.5 font-mono-poker text-purple-400">{r.guessedEquity}%</td>
                  <td className={`text-right px-2 py-0.5 font-mono-poker font-bold ${
                    (r.error ?? 99) <= 5 ? 'text-emerald-400' : (r.error ?? 99) <= 10 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {r.error?.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={handleBackToSetup}
          className="w-full py-2.5 rounded-lg font-bold text-sm bg-purple-600 hover:bg-purple-500 text-white transition-colors"
        >
          Nouveau quiz
        </button>
      </div>
    );
  }

  // ── PLAYING SCREEN ──
  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          {mode === 'preflop' ? 'Preflop' : 'Postflop'} — {currentIndex + 1}/{totalQuestions}
        </span>
        <button
          onClick={handleBackToSetup}
          className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Quitter
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-zinc-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-600 transition-all duration-300"
          style={{ width: `${((currentIndex + (revealed ? 1 : 0)) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question */}
      {round && (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 space-y-3">
          <div className="text-center">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Votre main</span>
            <span className="text-2xl">
              <CardDisplay card={round.heroCards[0]} />
              {' '}
              <CardDisplay card={round.heroCards[1]} />
            </span>
          </div>

          {round.board.length > 0 && (
            <div className="text-center">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Board</span>
              <span className="text-lg">
                {round.board.map((c, i) => (
                  <span key={i}>
                    <CardDisplay card={c} />
                    {i < round.board.length - 1 && ' '}
                  </span>
                ))}
              </span>
            </div>
          )}

          <div className="text-center">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Range adverse</span>
            <span className="text-xs font-mono-poker text-zinc-300">{round.villainNotation}</span>
          </div>

          {!revealed && !isCalculating && (
            <div className="space-y-2">
              <div className="text-center text-sm text-zinc-400">
                Estimez votre equity :
                <span className="ml-2 text-lg font-bold text-purple-400 font-mono-poker">{guess}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={guess}
                onChange={(e) => setGuess(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
              <button
                onClick={handleReveal}
                className="w-full py-2 rounded-lg font-bold text-sm bg-purple-600 hover:bg-purple-500 text-white transition-colors"
              >
                Valider
              </button>
            </div>
          )}

          {isCalculating && (
            <div className="text-center text-sm text-zinc-500 py-4">Chargement...</div>
          )}

          {revealed && round.error !== null && (
            <div className="space-y-3">
              <div className="text-center space-y-1">
                <div className="text-sm">
                  Réponse : <span className="font-bold text-emerald-400 font-mono-poker">{round.correctEquity}%</span>
                </div>
                <div className="text-sm">
                  Votre estimation : <span className="font-bold text-purple-400 font-mono-poker">{round.guessedEquity}%</span>
                </div>
                <div className={`text-sm font-bold ${round.error <= 5 ? 'text-emerald-400' : round.error <= 10 ? 'text-amber-400' : 'text-red-400'}`}>
                  Écart : {round.error.toFixed(1)}%
                  {round.error <= 5 ? ' — Excellent !' : round.error <= 10 ? ' — Pas mal' : ' — À travailler'}
                </div>
              </div>
              <button
                onClick={handleNext}
                className="w-full py-2 rounded-lg font-bold text-sm bg-purple-600 hover:bg-purple-500 text-white transition-colors"
              >
                {currentIndex + 1 >= totalQuestions ? 'Voir les résultats' : 'Question suivante'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Running stats */}
      {history.length > 0 && (
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-2">
          <div className="flex justify-between text-[10px] text-zinc-500">
            <span>{history.length}/{totalQuestions} répondu{history.length > 1 ? 'es' : 'e'}</span>
            <span>
              Écart moyen : <span className={`font-bold font-mono-poker ${avgError <= 5 ? 'text-emerald-400' : avgError <= 10 ? 'text-amber-400' : 'text-red-400'}`}>
                {avgError.toFixed(1)}%
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

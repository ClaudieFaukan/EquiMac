import { useState } from 'react';
import {
  type ActionQuestion, type PokerAction, type Questionnaire,
  ACTION_LABELS, ACTION_COLORS,
} from '../../data/quiz-types';
import { useT } from '../../hooks/useT';

interface ActionQuizProps {
  questionnaire: Questionnaire;
  onFinish: () => void;
}

interface ActionResult {
  question: ActionQuestion;
  answer: PokerAction;
  correct: boolean;
}

export function ActionQuiz({ questionnaire, onFinish }: ActionQuizProps) {
  const t = useT();
  const questions = questionnaire.questions ?? [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answered, setAnswered] = useState<PokerAction | null>(null);
  const [history, setHistory] = useState<ActionResult[]>([]);
  const [phase, setPhase] = useState<'playing' | 'results'>('playing');

  const question = questions[currentIndex];
  const correctCount = history.filter(r => r.correct).length;

  const handleAnswer = (action: PokerAction) => {
    if (answered) return;
    setAnswered(action);
    setHistory(prev => [...prev, {
      question,
      answer: action,
      correct: action === question.correctAction,
    }]);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setPhase('results');
      return;
    }
    setCurrentIndex(currentIndex + 1);
    setAnswered(null);
  };

  if (phase === 'results') {
    return (
      <div className="flex flex-col gap-4">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          {t('results')} — {questionnaire.name}
        </span>

        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-5 text-center space-y-3">
          <div className={`text-3xl font-bold font-mono-poker ${
            correctCount / questions.length >= 0.8 ? 'text-emerald-400' :
            correctCount / questions.length >= 0.6 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {correctCount}/{questions.length}
          </div>
          <div className="text-sm text-zinc-400">
            {Math.round(correctCount / questions.length * 100)}% {t('correct_answers')}
          </div>
        </div>

        {/* Detail */}
        <div className="max-h-60 overflow-y-auto rounded border border-zinc-700">
          <table className="w-full text-[11px]">
            <thead className="bg-zinc-800 sticky top-0">
              <tr>
                <th className="text-left px-2 py-1 text-zinc-500 font-normal">#</th>
                <th className="text-left px-2 py-1 text-zinc-500 font-normal">{t('hand')}</th>
                <th className="text-left px-2 py-1 text-zinc-500 font-normal">Position</th>
                <th className="text-left px-2 py-1 text-zinc-500 font-normal">{t('answer')}</th>
                <th className="text-left px-2 py-1 text-zinc-500 font-normal">{t('correct')}</th>
              </tr>
            </thead>
            <tbody>
              {history.map((r, i) => (
                <tr key={i} className="border-t border-zinc-800">
                  <td className="px-2 py-1 text-zinc-600">{i + 1}</td>
                  <td className="px-2 py-1 font-mono-poker text-zinc-300">{r.question.heroHand}</td>
                  <td className="px-2 py-1 text-zinc-400">{r.question.heroPosition}</td>
                  <td className={`px-2 py-1 font-semibold ${r.correct ? 'text-emerald-400' : 'text-red-400'}`}>
                    {ACTION_LABELS[r.answer]}
                  </td>
                  <td className="px-2 py-1 text-zinc-500">{ACTION_LABELS[r.question.correctAction]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={onFinish}
          className="w-full py-2.5 rounded-lg font-bold text-sm bg-purple-600 hover:bg-purple-500 text-white transition-colors"
        >
          {t('back')}
        </button>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          {questionnaire.name} — {currentIndex + 1}/{questions.length}
        </span>
        <button
          onClick={onFinish}
          className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {t('quit')}
        </button>
      </div>

      {/* Progress */}
      <div className="h-1 bg-zinc-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-600 transition-all duration-300"
          style={{ width: `${((currentIndex + (answered ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question card */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 space-y-4">
        {/* Situation */}
        <div className="text-center space-y-2">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{question.situation}</div>
          <div className="flex items-center justify-center gap-3">
            <span className="px-2 py-0.5 rounded bg-zinc-700 text-[10px] font-semibold text-zinc-300">
              {question.heroPosition}
            </span>
            <span className="text-xl font-mono-poker font-bold text-zinc-100">
              {question.heroHand}
            </span>
            {question.stackBB && (
              <span className="px-2 py-0.5 rounded bg-zinc-700 text-[10px] font-semibold text-zinc-300">
                {question.stackBB}bb
              </span>
            )}
          </div>
          <div className="text-xs text-zinc-400">{question.villainAction}</div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 justify-center">
          {question.options.map(action => {
            const isSelected = answered === action;
            const isCorrect = action === question.correctAction;
            const showResult = answered !== null;

            let btnClass = `${ACTION_COLORS[action]} text-white`;
            if (showResult) {
              if (isCorrect) {
                btnClass = 'bg-emerald-600 text-white ring-2 ring-emerald-400';
              } else if (isSelected && !isCorrect) {
                btnClass = 'bg-red-600 text-white ring-2 ring-red-400';
              } else {
                btnClass = 'bg-zinc-700 text-zinc-500';
              }
            }

            return (
              <button
                key={action}
                onClick={() => handleAnswer(action)}
                disabled={answered !== null}
                className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${btnClass} disabled:cursor-default`}
              >
                {ACTION_LABELS[action]}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {answered && question.explanation && (
          <div className={`text-center text-xs p-2 rounded ${
            answered === question.correctAction ? 'bg-emerald-900/30 text-emerald-300' : 'bg-red-900/30 text-red-300'
          }`}>
            {question.explanation}
          </div>
        )}

        {answered && (
          <button
            onClick={handleNext}
            className="w-full py-2 rounded-lg font-bold text-sm bg-purple-600 hover:bg-purple-500 text-white transition-colors"
          >
            {currentIndex + 1 >= questions.length ? t('view_results') : t('next')}
          </button>
        )}
      </div>

      {/* Running stats */}
      {history.length > 0 && (
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-2">
          <div className="flex justify-between text-[10px] text-zinc-500">
            <span>{correctCount}/{history.length} {t('correct')}</span>
            <span className={`font-bold font-mono-poker ${
              correctCount / history.length >= 0.8 ? 'text-emerald-400' :
              correctCount / history.length >= 0.6 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {Math.round(correctCount / history.length * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

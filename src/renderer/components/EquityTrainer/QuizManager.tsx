import { useState, useRef } from 'react';
import { useQuizStore } from '../../store/quizStore';
import {
  BUILTIN_QUESTIONNAIRES,
  type Questionnaire, type QuestionnaireExport,
  type ActionQuestion, type PokerAction, type Position,
} from '../../data/quiz-types';

interface QuizManagerProps {
  onBack: () => void;
}

const POSITIONS: Position[] = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];
const ACTIONS: PokerAction[] = ['fold', 'call', 'raise', '3bet', '4bet', 'allin'];

export function QuizManager({ onBack }: QuizManagerProps) {
  const {
    customQuestionnaires, disabledIds,
    addQuestionnaire, deleteQuestionnaire, toggleQuestionnaire,
    importQuestionnaires, exportQuestionnaires,
  } = useQuizStore();

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [questions, setQuestions] = useState<ActionQuestion[]>([]);
  const [showAddQ, setShowAddQ] = useState(false);

  // New question fields
  const [qSituation, setQSituation] = useState('');
  const [qPosition, setQPosition] = useState<Position>('BTN');
  const [qHand, setQHand] = useState('');
  const [qVillain, setQVillain] = useState('');
  const [qStackBB, setQStackBB] = useState('');
  const [qOptions, setQOptions] = useState<Set<PokerAction>>(new Set(['fold', 'call', 'raise']));
  const [qCorrect, setQCorrect] = useState<PokerAction>('call');
  const [qExplanation, setQExplanation] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const allQuizzes = [...BUILTIN_QUESTIONNAIRES, ...customQuestionnaires];
  const builtInIds = new Set(BUILTIN_QUESTIONNAIRES.map(q => q.id));

  const handleAddQuestion = () => {
    if (!qHand.trim() || !qSituation.trim()) return;
    const q: ActionQuestion = {
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      situation: qSituation,
      heroPosition: qPosition,
      heroHand: qHand.trim(),
      villainAction: qVillain,
      stackBB: qStackBB ? parseInt(qStackBB) : undefined,
      options: Array.from(qOptions),
      correctAction: qCorrect,
      explanation: qExplanation || undefined,
    };
    setQuestions(prev => [...prev, q]);
    // Reset fields
    setQHand('');
    setQVillain('');
    setQExplanation('');
    setShowAddQ(false);
  };

  const handleCreate = () => {
    if (!newName.trim() || questions.length === 0) return;
    const questionnaire: Questionnaire = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: newName.trim(),
      description: newDesc.trim() || undefined,
      type: 'action',
      questions,
      createdAt: Date.now(),
    };
    addQuestionnaire(questionnaire);
    setNewName('');
    setNewDesc('');
    setQuestions([]);
    setShowCreate(false);
  };

  const handleExport = () => {
    const data = exportQuestionnaires();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'equimac-questionnaires.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as QuestionnaireExport;
        if (data.version === 1 && Array.isArray(data.questionnaires)) {
          importQuestionnaires(data);
        }
      } catch {}
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Gérer les questionnaires</span>
        <button onClick={onBack} className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors">Retour</button>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setShowCreate(true)}
          className="px-3 py-1.5 rounded text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors"
        >
          + Créer
        </button>
        <button
          onClick={handleExport}
          disabled={customQuestionnaires.length === 0}
          className="px-3 py-1.5 rounded text-xs font-semibold bg-zinc-700 text-zinc-300 hover:bg-zinc-600 disabled:opacity-30 transition-colors"
        >
          Exporter
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 rounded text-xs font-semibold bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors"
        >
          Importer
        </button>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 space-y-3">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Nouveau questionnaire</span>
          <input
            type="text" value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="Nom du questionnaire" autoFocus
            className="w-full bg-zinc-900 border border-zinc-600 rounded px-2 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-600"
          />
          <input
            type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)}
            placeholder="Description (optionnel)"
            className="w-full bg-zinc-900 border border-zinc-600 rounded px-2 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none"
          />

          {/* Questions list */}
          {questions.length > 0 && (
            <div className="text-[10px] text-zinc-400">
              {questions.length} question{questions.length > 1 ? 's' : ''} ajoutée{questions.length > 1 ? 's' : ''}
              <div className="mt-1 space-y-1">
                {questions.map((q, i) => (
                  <div key={i} className="flex items-center justify-between bg-zinc-900 rounded px-2 py-1">
                    <span className="font-mono-poker text-zinc-300">{q.heroPosition} — {q.heroHand} → {q.correctAction}</span>
                    <button onClick={() => setQuestions(prev => prev.filter((_, j) => j !== i))} className="text-zinc-600 hover:text-red-400">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add question */}
          {!showAddQ ? (
            <button onClick={() => setShowAddQ(true)} className="text-[10px] text-purple-400 hover:text-purple-300">+ Ajouter une question</button>
          ) : (
            <div className="bg-zinc-900 rounded p-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={qSituation} onChange={e => setQSituation(e.target.value)} placeholder="Situation"
                  className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-[10px] text-zinc-200 placeholder-zinc-600 focus:outline-none" />
                <select value={qPosition} onChange={e => setQPosition(e.target.value as Position)}
                  className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-[10px] text-zinc-200 focus:outline-none">
                  {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <input type="text" value={qHand} onChange={e => setQHand(e.target.value)} placeholder="Main (ex: AKs)"
                  className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-[10px] font-mono-poker text-zinc-200 placeholder-zinc-600 focus:outline-none" />
                <input type="text" value={qVillain} onChange={e => setQVillain(e.target.value)} placeholder="Action vilain"
                  className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-[10px] text-zinc-200 placeholder-zinc-600 focus:outline-none" />
                <input type="number" value={qStackBB} onChange={e => setQStackBB(e.target.value)} placeholder="Stack (bb)"
                  className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-[10px] text-zinc-200 placeholder-zinc-600 focus:outline-none" />
                <select value={qCorrect} onChange={e => setQCorrect(e.target.value as PokerAction)}
                  className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-[10px] text-zinc-200 focus:outline-none">
                  {ACTIONS.filter(a => qOptions.has(a)).map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="flex gap-1 flex-wrap">
                <span className="text-[9px] text-zinc-500 mr-1">Options:</span>
                {ACTIONS.map(a => (
                  <button key={a} onClick={() => {
                    const next = new Set(qOptions);
                    if (next.has(a)) next.delete(a); else next.add(a);
                    setQOptions(next);
                  }}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${qOptions.has(a) ? 'bg-purple-600 text-white' : 'bg-zinc-700 text-zinc-500'}`}
                  >{a}</button>
                ))}
              </div>
              <input type="text" value={qExplanation} onChange={e => setQExplanation(e.target.value)} placeholder="Explication (optionnel)"
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-[10px] text-zinc-200 placeholder-zinc-600 focus:outline-none" />
              <div className="flex gap-2">
                <button onClick={handleAddQuestion} disabled={!qHand.trim() || !qSituation.trim()}
                  className="px-2 py-1 rounded text-[10px] font-semibold bg-purple-600 text-white disabled:opacity-40">Ajouter</button>
                <button onClick={() => setShowAddQ(false)} className="px-2 py-1 rounded text-[10px] text-zinc-500">Annuler</button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={!newName.trim() || questions.length === 0}
              className="px-3 py-1.5 rounded text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40">Créer le questionnaire</button>
            <button onClick={() => { setShowCreate(false); setQuestions([]); }} className="px-2 py-1.5 rounded text-xs text-zinc-500 hover:text-zinc-300">Annuler</button>
          </div>
        </div>
      )}

      {/* Questionnaires list */}
      <div className="flex flex-col gap-1 overflow-y-auto">
        {allQuizzes.map(q => {
          const isBuiltIn = builtInIds.has(q.id);
          const isDisabled = disabledIds.has(q.id);
          const count = q.type === 'action' ? q.questions?.length ?? 0 : q.equityCount ?? 0;

          return (
            <div key={q.id} className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${isDisabled ? 'border-zinc-800 opacity-50' : 'border-zinc-700'}`}>
              <button
                onClick={() => toggleQuestionnaire(q.id)}
                className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] transition-colors shrink-0 ${
                  isDisabled ? 'border-zinc-600 text-zinc-700' : 'border-purple-600 bg-purple-600 text-white'
                }`}
              >
                {!isDisabled && '✓'}
              </button>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-zinc-300 truncate">
                  {q.name}
                  <span className="ml-1 text-zinc-600 font-normal">
                    ({count} questions · {q.type === 'action' ? 'Actions' : 'Equity'})
                  </span>
                </div>
                {q.description && (
                  <div className="text-[10px] text-zinc-600 truncate">{q.description}</div>
                )}
              </div>
              {isBuiltIn && (
                <span className="text-[9px] text-zinc-600 shrink-0">Intégré</span>
              )}
              {!isBuiltIn && (
                <button
                  onClick={() => deleteQuestionnaire(q.id)}
                  className="text-[10px] text-zinc-600 hover:text-red-400 shrink-0 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

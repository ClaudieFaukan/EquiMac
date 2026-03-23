import { create } from 'zustand';
import {
  BUILTIN_QUESTIONNAIRES,
  type Questionnaire,
  type QuestionnaireExport,
} from '../data/quiz-types';

interface QuizStoreState {
  customQuestionnaires: Questionnaire[];
  disabledIds: Set<string>;

  addQuestionnaire: (q: Questionnaire) => void;
  deleteQuestionnaire: (id: string) => void;
  toggleQuestionnaire: (id: string) => void;
  importQuestionnaires: (data: QuestionnaireExport) => void;
  exportQuestionnaires: () => QuestionnaireExport;
  getAllQuestionnaires: () => Questionnaire[];
  getActiveQuestionnaires: () => Questionnaire[];
}

const STORAGE_KEY = 'equimac-quiz-library';

function loadFromStorage(): { customQuestionnaires: Questionnaire[]; disabledIds: string[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { customQuestionnaires: [], disabledIds: [] };
}

function saveToStorage(custom: Questionnaire[], disabled: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ customQuestionnaires: custom, disabledIds: disabled }));
}

const initial = loadFromStorage();

export const useQuizStore = create<QuizStoreState>((set, get) => ({
  customQuestionnaires: initial.customQuestionnaires,
  disabledIds: new Set(initial.disabledIds),

  addQuestionnaire: (q) => {
    set(state => {
      const customQuestionnaires = [...state.customQuestionnaires, q];
      saveToStorage(customQuestionnaires, Array.from(state.disabledIds));
      return { customQuestionnaires };
    });
  },

  deleteQuestionnaire: (id) => {
    set(state => {
      const customQuestionnaires = state.customQuestionnaires.filter(q => q.id !== id);
      saveToStorage(customQuestionnaires, Array.from(state.disabledIds));
      return { customQuestionnaires };
    });
  },

  toggleQuestionnaire: (id) => {
    set(state => {
      const next = new Set(state.disabledIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveToStorage(state.customQuestionnaires, Array.from(next));
      return { disabledIds: next };
    });
  },

  importQuestionnaires: (data) => {
    set(state => {
      const existingIds = new Set([
        ...BUILTIN_QUESTIONNAIRES.map(q => q.id),
        ...state.customQuestionnaires.map(q => q.id),
      ]);
      const newOnes = data.questionnaires
        .filter(q => !existingIds.has(q.id))
        .map(q => ({ ...q, id: `import-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }));
      const customQuestionnaires = [...state.customQuestionnaires, ...newOnes];
      saveToStorage(customQuestionnaires, Array.from(state.disabledIds));
      return { customQuestionnaires };
    });
  },

  exportQuestionnaires: () => {
    const state = get();
    return { version: 1, questionnaires: state.customQuestionnaires };
  },

  getAllQuestionnaires: () => {
    const state = get();
    return [...BUILTIN_QUESTIONNAIRES, ...state.customQuestionnaires];
  },

  getActiveQuestionnaires: () => {
    const state = get();
    return [...BUILTIN_QUESTIONNAIRES, ...state.customQuestionnaires]
      .filter(q => !state.disabledIds.has(q.id));
  },
}));

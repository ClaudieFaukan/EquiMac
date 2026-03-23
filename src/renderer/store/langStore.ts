import { create } from 'zustand';
import type { Lang } from '../i18n/translations';

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
}

const STORAGE_KEY = 'equimac-lang';

function loadLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'fr') return saved;
  } catch {}
  return 'en';
}

export const useLangStore = create<LangState>((set) => ({
  lang: loadLang(),
  setLang: (lang) => {
    localStorage.setItem(STORAGE_KEY, lang);
    set({ lang });
  },
  toggleLang: () => {
    set(state => {
      const next = state.lang === 'en' ? 'fr' : 'en';
      localStorage.setItem(STORAGE_KEY, next);
      return { lang: next };
    });
  },
}));

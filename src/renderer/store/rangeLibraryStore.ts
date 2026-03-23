import { create } from 'zustand';
import { PRESET_RANGES, type PresetCategory, type PresetRange } from '../data/preset-ranges';

export interface CustomRange {
  id: string;
  name: string;
  notation: string;
  category: string;
  createdAt: number;
}

export interface ExportData {
  version: 1;
  ranges: CustomRange[];
}

interface RangeLibraryState {
  /** IDs of disabled built-in categories */
  disabledCategories: Set<string>;
  /** User-created ranges */
  customRanges: CustomRange[];
  /** User-created category names */
  customCategories: string[];

  // Actions
  toggleCategory: (categoryName: string) => void;
  addCustomRange: (name: string, notation: string, category: string) => void;
  deleteCustomRange: (id: string) => void;
  updateCustomRange: (id: string, name: string, notation: string) => void;
  addCustomCategory: (name: string) => void;
  deleteCustomCategory: (name: string) => void;
  importRanges: (data: ExportData) => void;
  exportRanges: () => ExportData;

  // Getters
  getActivePresets: () => PresetCategory[];
  getAllRanges: () => PresetCategory[];
}

const STORAGE_KEY = 'equimac-range-library';

function loadFromStorage(): { disabledCategories: string[]; customRanges: CustomRange[]; customCategories: string[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { disabledCategories: [], customRanges: [], customCategories: [] };
}

function saveToStorage(state: { disabledCategories: string[]; customRanges: CustomRange[]; customCategories: string[] }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const initial = loadFromStorage();

export const useRangeLibraryStore = create<RangeLibraryState>((set, get) => ({
  disabledCategories: new Set(initial.disabledCategories),
  customRanges: initial.customRanges,
  customCategories: initial.customCategories,

  toggleCategory: (categoryName) => {
    set(state => {
      const next = new Set(state.disabledCategories);
      if (next.has(categoryName)) next.delete(categoryName);
      else next.add(categoryName);
      saveToStorage({
        disabledCategories: Array.from(next),
        customRanges: state.customRanges,
        customCategories: state.customCategories,
      });
      return { disabledCategories: next };
    });
  },

  addCustomRange: (name, notation, category) => {
    set(state => {
      const newRange: CustomRange = {
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name,
        notation,
        category,
        createdAt: Date.now(),
      };
      const customRanges = [...state.customRanges, newRange];
      saveToStorage({
        disabledCategories: Array.from(state.disabledCategories),
        customRanges,
        customCategories: state.customCategories,
      });
      return { customRanges };
    });
  },

  deleteCustomRange: (id) => {
    set(state => {
      const customRanges = state.customRanges.filter(r => r.id !== id);
      saveToStorage({
        disabledCategories: Array.from(state.disabledCategories),
        customRanges,
        customCategories: state.customCategories,
      });
      return { customRanges };
    });
  },

  updateCustomRange: (id, name, notation) => {
    set(state => {
      const customRanges = state.customRanges.map(r =>
        r.id === id ? { ...r, name, notation } : r
      );
      saveToStorage({
        disabledCategories: Array.from(state.disabledCategories),
        customRanges,
        customCategories: state.customCategories,
      });
      return { customRanges };
    });
  },

  addCustomCategory: (name) => {
    set(state => {
      if (state.customCategories.includes(name)) return state;
      const customCategories = [...state.customCategories, name];
      saveToStorage({
        disabledCategories: Array.from(state.disabledCategories),
        customRanges: state.customRanges,
        customCategories,
      });
      return { customCategories };
    });
  },

  deleteCustomCategory: (name) => {
    set(state => {
      const customCategories = state.customCategories.filter(c => c !== name);
      const customRanges = state.customRanges.filter(r => r.category !== name);
      saveToStorage({
        disabledCategories: Array.from(state.disabledCategories),
        customRanges,
        customCategories,
      });
      return { customCategories, customRanges };
    });
  },

  importRanges: (data) => {
    set(state => {
      // Merge: add new ranges, skip duplicates by name+category
      const existing = new Set(state.customRanges.map(r => `${r.category}:${r.name}`));
      const newRanges = data.ranges.filter(r => !existing.has(`${r.category}:${r.name}`));
      // Ensure categories exist
      const newCats = new Set(state.customCategories);
      for (const r of newRanges) {
        if (!newCats.has(r.category)) newCats.add(r.category);
      }
      const customRanges = [...state.customRanges, ...newRanges];
      const customCategories = Array.from(newCats);
      saveToStorage({
        disabledCategories: Array.from(state.disabledCategories),
        customRanges,
        customCategories,
      });
      return { customRanges, customCategories };
    });
  },

  exportRanges: () => {
    const state = get();
    return { version: 1, ranges: state.customRanges };
  },

  getActivePresets: () => {
    const state = get();
    const builtIn = PRESET_RANGES.filter(c => !state.disabledCategories.has(c.name));
    const customByCategory = new Map<string, PresetRange[]>();
    for (const r of state.customRanges) {
      const cat = r.category;
      if (state.disabledCategories.has(cat)) continue;
      if (!customByCategory.has(cat)) customByCategory.set(cat, []);
      customByCategory.get(cat)!.push({ name: r.name, notation: r.notation });
    }
    const customCats: PresetCategory[] = [];
    for (const [name, presets] of customByCategory) {
      customCats.push({ name, presets });
    }
    return [...builtIn, ...customCats];
  },

  getAllRanges: () => {
    const state = get();
    const builtIn = PRESET_RANGES.map(c => ({ ...c }));
    const customByCategory = new Map<string, PresetRange[]>();
    for (const r of state.customRanges) {
      if (!customByCategory.has(r.category)) customByCategory.set(r.category, []);
      customByCategory.get(r.category)!.push({ name: r.name, notation: r.notation });
    }
    const customCats: PresetCategory[] = [];
    for (const catName of state.customCategories) {
      customCats.push({ name: catName, presets: customByCategory.get(catName) || [] });
    }
    return [...builtIn, ...customCats];
  },
}));

import { create } from 'zustand';
import {
  type RangeMatrix,
  createEmptyRange,
  cloneRange,
  countCombos,
  rangePercentage,
  rangeToNotation,
  parseRangeNotation,
  selectTopPercent,
  selectPercentRange,
} from '../engine/ranges';

interface RangeState {
  range: RangeMatrix;
  sliderLow: number;
  sliderHigh: number;
  brushWeight: number; // 0-1, weight for brush mode
  // Undo/redo stacks
  undoStack: RangeMatrix[];
  redoStack: RangeMatrix[];

  // Derived (computed on demand)
  getCombos: () => number;
  getPercentage: () => number;
  getNotation: () => string;

  // Actions
  toggleCell: (row: number, col: number) => void;
  setCellWeight: (row: number, col: number, weight: number) => void;
  paintCell: (row: number, col: number, value: number) => void;
  setRange: (range: RangeMatrix) => void;
  clearRange: () => void;
  importNotation: (notation: string) => void;
  setSliderLow: (value: number) => void;
  setSliderHigh: (value: number) => void;
  applySlider: (low: number, high: number) => void;
  setBrushWeight: (weight: number) => void;
  pushUndo: () => void;
  undo: () => void;
  redo: () => void;
}

export const useRangeStore = create<RangeState>((set, get) => ({
  range: createEmptyRange(),
  sliderLow: 0,
  sliderHigh: 0,
  brushWeight: 1,
  undoStack: [],
  redoStack: [],

  getCombos: () => countCombos(get().range),
  getPercentage: () => rangePercentage(get().range),
  getNotation: () => rangeToNotation(get().range),

  toggleCell: (row, col) => {
    const state = get();
    const newRange = cloneRange(state.range);
    newRange[row][col] = newRange[row][col] > 0 ? 0 : 1;
    set({
      range: newRange,
      undoStack: [...state.undoStack, cloneRange(state.range)],
      redoStack: [],
    });
  },

  setCellWeight: (row, col, weight) => {
    const state = get();
    const newRange = cloneRange(state.range);
    newRange[row][col] = Math.max(0, Math.min(1, weight));
    set({ range: newRange });
  },

  paintCell: (row, col, value) => {
    const state = get();
    const newRange = cloneRange(state.range);
    newRange[row][col] = value;
    set({ range: newRange });
  },

  setRange: (range) => {
    const state = get();
    set({
      range,
      undoStack: [...state.undoStack, cloneRange(state.range)],
      redoStack: [],
    });
  },

  clearRange: () => {
    const state = get();
    set({
      range: createEmptyRange(),
      sliderLow: 0,
      sliderHigh: 0,
      undoStack: [...state.undoStack, cloneRange(state.range)],
      redoStack: [],
    });
  },

  importNotation: (notation) => {
    const state = get();
    const newRange = parseRangeNotation(notation);
    set({
      range: newRange,
      undoStack: [...state.undoStack, cloneRange(state.range)],
      redoStack: [],
    });
  },

  setSliderLow: (value) => set({ sliderLow: value }),
  setSliderHigh: (value) => set({ sliderHigh: value }),
  setBrushWeight: (weight) => set({ brushWeight: Math.max(0, Math.min(1, weight)) }),

  applySlider: (low, high) => {
    const state = get();
    const newRange = low === 0
      ? selectTopPercent(high)
      : selectPercentRange(low, high);
    set({
      range: newRange,
      sliderLow: low,
      sliderHigh: high,
      undoStack: [...state.undoStack, cloneRange(state.range)],
      redoStack: [],
    });
  },

  pushUndo: () => {
    const state = get();
    set({
      undoStack: [...state.undoStack, cloneRange(state.range)],
      redoStack: [],
    });
  },

  undo: () => {
    const state = get();
    if (state.undoStack.length === 0) return;
    const prev = state.undoStack[state.undoStack.length - 1];
    set({
      range: prev,
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, cloneRange(state.range)],
    });
  },

  redo: () => {
    const state = get();
    if (state.redoStack.length === 0) return;
    const next = state.redoStack[state.redoStack.length - 1];
    set({
      range: next,
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack, cloneRange(state.range)],
    });
  },
}));

import { calculateEquity, type EquityInput, type EquityResult } from '../renderer/engine/equity';
import { analyzeScenario, type ScenarioResult } from '../renderer/engine/scenario';
import { calculateHeatmap, type HeatmapResult } from '../renderer/engine/heatmap';
import type { RangeMatrix } from '../renderer/engine/ranges';
import type { Card } from '../renderer/engine/evaluator';

export type WorkerMessage =
  | { type: 'calculate'; input: EquityInput }
  | { type: 'scenario'; ranges: RangeMatrix[]; board: Card[]; deadCards: Card[]; iterationsPerCard: number }
  | { type: 'heatmap'; heroRange: RangeMatrix; villainRange: RangeMatrix; board: Card[]; deadCards: Card[]; iterationsPerHand: number };

export type WorkerResponse =
  | { type: 'result'; result: EquityResult }
  | { type: 'scenario-result'; result: ScenarioResult }
  | { type: 'heatmap-result'; result: HeatmapResult }
  | { type: 'error'; error: string };

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  try {
    switch (e.data.type) {
      case 'calculate': {
        const result = calculateEquity(e.data.input);
        self.postMessage({ type: 'result', result } as WorkerResponse);
        break;
      }
      case 'scenario': {
        const result = analyzeScenario(e.data.ranges, e.data.board, e.data.deadCards, e.data.iterationsPerCard);
        self.postMessage({ type: 'scenario-result', result } as WorkerResponse);
        break;
      }
      case 'heatmap': {
        const result = calculateHeatmap(e.data.heroRange, e.data.villainRange, e.data.board, e.data.deadCards, e.data.iterationsPerHand);
        self.postMessage({ type: 'heatmap-result', result } as WorkerResponse);
        break;
      }
    }
  } catch (err) {
    self.postMessage({ type: 'error', error: String(err) } as WorkerResponse);
  }
};

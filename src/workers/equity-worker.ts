import { calculateEquity, type EquityInput, type EquityResult } from '../renderer/engine/equity';

export interface WorkerMessage {
  type: 'calculate';
  input: EquityInput;
}

export interface WorkerResponse {
  type: 'result' | 'error';
  result?: EquityResult;
  error?: string;
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  if (e.data.type === 'calculate') {
    try {
      const result = calculateEquity(e.data.input);
      self.postMessage({ type: 'result', result } as WorkerResponse);
    } catch (err) {
      self.postMessage({ type: 'error', error: String(err) } as WorkerResponse);
    }
  }
};

import { useThemeStore } from '../store/themeStore';
import { getSuitColors } from '../engine/constants';
import type { Suit } from '../engine/constants';

export function useSuitColors(): Record<Suit, string> {
  const theme = useThemeStore(s => s.theme);
  return getSuitColors(theme);
}

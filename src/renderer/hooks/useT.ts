import { useCallback } from 'react';
import { useLangStore } from '../store/langStore';
import { t, type TranslationKey } from '../i18n/translations';

/** Returns a translation function bound to the current language */
export function useT() {
  const lang = useLangStore(s => s.lang);
  return useCallback((key: TranslationKey) => t(key, lang), [lang]);
}

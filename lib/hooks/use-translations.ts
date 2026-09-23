'use client';

import { useCallback } from 'react';
import { translate } from '@/lib/messages';
import { useLocaleStore } from '@/stores/locale-store';

export function useTranslations() {
  const locale = useLocaleStore((state) => state.locale);
  const t = useCallback((key: string, values?: Record<string, string | number>) => translate(locale, key, values), [locale]);
  return { locale, t };
}

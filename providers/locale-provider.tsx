'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { localeDirection } from '@/lib/i18n';
import { useLocaleStore } from '@/stores/locale-store';

const LOCALIZED_QUERY_ROOTS = new Set([
  'brands', 'categories', 'collections', 'products', 'catalog',
  'notifications', 'promotions', 'commerce',
]);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const locale = useLocaleStore((state) => state.locale);
  const hydrate = useLocaleStore((state) => state.hydrate);
  const previousLocale = useRef(locale);

  useEffect(() => hydrate(), [hydrate]);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = localeDirection(locale);
    root.dataset.locale = locale;

    if (previousLocale.current !== locale) {
      previousLocale.current = locale;
      void queryClient.invalidateQueries({
        predicate: (query) => LOCALIZED_QUERY_ROOTS.has(String(query.queryKey[0] ?? '')),
      });
      router.refresh();
    }
  }, [locale, queryClient, router]);

  return <>{children}</>;
}

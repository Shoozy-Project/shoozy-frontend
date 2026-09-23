'use client';

import { create } from 'zustand';
import { isLocale, LOCALE_COOKIE_KEY, LOCALE_STORAGE_KEY, type Locale } from '@/lib/i18n';

interface LocaleState {
  locale: Locale;
  isHydrated: boolean;
  hydrate: () => void;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: 'en',
  isHydrated: false,
  hydrate: () => {
    let locale: Locale = 'en';
    try {
      const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (isLocale(saved)) locale = saved;
      else if (navigator.language.toLowerCase().startsWith('ar')) locale = 'ar';
    } catch {
      // English remains the safe fallback when browser storage is unavailable.
    }
    document.cookie = `${LOCALE_COOKIE_KEY}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    set({ locale, isHydrated: true });
  },
  setLocale: (locale) => {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // The in-memory preference remains usable in restricted browsers.
    }
    document.cookie = `${LOCALE_COOKIE_KEY}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    set({ locale, isHydrated: true });
  },
}));

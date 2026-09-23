export const LOCALES = ['en', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_STORAGE_KEY = 'shoozy-locale';
export const LOCALE_COOKIE_KEY = 'shoozy-locale';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && LOCALES.includes(value as Locale);
}

export function localeDirection(locale: Locale) {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export const LOCALE_BOOTSTRAP_SCRIPT = `(() => {
  const root = document.documentElement;
  let locale = 'en';
  try {
    const saved = localStorage.getItem('${LOCALE_STORAGE_KEY}');
    if (saved === 'ar' || saved === 'en') locale = saved;
  } catch {}
  root.lang = locale;
  root.dir = locale === 'ar' ? 'rtl' : 'ltr';
  root.dataset.locale = locale;
})();`;

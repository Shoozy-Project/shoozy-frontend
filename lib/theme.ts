export const THEME_STORAGE_KEY = 'shoozy-theme';
export const LEGACY_THEME_STORAGE_KEY = 'shoezy_theme';

export const THEMES = ['light', 'dark', 'system'] as const;
export type Theme = (typeof THEMES)[number];
export type ResolvedTheme = Exclude<Theme, 'system'>;

export function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && THEMES.includes(value as Theme);
}

export const THEME_BOOTSTRAP_SCRIPT = `(() => {
  const root = document.documentElement;
  let saved = 'system';
  try {
    const value = localStorage.getItem('${THEME_STORAGE_KEY}') || localStorage.getItem('${LEGACY_THEME_STORAGE_KEY}');
    if (value === 'light' || value === 'dark' || value === 'system') saved = value;
  } catch {}
  const dark = saved === 'dark' || (saved === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  root.classList.toggle('dark', dark);
  root.style.colorScheme = dark ? 'dark' : 'light';
  root.dataset.theme = saved;
  root.dataset.appArea = location.pathname.startsWith('/admin') ? 'admin' : 'storefront';
})();`;

'use client';

import { create } from 'zustand';
import {
  isTheme,
  LEGACY_THEME_STORAGE_KEY,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type Theme,
} from '@/lib/theme';

interface ThemeState {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  setResolvedTheme: (theme: ResolvedTheme) => void;
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (isTheme(stored)) return stored;

    const legacy = localStorage.getItem(LEGACY_THEME_STORAGE_KEY);
    if (isTheme(legacy)) {
      localStorage.setItem(THEME_STORAGE_KEY, legacy);
      localStorage.removeItem(LEGACY_THEME_STORAGE_KEY);
      return legacy;
    }
  } catch {
    // Storage may be unavailable in privacy-restricted contexts.
  }
  return 'system';
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme !== 'system') return theme;
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const initialTheme = getInitialTheme();

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,
  resolvedTheme: resolveTheme(initialTheme),

  setTheme: (theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      localStorage.removeItem(LEGACY_THEME_STORAGE_KEY);
    } catch {
      // The in-memory preference still works when storage is unavailable.
    }
    set({ theme });
  },
  setResolvedTheme: (resolvedTheme) => set({ resolvedTheme }),
}));

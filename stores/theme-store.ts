'use client';

import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('shoezy_theme') as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  // Respect system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: typeof window === 'undefined' ? 'light' : getInitialTheme(),

  setTheme: (theme) => {
    localStorage.setItem('shoezy_theme', theme);
    set({ theme });
  },

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('shoezy_theme', next);
      return { theme: next };
    }),
}));

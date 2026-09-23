'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useThemeStore } from '@/stores/theme-store';

/** Applies the selected theme and keeps System mode synced with the OS. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);
  const setResolvedTheme = useThemeStore((s) => s.setResolvedTheme);
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      const resolved = theme === 'system' ? (media.matches ? 'dark' : 'light') : theme;
      root.classList.toggle('dark', resolved === 'dark');
      root.style.colorScheme = resolved;
      root.dataset.theme = theme;
      setResolvedTheme(resolved);
    };

    applyTheme();
    if (theme !== 'system') return;
    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [setResolvedTheme, theme]);

  useEffect(() => {
    document.documentElement.dataset.appArea = pathname.startsWith('/admin') ? 'admin' : 'storefront';
  }, [pathname]);

  return <>{children}</>;
}

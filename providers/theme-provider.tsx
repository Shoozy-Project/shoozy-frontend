'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useThemeStore } from '@/stores/theme-store';

/**
 * Applies/removes the `dark` class on <html>.
 * Admin routes (/admin/*) always stay in light mode.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  useEffect(() => {
    const root = document.documentElement;
    if (isAdmin) {
      // Admin dashboard is always light
      root.classList.remove('dark');
    } else if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, isAdmin]);

  return <>{children}</>;
}

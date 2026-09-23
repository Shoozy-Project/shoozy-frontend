'use client';

import { useSyncExternalStore } from 'react';
import { Toaster } from 'sonner';
import { useThemeStore } from '@/stores/theme-store';

const subscribeToHydration = () => () => undefined;

export function ThemedToaster() {
  const mounted = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const theme = useThemeStore((state) => state.theme);

  return (
    <Toaster
      theme={mounted ? theme : 'system'}
      position="bottom-right"
      richColors
      toastOptions={{ style: { fontFamily: 'var(--font-sans)' } }}
    />
  );
}

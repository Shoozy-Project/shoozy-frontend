'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { registerAuthHandlers } from '@/lib/api/client';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 min default
        retry: (failureCount, error: unknown) => {
          // Don't retry on 4xx errors
          const status = (error as { response?: { status?: number } })?.response?.status;
          if (status && status >= 400 && status < 500) return false;
          return failureCount < 2;
        },
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === 'undefined') return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => getQueryClient());
  const initialized = useRef(false);
  const { setAuth, clearAuth, setInitialized, setLoading } = useAuthStore();

  // ─── Register axios interceptor handlers ───────────────────────
  useEffect(() => {
    registerAuthHandlers(
      () => useAuthStore.getState().accessToken,
      clearAuth,
    );
  }, [clearAuth]);

  // ─── Rehydrate session on mount via refresh cookie ─────────────
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Show splash loader while we resolve the session
    setLoading(true);

    (async () => {
      const { authApi } = await import('@/lib/api/auth');
      authApi
        .refresh()
        .then((res: { data: { data: { accessToken: string; user: unknown } } }) => {
          const { accessToken, user } = res.data.data;
          setAuth(accessToken, user as Parameters<typeof setAuth>[1]);
          // setAuth already sets isLoading: false
        })
        .catch(() => {
          // No valid session — user is not logged in.
          // This is the EXPECTED path in incognito / first visit.
          setInitialized();
          // setInitialized already sets isLoading: false
        });
    })();
  }, [setAuth, setInitialized, setLoading]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

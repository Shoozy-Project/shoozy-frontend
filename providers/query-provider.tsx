'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { registerAuthHandlers } from '@/lib/api/client';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 min default caching
        gcTime: 10 * 60 * 1000, // 10 min garbage collection time
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchInterval: false,
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

  // ─── Register axios interceptor handlers ───────────────────────
  useEffect(() => {
    registerAuthHandlers(
      () => useAuthStore.getState().accessToken,
      () => useAuthStore.getState().clearAuth(),
    );
  }, []);

  // ─── Rehydrate session on mount via refresh cookie ─────────────
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Show splash loader while we resolve the session
    useAuthStore.getState().setLoading(true);

    (async () => {
      const { authApi } = await import('@/lib/api/auth');
      authApi
        .refresh()
        .then((res: { data: { data: { accessToken: string; user: unknown } } }) => {
          const { accessToken, user } = res.data.data;
          useAuthStore.getState().setAuth(accessToken, user as any);
        })
        .catch(() => {
          // No valid session — user is not logged in.
          useAuthStore.getState().setInitialized();
        });
    })();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

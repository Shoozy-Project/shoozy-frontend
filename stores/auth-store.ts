'use client';

import { create } from 'zustand';
import type { UserDto } from '@/types/auth';

interface AuthState {
  /** JWT access token — stored in MEMORY only. Never localStorage. */
  accessToken: string | null;
  /** Current authenticated user */
  user: UserDto | null;
  /** True once we've attempted to rehydrate session on mount */
  isInitialized: boolean;
  /** True while an async auth operation is in progress (e.g. session rehydration) */
  isLoading: boolean;
}

interface AuthActions {
  /** Store access token + user after successful login/register/refresh */
  setAuth: (token: string, user: UserDto) => void;
  /** Clear all auth state (on logout or refresh failure) */
  clearAuth: () => void;
  /** Mark session rehydration as complete */
  setInitialized: () => void;
  /** Show or hide the global loading overlay */
  setLoading: (loading: boolean) => void;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  // ─── State ──────────────────────────────────────────
  accessToken: null,
  user: null,
  isInitialized: false,
  isLoading: true, // true on mount so splash shows during initial rehydration

  // ─── Actions ────────────────────────────────────────
  setAuth: (token, user) =>
    set({ accessToken: token, user, isInitialized: true, isLoading: false }),

  clearAuth: () =>
    set({ accessToken: null, user: null, isInitialized: true, isLoading: false }),

  setInitialized: () =>
    set({ isInitialized: true, isLoading: false }),

  setLoading: (loading) =>
    set({ isLoading: loading }),
}));

// ─── Selectors ──────────────────────────────────────────────────
export const selectIsAuthenticated = (s: AuthStore) => !!s.accessToken;
export const selectUser = (s: AuthStore) => s.user;
export const selectAccessToken = (s: AuthStore) => s.accessToken;
export const selectIsLoading = (s: AuthStore) => s.isLoading;

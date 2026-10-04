'use client';

import { create } from 'zustand';

const GUEST_SESSION_KEY = 'shoozy:guest-session';
const GUEST_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

interface CommerceState {
  guestSessionToken: string | null;
  isGuestSessionHydrated: boolean;
  hydrateGuestSession: () => void;
  setGuestSessionToken: (token: string) => void;
  clearGuestSession: () => void;
}

export const useCommerceStore = create<CommerceState>((set) => ({
  guestSessionToken: null,
  isGuestSessionHydrated: false,
  hydrateGuestSession: () => {
    const stored = typeof window === 'undefined' ? null : window.localStorage.getItem(GUEST_SESSION_KEY);
    if (stored && !GUEST_TOKEN_PATTERN.test(stored)) window.localStorage.removeItem(GUEST_SESSION_KEY);
    set({ guestSessionToken: stored && GUEST_TOKEN_PATTERN.test(stored) ? stored : null, isGuestSessionHydrated: true });
  },
  setGuestSessionToken: (token) => {
    if (!GUEST_TOKEN_PATTERN.test(token)) return;
    window.localStorage.setItem(GUEST_SESSION_KEY, token);
    set({ guestSessionToken: token, isGuestSessionHydrated: true });
  },
  clearGuestSession: () => {
    if (typeof window !== 'undefined') window.localStorage.removeItem(GUEST_SESSION_KEY);
    set({ guestSessionToken: null, isGuestSessionHydrated: true });
  },
}));

export function currentGuestSessionToken() {
  const current = useCommerceStore.getState().guestSessionToken;
  if (current || typeof window === 'undefined') return current;
  const stored = window.localStorage.getItem(GUEST_SESSION_KEY);
  if (!stored || !GUEST_TOKEN_PATTERN.test(stored)) return null;
  useCommerceStore.getState().setGuestSessionToken(stored);
  return stored;
}

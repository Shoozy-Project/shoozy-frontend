'use client';

import SplashScreen from '@/components/SplashScreen';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Client-side wrapper that reads `isLoading` from the auth store and passes it
 * to SplashScreen. This lives in a separate file because the root layout.tsx
 * must remain a Server Component.
 */
export default function SplashScreenWrapper() {
  const isLoading = useAuthStore((s) => s.isLoading);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  // Only force-show the splash while the initial auth rehydration is in progress.
  // Once isInitialized is true, never force the splash again — prevents flicker
  // on subsequent state transitions (e.g., logout setting isLoading briefly).
  return <SplashScreen forceShow={!isInitialized && isLoading} />;
}

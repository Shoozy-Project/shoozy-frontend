'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api/auth';
import { isAxiosError } from 'axios';

type State = 'loading' | 'success' | 'invalid' | 'expired' | 'used' | 'no-token';

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [state, setState] = useState<State>(token ? 'loading' : 'no-token');

  useEffect(() => {
    if (!token) return;

    authApi
      .verifyEmail(token)
      .then(() => setState('success'))
      .catch((err) => {
        if (isAxiosError(err)) {
          const code = err.response?.data?.error?.code;
          if (code === 'AUTH_TOKEN_EXPIRED') setState('expired');
          else if (code === 'AUTH_TOKEN_USED') setState('used');
          else setState('invalid');
        } else {
          setState('invalid');
        }
      });
  }, [token]);

  return (
    <div className="flex flex-col items-center text-center py-8 animate-fade-in">
      {state === 'loading' && (
        <>
          <Loader2 className="w-12 h-12 text-[#FF8C00] animate-spin mb-6" aria-hidden="true" />
          <h1 className="text-2xl font-serif font-bold text-[var(--text-primary)] mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            Verifying your email...
          </h1>
          <p className="text-sm text-[var(--text-muted)]">Please wait a moment.</p>
        </>
      )}

      {state === 'success' && (
        <>
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-success-light)] border-2 border-[#16a34a]">
            <CheckCircle className="w-10 h-10 text-[#16a34a]" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-[var(--text-primary)] mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
            Email Verified!
          </h1>
          <p className="text-sm text-[var(--text-muted)] mb-8">
            Your account is now active. You can sign in and start shopping.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-3 text-xs font-semibold tracking-widest uppercase bg-[var(--text-primary)] text-[var(--surface-primary)] hover:opacity-90 transition-opacity"
          >
            Sign In
          </Link>
        </>
      )}

      {(state === 'invalid' || state === 'no-token') && (
        <>
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-error-light)] border-2 border-[#dc2626]">
            <XCircle className="w-10 h-10 text-[#dc2626]" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-[var(--text-primary)] mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
            Invalid Link
          </h1>
          <p className="text-sm text-[var(--text-muted)] mb-8">
            This verification link is invalid or has expired.
          </p>
          <Link href="/login" className="text-sm font-semibold text-[var(--text-primary)] hover:text-[#FF8C00] transition-colors">
            ← Back to Login
          </Link>
        </>
      )}

      {state === 'expired' && (
        <>
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-warning-light)] border-2 border-[#f59e0b]">
            <XCircle className="w-10 h-10 text-[#f59e0b]" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-[var(--text-primary)] mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
            Link Expired
          </h1>
          <p className="text-sm text-[var(--text-muted)] mb-8">
            This verification link has expired. Request a new one below.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-3 text-xs font-semibold tracking-widest uppercase bg-[var(--text-primary)] text-[var(--surface-primary)] hover:opacity-90 transition-opacity"
          >
            Request New Link
          </Link>
        </>
      )}

      {state === 'used' && (
        <>
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-success-light)] border-2 border-[#16a34a]">
            <CheckCircle className="w-10 h-10 text-[#16a34a]" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-[var(--text-primary)] mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
            Already Verified
          </h1>
          <p className="text-sm text-[var(--text-muted)] mb-8">
            This link has already been used. Your account is active — go ahead and sign in.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-3 text-xs font-semibold tracking-widest uppercase bg-[var(--text-primary)] text-[var(--surface-primary)] hover:opacity-90 transition-opacity"
          >
            Sign In
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#FF8C00] animate-spin mb-3" aria-hidden="true" />
          <p className="text-sm text-[var(--text-muted)]">Loading email verification...</p>
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}

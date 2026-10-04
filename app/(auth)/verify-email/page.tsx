'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api/auth';
import { isAxiosError } from 'axios';
import { useTranslations } from '@/lib/hooks/use-translations';

type State = 'loading' | 'success' | 'invalid' | 'expired' | 'used' | 'no-token';

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [state, setState] = useState<State>(token ? 'loading' : 'no-token');
  const { t } = useTranslations();

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
            {t('auth.verifying')}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">{t('auth.wait')}</p>
        </>
      )}

      {state === 'success' && (
        <>
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-success-light)] border-2 border-[#16a34a]">
            <CheckCircle className="w-10 h-10 text-[#16a34a]" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-[var(--text-primary)] mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
            {t('auth.emailVerified')}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mb-8">
            {t('auth.emailVerifiedCopy')}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-3 text-xs font-semibold tracking-widest uppercase bg-[var(--text-primary)] text-[var(--surface-primary)] hover:opacity-90 transition-opacity"
          >
            {t('auth.signIn')}
          </Link>
        </>
      )}

      {(state === 'invalid' || state === 'no-token') && (
        <>
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-error-light)] border-2 border-[#dc2626]">
            <XCircle className="w-10 h-10 text-[#dc2626]" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-[var(--text-primary)] mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
            {t('auth.invalidLink')}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mb-8">
            {t('auth.verificationInvalidCopy')}
          </p>
          <Link href="/login" className="text-sm font-semibold text-[var(--text-primary)] hover:text-[#FF8C00] transition-colors">
            ← {t('auth.backLogin')}
          </Link>
        </>
      )}

      {state === 'expired' && (
        <>
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-warning-light)] border-2 border-[#f59e0b]">
            <XCircle className="w-10 h-10 text-[#f59e0b]" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-[var(--text-primary)] mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
            {t('auth.linkExpired')}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mb-8">
            {t('auth.verificationExpiredCopy')}
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-3 text-xs font-semibold tracking-widest uppercase bg-[var(--text-primary)] text-[var(--surface-primary)] hover:opacity-90 transition-opacity"
          >
            {t('auth.requestNew')}
          </Link>
        </>
      )}

      {state === 'used' && (
        <>
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-success-light)] border-2 border-[#16a34a]">
            <CheckCircle className="w-10 h-10 text-[#16a34a]" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-[var(--text-primary)] mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
            {t('auth.alreadyVerified')}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mb-8">
            {t('auth.alreadyVerifiedCopy')}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-3 text-xs font-semibold tracking-widest uppercase bg-[var(--text-primary)] text-[var(--surface-primary)] hover:opacity-90 transition-opacity"
          >
            {t('auth.signIn')}
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  const { t } = useTranslations();
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#FF8C00] animate-spin mb-3" aria-hidden="true" />
          <p className="text-sm text-[var(--text-muted)]">{t('auth.loadingVerification')}</p>
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}

'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle } from 'lucide-react';
import { authApi } from '@/lib/api/auth';
import { useTranslations } from '@/lib/hooks/use-translations';

const subscribeToLocation = () => () => undefined;
const getEmailFromLocation = () => new URLSearchParams(window.location.search).get('email') ?? '';

export default function RegisterSuccessPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resendError, setResendError] = useState<string | null>(null);
  const email = useSyncExternalStore(subscribeToLocation, getEmailFromLocation, () => '');
  const { t } = useTranslations();

  const handleResend = async () => {
    if (!email || loading || cooldown > 0) return;
    setLoading(true);
    setResendError(null);
    try {
      await authApi.resendVerification(email);
      setSent(true);
      let t = 60;
      setCooldown(t);
      const interval = setInterval(() => {
        t--;
        setCooldown(t);
        if (t <= 0) clearInterval(interval);
      }, 1000);
    } catch {
      setResendError(t('auth.resendFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-center py-8 animate-fade-in">
      {/* Icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-success-light)] border-2 border-[#16a34a]">
        <CheckCircle className="w-10 h-10 text-[#16a34a]" aria-hidden="true" />
      </div>

      {/* Heading */}
      <h1
        className="text-3xl font-serif font-bold text-[var(--text-primary)] mb-3"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        {t('auth.checkEmail')}
      </h1>

      <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-sm mb-8">
        {t('auth.checkEmailCopy')}
      </p>

      {/* Email visual */}
      <div className="flex items-center gap-3 p-4 bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-sm w-full max-w-sm mb-8">
        <Mail className="w-5 h-5 text-[var(--text-muted)] shrink-0" aria-hidden="true" />
        <p className="text-sm text-[var(--text-secondary)]">
          {t('auth.checkInbox')}
        </p>
      </div>

      {/* Resend */}
      {sent && (
        <p className="text-sm text-[#16a34a] font-medium mb-6">
          ✓ {t('auth.verificationSent')}
        </p>
      )}
      {resendError && <p className="text-sm text-red-600 font-medium mb-4">{resendError}</p>}
      <p className="text-sm text-[var(--text-muted)] mb-2">
          {t('auth.didNotReceive')}{' '}
          <button
            id="resend-verification-btn"
            type="button"
            onClick={handleResend}
            disabled={!email || loading || cooldown > 0}
            className="font-semibold text-[var(--text-primary)] hover:text-[#FF8C00] transition-colors underline-offset-2 hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? t('auth.sending')
              : cooldown > 0
                ? t('auth.resendIn', { seconds: cooldown })
                : t('auth.resendVerification')}
          </button>
        </p>

      {/* Back to Login */}
      <Link
        href="/login"
        className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[#FF8C00] transition-colors"
      >
        ← {t('auth.backLogin')}
      </Link>
    </div>
  );
}

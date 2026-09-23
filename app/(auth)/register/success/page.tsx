'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle } from 'lucide-react';
import { authApi } from '@/lib/api/auth';

const subscribeToLocation = () => () => undefined;
const getEmailFromLocation = () => new URLSearchParams(window.location.search).get('email') ?? '';

export default function RegisterSuccessPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resendError, setResendError] = useState<string | null>(null);
  const email = useSyncExternalStore(subscribeToLocation, getEmailFromLocation, () => '');

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
      setResendError('The verification email could not be resent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-center py-8 animate-fade-in">
      {/* Icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#f0fdf4] border-2 border-[#16a34a]">
        <CheckCircle className="w-10 h-10 text-[#16a34a]" aria-hidden="true" />
      </div>

      {/* Heading */}
      <h1
        className="text-3xl font-serif font-bold text-black mb-3"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        Check Your Email
      </h1>

      <p className="text-sm text-[#6b7280] leading-relaxed max-w-sm mb-8">
        We&apos;ve sent a verification link to your email address. Click the link to activate your
        Shoezy account and start shopping.
      </p>

      {/* Email visual */}
      <div className="flex items-center gap-3 p-4 bg-[#f9f9f9] border border-[#e5e5e5] rounded-sm w-full max-w-sm mb-8">
        <Mail className="w-5 h-5 text-[#6b7280] shrink-0" aria-hidden="true" />
        <p className="text-sm text-[#374151]">
          Check your inbox and spam folder for the verification email.
        </p>
      </div>

      {/* Resend */}
      {sent && (
        <p className="text-sm text-[#16a34a] font-medium mb-6">
          ✓ Verification email sent! Check your inbox.
        </p>
      )}
      {resendError && <p className="text-sm text-red-600 font-medium mb-4">{resendError}</p>}
      <p className="text-sm text-[#6b7280] mb-2">
          Didn&apos;t receive it?{' '}
          <button
            id="resend-verification-btn"
            type="button"
            onClick={handleResend}
            disabled={!email || loading || cooldown > 0}
            className="font-semibold text-black hover:text-[#FF8C00] transition-colors underline-offset-2 hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Sending...'
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : 'Resend verification email'}
          </button>
        </p>

      {/* Back to Login */}
      <Link
        href="/login"
        className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#374151] hover:text-black transition-colors"
      >
        ← Back to Login
      </Link>
    </div>
  );
}

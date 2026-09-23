'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/validations/auth';
import { authApi } from '@/lib/api/auth';

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      await authApi.forgotPassword(data.email);
    } finally {
      // Always show success (enumeration-safe — backend returns 202 regardless)
      setSubmittedEmail(data.email);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center py-8 animate-fade-in">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-gold-light)] border-2 border-[#FF8C00]">
          <Mail className="w-10 h-10 text-[#FF8C00]" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-[var(--text-primary)] mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
          Check Your Email
        </h1>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-sm mb-6">
          If an account exists for <strong className="text-[var(--text-primary)]">{submittedEmail}</strong>, you&apos;ll
          receive a password reset link shortly.
        </p>
        <p className="text-xs text-[var(--text-faint)] mb-8">
          Don&apos;t forget to check your spam folder.
        </p>
        <Link
          href="/login"
          className="text-sm font-semibold text-[var(--text-primary)] hover:text-[#FF8C00] transition-colors"
        >
          ← Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-serif font-bold text-[var(--text-primary)] tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
          Forgot Password?
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form
        id="forgot-password-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="forgot-email" className="text-xs font-semibold tracking-widest uppercase text-[var(--text-secondary)]">
            Email Address
          </label>
          <input
            id="forgot-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            aria-describedby={errors.email ? 'forgot-email-error' : undefined}
            aria-invalid={!!errors.email}
            className={`
              w-full px-0 py-3 text-sm bg-transparent border-b-2 text-[var(--text-primary)] placeholder:text-[var(--text-faint)]
              focus:outline-none transition-colors duration-200
              ${errors.email
                ? 'border-[#dc2626] focus:border-[#dc2626]'
                : 'border-[var(--border-primary)] focus:border-[var(--text-primary)]'
              }
            `}
            {...register('email')}
          />
          {errors.email && (
            <p id="forgot-email-error" role="alert" className="text-xs text-[#dc2626]">
              {errors.email.message}
            </p>
          )}
        </div>

        <button
          id="forgot-password-submit-btn"
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 text-xs font-semibold tracking-widest uppercase bg-[var(--text-primary)] text-[var(--surface-primary)] hover:opacity-90 transition-opacity duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting && (
            <span className="w-4 h-4 border-2 border-[var(--surface-primary)] border-t-transparent rounded-full animate-spin" />
          )}
          {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-[var(--text-muted)]">
        Remember your password?{' '}
        <Link href="/login" className="font-semibold text-[var(--text-primary)] hover:text-[#FF8C00] transition-colors">
          Sign In
        </Link>
      </p>
    </div>
  );
}

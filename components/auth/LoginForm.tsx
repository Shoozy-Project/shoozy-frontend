'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { loginSchema, type LoginInput } from '@/validations/auth';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/auth-store';
import PasswordInput from './PasswordInput';
import SocialAuthButtons from './SocialAuthButtons';
import { isAxiosError } from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { adminCapabilityQueryOptions } from '@/lib/hooks/use-admin-capability';

export default function LoginForm({ redirectTo = '/' }: { redirectTo?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setAuth } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);
  const [verificationNeeded, setVerificationNeeded] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    setVerificationNeeded(false);

    try {
      const res = await authApi.login({ email: data.email, password: data.password });
      const { user, accessToken } = res.data.data;

      // Store in Zustand (memory only)
      setAuth(accessToken, user);

      try {
        await queryClient.fetchQuery(adminCapabilityQueryOptions(user.id));
        router.push('/admin');
      } catch (capabilityError) {
        if (isAxiosError(capabilityError)) {
          if (capabilityError.response?.status === 401) {
            useAuthStore.getState().clearAuth();
            setServerError('Your session could not be verified. Please sign in again.');
            return;
          }
          if (capabilityError.response?.status === 403) {
            router.push(redirectTo);
            return;
          }
        }
        setServerError('Signed in, but the admin access check is currently unavailable. Please try again.');
      }
    } catch (err) {
      if (isAxiosError(err)) {
        const code = err.response?.data?.error?.code;
        switch (code) {
          case 'AUTH_INVALID_CREDENTIALS':
            setServerError('Incorrect email or password. Please try again.');
            break;
          case 'AUTH_EMAIL_NOT_VERIFIED':
            setVerificationNeeded(true);
            setVerificationEmail(data.email);
            break;
          case 'AUTH_ACCOUNT_INACTIVE':
            setServerError('This account has been deactivated. Please contact support.');
            break;
          case 'AUTH_RATE_LIMITED':
            setServerError('Too many attempts. Please try again later.');
            break;
          default:
            setServerError('Something went wrong. Please try again.');
        }
      } else {
        setServerError('Network error. Please check your connection and try again.');
      }
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Heading */}
      <div className="mb-8">
        <h1
          className="text-3xl lg:text-4xl font-serif font-bold text-[var(--text-primary)] tracking-tight"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Welcome Back
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Sign in to access your Shoezy account.
        </p>
      </div>

      {/* Social Auth */}
      <SocialAuthButtons action="login" />

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border-primary)]" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-[var(--surface-primary)] text-xs text-[var(--text-faint)] tracking-widest uppercase">
            or sign in with email
          </span>
        </div>
      </div>

      {/* Server Error Banner */}
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-3 p-4 mb-5 bg-[var(--color-error-light)] border border-[#fecaca] dark:border-[#5c2020] rounded-sm animate-fade-in"
        >
          <AlertCircle className="w-4 h-4 text-[#dc2626] shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-[#dc2626]">{serverError}</p>
        </div>
      )}

      {/* Email Verification Needed Banner */}
      {verificationNeeded && (
        <div
          role="alert"
          className="flex flex-col gap-2 p-4 mb-5 bg-[var(--color-warning-light)] border border-[#fde68a] dark:border-[#5c4a10] rounded-sm animate-fade-in"
        >
          <p className="text-sm text-[#92400e] dark:text-[#fbbf24] font-medium">
            Please verify your email before signing in.
          </p>
          <ResendVerification email={verificationEmail} />
        </div>
      )}

      {/* Login Form */}
      <form
        id="login-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-6"
      >
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="login-email"
            className="text-xs font-semibold tracking-widest uppercase text-[var(--text-secondary)]"
          >
            Email Address
          </label>
          <input
            id="login-email"
            type="email"
            placeholder="ahmed@gmail.com"
            autoComplete="email"
            aria-describedby={errors.email ? 'login-email-error' : undefined}
            aria-invalid={!!errors.email}
            className={`
              w-full px-0 py-3 text-sm bg-transparent border-b-2 text-[var(--text-primary)] placeholder-[var(--text-faint)]
              focus:outline-none transition-colors duration-200
              ${errors.email
                ? 'border-[#dc2626] focus:border-[#dc2626]'
                : 'border-[var(--border-primary)] focus:border-[var(--text-primary)]'
              }
            `}
            {...register('email')}
          />
          {errors.email && (
            <p id="login-email-error" role="alert" className="text-xs text-[#dc2626] mt-0.5">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <PasswordInput
          id="login-password"
          label="Password"
          registration={register('password')}
          error={errors.password?.message}
          autoComplete="current-password"
        />

        {/* Remember Me + Forgot Password */}
        <div className="flex items-center justify-between">
          <label htmlFor="login-remember" className="flex items-center gap-2 cursor-pointer group">
            <input
              id="login-remember"
              type="checkbox"
              className="w-3.5 h-3.5 border-[var(--border-primary)] accent-[var(--text-primary)]"
              {...register('rememberMe')}
            />
            <span className="text-xs text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
              Remember Me
            </span>
          </label>
          <Link
            href="/forgot-password"
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] underline-offset-2 hover:underline transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit */}
        <button
          id="login-submit-btn"
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 text-xs font-semibold tracking-widest uppercase bg-[var(--text-primary)] text-[var(--surface-primary)] hover:opacity-90 active:opacity-80 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting && (
            <span className="w-4 h-4 border-2 border-[var(--surface-primary)] border-t-transparent rounded-full animate-spin" />
          )}
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      {/* Register Link */}
      <p className="mt-8 text-center text-sm text-[var(--text-muted)]">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="font-semibold text-[var(--text-primary)] hover:text-[#FF8C00] transition-colors underline-offset-2 hover:underline"
        >
          Join Shoezy
        </Link>
      </p>
    </div>
  );
}

// ── Inline helper: resend verification ──────────────────────────
function ResendVerification({ email }: { email: string }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleResend = async () => {
    if (loading || cooldown > 0) return;
    setLoading(true);
    try {
      await authApi.resendVerification(email);
      setSent(true);
      // 60s cooldown
      let t = 60;
      setCooldown(t);
      const interval = setInterval(() => {
        t--;
        setCooldown(t);
        if (t <= 0) clearInterval(interval);
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return <p className="text-xs text-[#92400e] dark:text-[#fbbf24]">Verification email sent! Check your inbox.</p>;
  }

  return (
    <button
      type="button"
      onClick={handleResend}
      disabled={loading || cooldown > 0}
      className="text-xs text-[#92400e] dark:text-[#fbbf24] font-semibold underline underline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend verification email →'}
    </button>
  );
}

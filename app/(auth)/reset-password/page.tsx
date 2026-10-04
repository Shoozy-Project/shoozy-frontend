'use client';

import { Suspense, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { createResetPasswordSchema, type ResetPasswordInput } from '@/validations/auth';
import { authApi } from '@/lib/api/auth';
import PasswordInput from '@/components/auth/PasswordInput';
import PasswordStrengthBar from '@/components/auth/PasswordStrengthBar';
import { isAxiosError } from 'axios';
import { useTranslations } from '@/lib/hooks/use-translations';

type State = 'form' | 'success' | 'invalid' | 'expired' | 'used';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [state, setState] = useState<State>(token ? 'form' : 'invalid');
  const [serverError, setServerError] = useState<string | null>(null);
  const { locale, t } = useTranslations();
  const resetPasswordSchema = useMemo(() => createResetPasswordSchema(locale), [locale]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const newPasswordValue = useWatch({ control, name: 'newPassword' }) ?? '';

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) return;
    setServerError(null);

    try {
      await authApi.resetPassword({ token, newPassword: data.newPassword });
      setState('success');
    } catch (err) {
      if (isAxiosError(err)) {
        const code = err.response?.data?.error?.code;
        if (code === 'AUTH_TOKEN_EXPIRED') setState('expired');
        else if (code === 'AUTH_TOKEN_USED') setState('used');
        else if (code === 'TOKEN_INVALID') setState('invalid');
        else setServerError(t('auth.genericError'));
      } else {
        setServerError(t('auth.networkError'));
      }
    }
  };

  if (state === 'success') {
    return (
      <div className="flex flex-col items-center text-center py-8 animate-fade-in">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-success-light)] border-2 border-[#16a34a]">
          <CheckCircle className="w-10 h-10 text-[#16a34a]" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-[var(--text-primary)] mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
          {t('auth.passwordUpdated')}
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-8">
          {t('auth.passwordUpdatedCopy')}
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center px-8 py-3 text-xs font-semibold tracking-widest uppercase bg-[var(--text-primary)] text-[var(--surface-primary)] hover:opacity-90 transition-opacity"
        >
          {t('auth.signIn')}
        </Link>
      </div>
    );
  }

  if (state === 'invalid' || state === 'expired' || state === 'used') {
    return (
      <div className="flex flex-col items-center text-center py-8 animate-fade-in">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-error-light)] border-2 border-[#dc2626]">
          <XCircle className="w-10 h-10 text-[#dc2626]" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-[var(--text-primary)] mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
          {state === 'used' ? t('auth.alreadyUsed') : state === 'expired' ? t('auth.linkExpired') : t('auth.invalidLink')}
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-8">
          {state === 'used'
            ? t('auth.resetUsedCopy')
            : state === 'expired'
              ? t('auth.resetExpiredCopy')
              : t('auth.resetInvalidCopy')}
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center justify-center px-8 py-3 text-xs font-semibold tracking-widest uppercase bg-[var(--text-primary)] text-[var(--surface-primary)] hover:opacity-90 transition-opacity"
        >
          {t('auth.requestNew')}
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-serif font-bold text-[var(--text-primary)] tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
          {t('auth.setPassword')}
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          {t('auth.setPasswordCopy')}
        </p>
      </div>

      {serverError && (
        <div role="alert" className="flex items-start gap-3 p-4 mb-5 bg-[var(--color-error-light)] border border-[#fecaca] dark:border-[#5c2020] rounded-sm animate-fade-in">
          <AlertCircle className="w-4 h-4 text-[#dc2626] shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-[#dc2626]">{serverError}</p>
        </div>
      )}

      <form
        id="reset-password-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-6"
      >
        <div>
          <PasswordInput
            id="reset-new-password"
            label={t('auth.newPassword')}
            registration={register('newPassword')}
            error={errors.newPassword?.message}
            placeholder={t('auth.passwordHint')}
            autoComplete="new-password"
          />
          <PasswordStrengthBar password={newPasswordValue} />
        </div>

        <PasswordInput
          id="reset-confirm-password"
          label={t('auth.confirmNewPassword')}
          registration={register('confirmPassword')}
          error={errors.confirmPassword?.message}
          placeholder={t('auth.passwordAgain')}
          autoComplete="new-password"
        />

        <button
          id="reset-password-submit-btn"
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 text-xs font-semibold tracking-widest uppercase bg-[var(--text-primary)] text-[var(--surface-primary)] hover:opacity-90 transition-opacity duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting && (
            <span className="w-4 h-4 border-2 border-[var(--surface-primary)] border-t-transparent rounded-full animate-spin" />
          )}
          {isSubmitting ? t('auth.updating') : t('auth.updatePassword')}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  const { t } = useTranslations();
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#FF8C00] animate-spin mb-3" aria-hidden="true" />
          <p className="text-sm text-[var(--text-muted)]">{t('auth.loadingReset')}</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

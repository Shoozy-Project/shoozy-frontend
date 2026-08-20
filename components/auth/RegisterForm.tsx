'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { registerSchema, type RegisterInput } from '@/validations/auth';
import { authApi } from '@/lib/api/auth';
import PasswordInput from './PasswordInput';
import PasswordStrengthBar from './PasswordStrengthBar';
import GenderToggle from './GenderToggle';
import SocialAuthButtons from './SocialAuthButtons';
import { isAxiosError } from 'axios';
import { GOVERNORATES } from '@/lib/constants';

export default function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch('password') ?? '';

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);

    try {
      const res = await authApi.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || undefined,
      });

      const responseData = res.data.data;

      // Role-based redirect: admins go to dashboard, customers to success page
      // Note: requires backend to include `role` in the register response.
      if (responseData.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/register/success');
      }
    } catch (err) {
      if (isAxiosError(err)) {
        const code = err.response?.data?.error?.code;
        const details = err.response?.data?.error?.details ?? [];

        switch (code) {
          case 'DUPLICATE_EMAIL':
            setError('email', { message: 'This email is already registered.' });
            break;
          case 'DUPLICATE_PHONE':
            setError('phone', { message: 'This phone number is already in use.' });
            break;
          default:
            if (details.length > 0) {
              details.forEach(({ field, message }: { field: string; message: string }) => {
                setError(field as keyof RegisterInput, { message });
              });
            } else {
              setServerError('Something went wrong. Please try again.');
            }
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
          Create Your Account
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Join Shoezy for an exclusive luxury experience.
        </p>
      </div>

      {/* Social Auth */}
      <SocialAuthButtons action="register" />

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border-primary)]" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-[var(--surface-primary)] text-xs text-[var(--text-faint)] tracking-widest uppercase">
            or register with email
          </span>
        </div>
      </div>

      {/* Server Error */}
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-3 p-4 mb-5 bg-[var(--color-error-light)] border border-[#fecaca] dark:border-[#5c2020] rounded-sm animate-fade-in"
        >
          <AlertCircle className="w-4 h-4 text-[#dc2626] shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-[#dc2626]">{serverError}</p>
        </div>
      )}

      <form
        id="register-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-5"
      >
        {/* Gender Toggle */}
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <GenderToggle
              value={field.value}
              onChange={field.onChange}
              error={errors.gender?.message}
            />
          )}
        />

        {/* First Name + Last Name */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="register-first-name"
              className="text-xs font-semibold tracking-widest uppercase text-[var(--text-secondary)]"
            >
              First Name
            </label>
            <input
              id="register-first-name"
              type="text"
              placeholder="John"
              autoComplete="given-name"
              aria-describedby={errors.firstName ? 'register-first-name-error' : undefined}
              aria-invalid={!!errors.firstName}
              className={`
                w-full px-0 py-3 text-sm bg-transparent border-b-2 text-[var(--text-primary)] placeholder-[var(--text-faint)]
                focus:outline-none transition-colors duration-200
                ${errors.firstName
                  ? 'border-[#dc2626] focus:border-[#dc2626]'
                  : 'border-[var(--border-primary)] focus:border-[var(--text-primary)]'
                }
              `}
              {...register('firstName')}
            />
            {errors.firstName && (
              <p id="register-first-name-error" role="alert" className="text-xs text-[#dc2626]">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="register-last-name"
              className="text-xs font-semibold tracking-widest uppercase text-[var(--text-secondary)]"
            >
              Last Name
            </label>
            <input
              id="register-last-name"
              type="text"
              placeholder="Doe"
              autoComplete="family-name"
              aria-describedby={errors.lastName ? 'register-last-name-error' : undefined}
              aria-invalid={!!errors.lastName}
              className={`
                w-full px-0 py-3 text-sm bg-transparent border-b-2 text-[var(--text-primary)] placeholder-[var(--text-faint)]
                focus:outline-none transition-colors duration-200
                ${errors.lastName
                  ? 'border-[#dc2626] focus:border-[#dc2626]'
                  : 'border-[var(--border-primary)] focus:border-[var(--text-primary)]'
                }
              `}
              {...register('lastName')}
            />
            {errors.lastName && (
              <p id="register-last-name-error" role="alert" className="text-xs text-[#dc2626]">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="register-email"
            className="text-xs font-semibold tracking-widest uppercase text-[var(--text-secondary)]"
          >
            Email Address
          </label>
          <input
            id="register-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            aria-describedby={errors.email ? 'register-email-error' : undefined}
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
            <p id="register-email-error" role="alert" className="text-xs text-[#dc2626]">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Phone (Optional) */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="register-phone"
            className="text-xs font-semibold tracking-widest uppercase text-[var(--text-secondary)]"
          >
            Phone{' '}
            <span className="text-[var(--text-faint)] normal-case font-normal">(Optional)</span>
          </label>
          <input
            id="register-phone"
            type="tel"
            placeholder="+216 12 345 678"
            autoComplete="tel"
            aria-describedby={errors.phone ? 'register-phone-error' : undefined}
            aria-invalid={!!errors.phone}
            className={`
              w-full px-0 py-3 text-sm bg-transparent border-b-2 text-[var(--text-primary)] placeholder-[var(--text-faint)]
              focus:outline-none transition-colors duration-200
              ${errors.phone
                ? 'border-[#dc2626] focus:border-[#dc2626]'
                : 'border-[var(--border-primary)] focus:border-[var(--text-primary)]'
              }
            `}
            {...register('phone')}
          />
          {errors.phone && (
            <p id="register-phone-error" role="alert" className="text-xs text-[#dc2626]">
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Governorate */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="register-governorate"
            className="text-xs font-semibold tracking-widest uppercase text-[var(--text-secondary)]"
          >
            Governorate
          </label>
          <select
            id="register-governorate"
            aria-describedby={errors.governorate ? 'register-governorate-error' : undefined}
            aria-invalid={!!errors.governorate}
            className={`
              w-full px-0 py-3 text-sm bg-transparent border-b-2 text-[var(--text-primary)]
              focus:outline-none transition-colors duration-200 cursor-pointer
              ${errors.governorate
                ? 'border-[#dc2626] focus:border-[#dc2626]'
                : 'border-[var(--border-primary)] focus:border-[var(--text-primary)]'
              }
            `}
            {...register('governorate')}
          >
            <option value="">Select your governorate</option>
            {GOVERNORATES.map((g) => (
              <option key={g.code} value={g.code}>
                {g.name}
              </option>
            ))}
          </select>
          {errors.governorate && (
            <p id="register-governorate-error" role="alert" className="text-xs text-[#dc2626]">
              {errors.governorate.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <PasswordInput
            id="register-password"
            label="Password"
            registration={register('password')}
            error={errors.password?.message}
            placeholder="Minimum 12 characters"
            autoComplete="new-password"
          />
          <PasswordStrengthBar password={passwordValue} />
        </div>

        {/* Confirm Password */}
        <PasswordInput
          id="register-confirm-password"
          label="Confirm Password"
          registration={register('confirmPassword')}
          error={errors.confirmPassword?.message}
          placeholder="Re-enter your password"
          autoComplete="new-password"
        />

        {/* Terms note */}
        <p className="text-xs text-[var(--text-faint)] leading-relaxed">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-[var(--text-primary)] hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-[var(--text-primary)] hover:underline">
            Privacy Policy
          </Link>
          .
        </p>

        {/* Submit */}
        <button
          id="register-submit-btn"
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 text-xs font-semibold tracking-widest uppercase bg-[var(--text-primary)] text-[var(--surface-primary)] hover:opacity-90 active:opacity-80 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {isSubmitting && (
            <span className="w-4 h-4 border-2 border-[var(--surface-primary)] border-t-transparent rounded-full animate-spin" />
          )}
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      {/* Sign In Link */}
      <p className="mt-8 text-center text-sm text-[var(--text-muted)]">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-semibold text-[var(--text-primary)] hover:text-[#FF8C00] transition-colors underline-offset-2 hover:underline"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}

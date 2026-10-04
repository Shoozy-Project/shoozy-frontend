import { z } from 'zod';
import type { Locale } from '@/lib/i18n';
import { translate } from '@/lib/messages';

const m = (locale: Locale, key: string) => translate(locale, key);

// ─── Login ─────────────────────────────────────────────────────
export const createLoginSchema = (locale: Locale = 'en') => z.object({
  email: z
    .string()
    .min(1, m(locale, 'validation.emailRequired'))
    .email(m(locale, 'validation.emailInvalid')),
  password: z.string().min(1, m(locale, 'validation.passwordRequired')),
  rememberMe: z.boolean().optional(),
});

// ─── Register ──────────────────────────────────────────────────
export const createRegisterSchema = (locale: Locale = 'en') => z
  .object({
    firstName: z
      .string()
      .min(1, m(locale, 'validation.firstNameRequired'))
      .max(100, m(locale, 'validation.firstNameMax')),
    lastName: z
      .string()
      .min(1, m(locale, 'validation.lastNameRequired'))
      .max(100, m(locale, 'validation.lastNameMax')),
    email: z
      .string()
      .min(1, m(locale, 'validation.emailRequired'))
      .email(m(locale, 'validation.emailInvalid')),
    phone: z
      .string()
      .min(7, m(locale, 'validation.phoneShort'))
      .max(32, m(locale, 'validation.phoneLong'))
      .optional()
      .or(z.literal(''))
      .transform((v) => (v === '' ? undefined : v)),
    password: z
      .string()
      .min(12, m(locale, 'validation.passwordMin'))
      .max(72, m(locale, 'validation.passwordMax')),
    confirmPassword: z.string().min(1, m(locale, 'validation.passwordConfirm')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: m(locale, 'validation.passwordMatch'),
    path: ['confirmPassword'],
  });

// ─── Forgot Password ───────────────────────────────────────────
export const createForgotPasswordSchema = (locale: Locale = 'en') => z.object({
  email: z
    .string()
    .min(1, m(locale, 'validation.emailRequired'))
    .email(m(locale, 'validation.emailInvalid')),
});

// ─── Reset Password ────────────────────────────────────────────
export const createResetPasswordSchema = (locale: Locale = 'en') => z
  .object({
    newPassword: z
      .string()
      .min(12, m(locale, 'validation.passwordMin'))
      .max(72, m(locale, 'validation.passwordMax')),
    confirmPassword: z.string().min(1, m(locale, 'validation.passwordConfirm')),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: m(locale, 'validation.passwordMatch'),
    path: ['confirmPassword'],
  });

// ─── Inferred Types ────────────────────────────────────────────
export const loginSchema = createLoginSchema();
export const registerSchema = createRegisterSchema();
export const forgotPasswordSchema = createForgotPasswordSchema();
export const resetPasswordSchema = createResetPasswordSchema();
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

import { z } from 'zod';

// ─── Login ─────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

// ─── Register ──────────────────────────────────────────────────
export const registerSchema = z
  .object({
    gender: z.enum(['male', 'female'], {
      required_error: 'Please select your gender',
      invalid_type_error: 'Please select your gender',
    }),
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(100, 'First name must be under 100 characters'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(100, 'Last name must be under 100 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    phone: z
      .string()
      .min(7, 'Phone number is too short')
      .max(32, 'Phone number is too long')
      .optional()
      .or(z.literal(''))
      .transform((v) => (v === '' ? undefined : v)),
    governorate: z.string().min(1, 'Please select your governorate'),
    password: z
      .string()
      .min(12, 'Password must be at least 12 characters')
      .max(72, 'Password is too long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ─── Forgot Password ───────────────────────────────────────────
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

// ─── Reset Password ────────────────────────────────────────────
export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(12, 'Password must be at least 12 characters')
      .max(72, 'Password is too long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ─── Inferred Types ────────────────────────────────────────────
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

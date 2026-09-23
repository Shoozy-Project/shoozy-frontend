import apiClient from './client';
import type { ApiSuccess } from '@/types/api';
import type { LoginResponseData, RegisterResponseData, UserDto } from '@/types/auth';

// ─── Auth API ──────────────────────────────────────────────────
export const authApi = {
  /** POST /auth/register */
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) =>
    apiClient.post<ApiSuccess<RegisterResponseData>>('/auth/register', data),

  /** POST /auth/login */
  login: (data: { email: string; password: string }) =>
    apiClient.post<ApiSuccess<LoginResponseData>>('/auth/login', data),

  /** POST /auth/refresh — cookie sent automatically */
  refresh: () =>
    apiClient.post<ApiSuccess<LoginResponseData>>('/auth/refresh'),

  /** POST /auth/logout — requires Bearer token */
  logout: () =>
    apiClient.post<ApiSuccess<{ loggedOut: boolean }>>('/auth/logout', undefined, {
      withCredentials: true,
    }),

  /** POST /auth/logout-all — requires Bearer token */
  logoutAll: () =>
    apiClient.post<ApiSuccess<{ loggedOut: boolean }>>('/auth/logout-all'),

  /** POST /auth/verify-email */
  verifyEmail: (token: string) =>
    apiClient.post<ApiSuccess<{ user: UserDto; verified: boolean }>>('/auth/verify-email', { token }),

  /** POST /auth/resend-verification */
  resendVerification: (email: string) =>
    apiClient.post<ApiSuccess<{ accepted: true }>>('/auth/resend-verification', { email }),

  /** POST /auth/forgot-password — always 202 */
  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),

  /** POST /auth/reset-password */
  resetPassword: (data: { token: string; newPassword: string }) =>
    apiClient.post<ApiSuccess<{ passwordReset: boolean }>>('/auth/reset-password', data),

  /** POST /auth/change-password — requires Bearer + profile.update.own */
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.post<ApiSuccess<{ passwordChanged: boolean }>>('/auth/change-password', data),

  /** POST /auth/google */
  googleAuth: (idToken: string) =>
    apiClient.post<ApiSuccess<LoginResponseData>>('/auth/google', { idToken }),

  /** POST /auth/facebook */
  facebookAuth: (accessToken: string) =>
    apiClient.post<ApiSuccess<LoginResponseData>>('/auth/facebook', { accessToken }),
};

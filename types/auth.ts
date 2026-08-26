// ─── User DTO ──────────────────────────────────────────────────
export interface UserDto {
  id: string;
  email: string;
  phone: string | null;
  firstName: string;
  lastName: string;
  status: 'ACTIVE' | 'INACTIVE';
  provider: 'EMAIL' | 'GOOGLE' | 'FACEBOOK';
  role: 'ADMIN' | 'CUSTOMER' | 'SUPER_ADMIN'; // Used for redirect routing and RBAC access checks
  emailVerifiedAt: string | null;
  phoneVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Auth API Response Shapes ──────────────────────────────────
export interface LoginResponseData {
  user: UserDto;
  accessToken: string;
}

export interface RegisterResponseData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  provider: string;
  emailVerifiedAt: string | null;
  /** Included by backend so client can route admin users to the dashboard */
  role?: 'ADMIN' | 'CUSTOMER' | 'SUPER_ADMIN';
}

// ─── Form Input Types (used with react-hook-form) ──────────────
export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterInput {
  gender: 'male' | 'female';
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  newPassword: string;
  confirmPassword: string;
}

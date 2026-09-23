// ─── User DTO ──────────────────────────────────────────────────
export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  provider: 'EMAIL' | 'GOOGLE' | 'FACEBOOK';
  emailVerifiedAt: string | null;
}

// ─── Auth API Response Shapes ──────────────────────────────────
export interface LoginResponseData {
  user: UserDto;
  accessToken: string;
}

export interface RegisterResponseData {
  user: UserDto;
  verificationRequired: boolean;
}

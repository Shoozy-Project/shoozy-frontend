// ─── Admin Users Types ───────────────────────────────────────────

export type UserRoleType = 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
export type UserStatusType = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: UserRoleType;
  status: UserStatusType;
  governorate: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    orders: number;
  };
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRoleType;
  status?: UserStatusType;
  governorate?: string;
  sortBy?: 'firstName' | 'lastName' | 'email' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
  role?: UserRoleType;
  status?: UserStatusType;
  governorate?: string;
}

export interface ToggleUserStatusPayload {
  status: UserStatusType;
}

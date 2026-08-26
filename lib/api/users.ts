import apiClient from './client';
import type { ApiSuccess, PaginatedData } from '@/types/api';
import type {
  UserDto,
  UserListParams,
  UpdateUserPayload,
  ToggleUserStatusPayload,
} from '@/types/user';

export const adminUsersApi = {
  /** GET /admin/users — paginated list with search & filters */
  list: (params: UserListParams = {}) =>
    apiClient.get<ApiSuccess<PaginatedData<UserDto>>>('/admin/users', { params }),

  /** GET /admin/users/:id */
  getById: (id: string) =>
    apiClient.get<ApiSuccess<UserDto>>(`/admin/users/${id}`),

  /** PATCH /admin/users/:id — update profile, role, status, governorate */
  update: (id: string, data: UpdateUserPayload) =>
    apiClient.patch<ApiSuccess<UserDto>>(`/admin/users/${id}`, data),

  /** PATCH /admin/users/:id/status — suspend / activate user account */
  toggleStatus: (id: string, data: ToggleUserStatusPayload) =>
    apiClient.patch<ApiSuccess<UserDto>>(`/admin/users/${id}/status`, data),
};

import apiClient from './client';
import type { ApiSuccess, PaginatedData } from '@/types/api';
import type {
  CollectionDetailDto,
  CollectionDto,
  CollectionListParams,
  CreateCollectionPayload,
  UpdateCollectionPayload,
} from '@/types/collection';

export const collectionsApi = {
  /** GET /admin/collections — paginated list with search/filter */
  list: (params: CollectionListParams = {}) =>
    apiClient.get<ApiSuccess<PaginatedData<CollectionDto>>>('/admin/collections', { params }),

  /** GET /admin/collections/:id */
  getById: (id: string) =>
    apiClient.get<ApiSuccess<CollectionDetailDto>>(`/admin/collections/${id}`),

  /** POST /admin/collections */
  create: (data: CreateCollectionPayload) =>
    apiClient.post<ApiSuccess<CollectionDto>>('/admin/collections', data),

  /** PATCH /admin/collections/:id */
  update: (id: string, data: UpdateCollectionPayload) =>
    apiClient.patch<ApiSuccess<CollectionDto>>(`/admin/collections/${id}`, data),

  /** DELETE /admin/collections/:id → 204 No Content */
  delete: (id: string) =>
    apiClient.delete(`/admin/collections/${id}`),

  /** PATCH /admin/collections/:id — toggle isActive status */
  toggleStatus: (id: string, isActive: boolean) =>
    apiClient.patch<ApiSuccess<CollectionDto>>(`/admin/collections/${id}`, { isActive }),

};

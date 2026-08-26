import apiClient from './client';
import type { ApiSuccess, PaginatedData } from '@/types/api';
import type {
  BrandDto,
  BrandListParams,
  CreateBrandPayload,
  UpdateBrandPayload,
} from '@/types/brand';

export const brandsApi = {
  /** GET /admin/brands — paginated list with search/filter */
  list: (params: BrandListParams = {}) =>
    apiClient.get<ApiSuccess<PaginatedData<BrandDto>>>('/admin/brands', { params }),

  /** GET /admin/brands/:id */
  getById: (id: string) =>
    apiClient.get<ApiSuccess<BrandDto>>(`/admin/brands/${id}`),

  /** POST /admin/brands */
  create: (data: CreateBrandPayload) =>
    apiClient.post<ApiSuccess<BrandDto>>('/admin/brands', data),

  /** PATCH /admin/brands/:id */
  update: (id: string, data: UpdateBrandPayload) =>
    apiClient.patch<ApiSuccess<BrandDto>>(`/admin/brands/${id}`, data),

  /** DELETE /admin/brands/:id → 204 No Content */
  delete: (id: string) =>
    apiClient.delete(`/admin/brands/${id}`),

  /** PATCH /admin/brands/:id — toggle isActive status */
  toggleStatus: (id: string, isActive: boolean) =>
    apiClient.patch<ApiSuccess<BrandDto>>(`/admin/brands/${id}`, { isActive }),

  /** GET /admin/brands — fetch active brands (for product forms) */
  listActive: () =>
    apiClient.get<ApiSuccess<PaginatedData<BrandDto>>>('/admin/brands', {
      params: { isActive: true, limit: 100, sortBy: 'name', sortOrder: 'asc' },
    }),

  /**
   * POST /admin/upload/image
   * Upload brand logo file from device. Returns public URL.
   */
  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post<ApiSuccess<{ url: string; filename: string; size: number; mimetype: string }>>(
      '/admin/upload/image',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  },
};

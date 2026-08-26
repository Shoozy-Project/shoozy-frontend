import apiClient from './client';
import type { ApiSuccess, PaginatedData } from '@/types/api';
import type {
  CategoryDto,
  CategoryListParams,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '@/types/category';

export const categoriesApi = {
  /** GET /admin/categories — paginated list with search/filter */
  list: (params: CategoryListParams = {}) =>
    apiClient.get<ApiSuccess<PaginatedData<CategoryDto>>>('/admin/categories', { params }),

  /** GET /admin/categories/:id */
  getById: (id: string) =>
    apiClient.get<ApiSuccess<CategoryDto>>(`/admin/categories/${id}`),

  /** POST /admin/categories */
  create: (data: CreateCategoryPayload) =>
    apiClient.post<ApiSuccess<CategoryDto>>('/admin/categories', data),

  /** PATCH /admin/categories/:id */
  update: (id: string, data: UpdateCategoryPayload) =>
    apiClient.patch<ApiSuccess<CategoryDto>>(`/admin/categories/${id}`, data),

  /** DELETE /admin/categories/:id → 204 No Content */
  delete: (id: string) =>
    apiClient.delete(`/admin/categories/${id}`),

  /** PATCH /admin/categories/:id — toggle isActive only */
  toggleStatus: (id: string, isActive: boolean) =>
    apiClient.patch<ApiSuccess<CategoryDto>>(`/admin/categories/${id}`, { isActive }),

  /** GET /admin/categories — fetch only active categories (for product forms) */
  listActive: () =>
    apiClient.get<ApiSuccess<PaginatedData<CategoryDto>>>('/admin/categories', {
      params: { isActive: true, limit: 100, sortBy: 'name', sortOrder: 'asc' },
    }),

  /**
   * POST /admin/upload/image
   * Upload an image file from the user's device.
   * Returns { url: string } — the public URL to store in imageUrl field.
   */
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post<ApiSuccess<{ url: string; filename: string; size: number; mimetype: string }>>(
      '/admin/upload/image',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  },
};


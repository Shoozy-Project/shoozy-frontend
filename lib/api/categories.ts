import apiClient from './client';
import type { ApiSuccess, PaginatedData } from '@/types/api';
import type {
  CategoryDto,
  CategoryListParams,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '@/types/category';

/**
 * Serialise a category payload into either a plain object (JSON) or a
 * FormData (multipart/form-data) when an image File is attached.
 */
function buildBody(
  data: CreateCategoryPayload | UpdateCategoryPayload,
  imageFile?: File | null,
): CreateCategoryPayload | UpdateCategoryPayload | FormData {
  if (!imageFile) return data;

  const formData = new FormData();
  formData.append('data', JSON.stringify(data));
  formData.append('image', imageFile);
  return formData;
}

export const categoriesApi = {
  /** GET /admin/categories — paginated list with search/filter */
  list: (params: CategoryListParams = {}) =>
    apiClient.get<ApiSuccess<PaginatedData<CategoryDto>>>('/admin/categories', { params }),

  /** GET /admin/categories/:id */
  getById: (id: string) =>
    apiClient.get<ApiSuccess<CategoryDto>>(`/admin/categories/${id}`),

  /** POST /admin/categories */
  create: (data: CreateCategoryPayload, imageFile?: File | null) =>
    apiClient.post<ApiSuccess<CategoryDto>>('/admin/categories', buildBody(data, imageFile)),

  /** PATCH /admin/categories/:id */
  update: (id: string, data: UpdateCategoryPayload, imageFile?: File | null) =>
    apiClient.patch<ApiSuccess<CategoryDto>>(`/admin/categories/${id}`, buildBody(data, imageFile)),

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

};


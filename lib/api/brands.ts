import apiClient from './client';
import type { ApiSuccess, PaginatedData } from '@/types/api';
import type {
  BrandDto,
  BrandListParams,
  CreateBrandPayload,
  UpdateBrandPayload,
} from '@/types/brand';

/**
 * Serialise a brand payload into either a plain object (JSON) or a
 * FormData (multipart/form-data) when image Files are attached.
 */
function buildBody(
  data: CreateBrandPayload | UpdateBrandPayload,
  imageFiles?: File[] | null,
): CreateBrandPayload | UpdateBrandPayload | FormData {
  if (!imageFiles || imageFiles.length === 0) return data;

  const formData = new FormData();
  formData.append('data', JSON.stringify(data));
  imageFiles.forEach((file) => {
    formData.append('images', file);
  });
  return formData;
}

export const brandsApi = {
  /** GET /admin/brands — paginated list with search/filter */
  list: (params: BrandListParams = {}) =>
    apiClient.get<ApiSuccess<PaginatedData<BrandDto>>>('/admin/brands', { params }),

  /** GET /admin/brands/:id */
  getById: (id: string) =>
    apiClient.get<ApiSuccess<BrandDto>>(`/admin/brands/${id}`),

  /** POST /admin/brands */
  create: (data: CreateBrandPayload, imageFiles?: File[] | null) =>
    apiClient.post<ApiSuccess<BrandDto>>('/admin/brands', buildBody(data, imageFiles)),

  /** PATCH /admin/brands/:id */
  update: (id: string, data: UpdateBrandPayload, imageFiles?: File[] | null) =>
    apiClient.patch<ApiSuccess<BrandDto>>(`/admin/brands/${id}`, buildBody(data, imageFiles)),

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

};

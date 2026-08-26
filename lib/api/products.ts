import apiClient from './client';
import type { ApiSuccess, PaginatedData } from '@/types/api';

export interface ProductMediaDto {
  id: string;
  url: string;
  altText: string | null;
  position: number;
  isPrimary: boolean;
  variantId: string | null;
}

export interface ProductVariantDto {
  id: string;
  sku: string;
  barcode: string | null;
  title: string;
  isActive: boolean;
  stockQuantity: number;
  price: string;
  compareAtPrice: string | null;
}

export interface ProductDto {
  id: string;
  brandId: string;
  name: string;
  slug: string;
  skuPrefix: string | null;
  shortDescription: string | null;
  basePrice: string;
  compareAtPrice: string | null;
  description: string | null;
  material: string | null;
  gender: string | null;
  status: 'DRAFT' | 'ACTIVE';
  createdAt: string;
  updatedAt: string;
  brand: { id: string; name: string; slug: string; logoUrl?: string | null } | null;
  primaryCategory: { id: string; name: string; slug: string } | null;
  categories: Array<{ id: string; name: string; slug: string; isPrimary: boolean }>;
  primaryImage: { id: string; url: string; altText: string | null } | null;
  media: ProductMediaDto[];
  variants: ProductVariantDto[];
  totalStock: number;
}

export interface ProductStatsDto {
  totalProducts: number;
  inStockProducts: number;
  lowOrOutOfStockProducts: number;
}

export interface CreateProductPayload {
  brandId: string;
  sizeGuideId?: string | null;
  name: string;
  slug?: string;
  skuPrefix?: string | null;
  shortDescription?: string | null;
  basePrice: string;
  compareAtPrice?: string | null;
  description?: string | null;
  material?: string | null;
  gender?: string | null;
  status?: 'DRAFT' | 'ACTIVE';
  categoryIds?: string[];
  media?: Array<{ url: string; isPrimary?: boolean; position?: number }>;
  options?: Array<{ name: string; position?: number; values: string[] }>;
  variants?: Array<{
    sku: string;
    title: string;
    stockQuantity?: number;
    priceMinor: number | string;
    barcode?: string | null;
    isActive?: boolean;
    optionValues?: Array<{ optionName: string; value: string }>;
  }>;
}

export interface ReplaceCategoriesPayload {
  categoryIds: string[];
  primaryCategoryId: string | null;
}

export interface CreateOptionPayload {
  name: string;
  position?: number;
}

export interface CreateOptionValuePayload {
  value: string;
  displayValue?: string | null;
  colorHex?: string | null;
  position?: number;
}

export interface CreateVariantPayload {
  sku: string;
  barcode?: string | null;
  title: string;
  isActive?: boolean;
  stockQuantity?: number;
  weightGrams?: number | null;
  priceMinor: string;
  costMinor?: string | null;
  compareAtPriceMinor?: string | null;
  optionValueIds: string[];
}

export const productsApi = {
  /** GET /admin/products */
  list: (params: { page?: number; limit?: number; search?: string; status?: string; categoryId?: string; brandId?: string } = {}) =>
    apiClient.get<ApiSuccess<PaginatedData<ProductDto>>>('/admin/products', { params }),

  /** GET /admin/products/stats */
  getStats: () =>
    apiClient.get<ApiSuccess<ProductStatsDto>>('/admin/products/stats'),

  /** GET /admin/products/:productId */
  get: (productId: string) =>
    apiClient.get<ApiSuccess<ProductDto>>(`/admin/products/${productId}`),

  /** POST /admin/products */
  createProduct: (data: CreateProductPayload) =>
    apiClient.post<ApiSuccess<{ id: string; name: string; slug: string }>>('/admin/products', data),

  /** PUT /admin/products/:productId/categories */
  replaceProductCategories: (productId: string, data: ReplaceCategoriesPayload) =>
    apiClient.put<ApiSuccess<unknown>>(`/admin/products/${productId}/categories`, data),

  /** PUT /admin/products/:productId/media */
  replaceProductMedia: (productId: string, media: Array<{ url: string; altText?: string | null; isPrimary?: boolean; position?: number; variantId?: string | null }>) =>
    apiClient.put<ApiSuccess<unknown>>(`/admin/products/${productId}/media`, { media }),

  /** POST /admin/products/:productId/options */
  createProductOption: (productId: string, data: CreateOptionPayload) =>
    apiClient.post<ApiSuccess<{ id: string; name: string }>>(`/admin/products/${productId}/options`, data),

  /** POST /admin/products/:productId/options/:optionId/values */
  createProductOptionValue: (productId: string, optionId: string, data: CreateOptionValuePayload) =>
    apiClient.post<ApiSuccess<{ id: string; value: string }>>(`/admin/products/${productId}/options/${optionId}/values`, data),

  /** POST /admin/products/:productId/variants */
  createProductVariant: (productId: string, data: CreateVariantPayload) =>
    apiClient.post<ApiSuccess<{ id: string; sku: string }>>(`/admin/products/${productId}/variants`, data),

  /** PATCH /admin/products/:productId */
  updateProduct: (productId: string, data: Partial<CreateProductPayload>) =>
    apiClient.patch<ApiSuccess<unknown>>(`/admin/products/${productId}`, data),

  /** DELETE /admin/products/:productId */
  deleteProduct: (productId: string) =>
    apiClient.delete(`/admin/products/${productId}`),

  /** POST /admin/upload/image */
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post<ApiSuccess<{ url: string; filename: string }>>(
      '/admin/upload/image',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },
};

import apiClient from '@/lib/api/client';
import type { ApiSuccess, PaginatedData } from '@/types/api';
import type {
  CatalogBrandDto,
  CatalogCategoryDto,
  CatalogCollectionDetailDto,
  CatalogCollectionDto,
  CatalogFiltersDto,
  CatalogProductDetailDto,
  CatalogProductDto,
  CatalogPromotionDto,
  CatalogQuery,
  ShippingPreviewDto,
  ShippingPreviewInput,
  SizeGuideDto,
} from '@/types/commerce';

// ─── Public catalog products fetcher ──────────────────────────────────────────
/**
 * Fetches paginated catalog products from the live API.
 * The response is shaped identically to the real API envelope for
 * compatibility with all existing consumers.
 */
export async function fetchCatalogProducts(params: CatalogQuery = {}): Promise<{
  success: boolean;
  data: PaginatedData<CatalogProductDto>;
}> {
  const response = await apiClient.get<ApiSuccess<PaginatedData<CatalogProductDto>>>(
    '/catalog/products',
    { params },
  );
  return response.data;
}

// ─── Public catalog collections fetcher ───────────────────────────────────────
export async function fetchCatalogCollections(params: { page?: number; limit?: number } = {}): Promise<{
  success: boolean;
  data: PaginatedData<CatalogCollectionDto>;
}> {
  const response = await apiClient.get<ApiSuccess<PaginatedData<CatalogCollectionDto>>>(
    '/catalog/collections',
    { params },
  );
  return response.data;
}

// ─── Catalog API object ────────────────────────────────────────────────────────
export const catalogApi = {
  products: (params: CatalogQuery = {}) =>
    apiClient.get<ApiSuccess<PaginatedData<CatalogProductDto>>>('/catalog/products', { params }),
  filters: () => apiClient.get<ApiSuccess<CatalogFiltersDto>>('/catalog/filters'),
  product: (slug: string) =>
    apiClient.get<ApiSuccess<CatalogProductDetailDto>>(`/catalog/products/${encodeURIComponent(slug)}`),
  relatedProducts: (slug: string, limit = 8) =>
    apiClient.get<ApiSuccess<{ items: CatalogProductDto[] }>>(`/catalog/products/${encodeURIComponent(slug)}/related`, { params: { limit } }),
  shippingPreview: (slug: string, payload: ShippingPreviewInput) =>
    apiClient.post<ApiSuccess<ShippingPreviewDto>>(`/catalog/products/${encodeURIComponent(slug)}/shipping-preview`, payload),
  promotions: () =>
    apiClient.get<ApiSuccess<{ items: CatalogPromotionDto[] }>>('/catalog/promotions'),
  brands: (params: { page?: number; limit?: number } = {}) =>
    apiClient.get<ApiSuccess<PaginatedData<CatalogBrandDto>>>('/catalog/brands', { params }),
  categories: (params: { page?: number; limit?: number } = {}) =>
    apiClient.get<ApiSuccess<PaginatedData<CatalogCategoryDto>>>('/catalog/categories', { params }),
  categoryTree: (params: { page?: number; limit?: number } = {}) =>
    apiClient.get<ApiSuccess<PaginatedData<CatalogCategoryDto>>>('/catalog/categories/tree', { params }),
  collections: (params: { page?: number; limit?: number } = {}) =>
    apiClient.get<ApiSuccess<PaginatedData<CatalogCollectionDto>>>('/catalog/collections', { params }),
  collection: (slug: string, params: { page?: number; limit?: number } = {}) =>
    apiClient.get<ApiSuccess<CatalogCollectionDetailDto>>(`/catalog/collections/${encodeURIComponent(slug)}`, { params }),
  sizeGuide: (sizeGuideId: string, params: { page?: number; limit?: number } = {}) =>
    apiClient.get<ApiSuccess<SizeGuideDto>>(`/catalog/size-guides/${sizeGuideId}`, { params }),
};

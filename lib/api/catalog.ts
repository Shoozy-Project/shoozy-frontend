import apiClient from '@/lib/api/client';
import type { ApiSuccess, PaginatedData } from '@/types/api';
import type {
  CatalogBrandDto,
  CatalogCategoryDto,
  CatalogCollectionDetailDto,
  CatalogCollectionDto,
  CatalogProductDetailDto,
  CatalogProductDto,
  CatalogQuery,
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
  data: { items: CatalogProductDto[]; pagination: { total: number } };
}> {
  const response = await apiClient.get<ApiSuccess<PaginatedData<CatalogProductDto>>>(
    '/catalog/products',
    { params },
  );
  return response.data as any;
}

// ─── Public catalog collections fetcher ───────────────────────────────────────
export async function fetchCatalogCollections(params: { page?: number; limit?: number } = {}): Promise<{
  success: boolean;
  data: { items: CatalogCollectionDto[]; pagination: { total: number } };
}> {
  const response = await apiClient.get<ApiSuccess<PaginatedData<CatalogCollectionDto>>>(
    '/catalog/collections',
    { params },
  );
  return response.data as any;
}

// ─── Catalog API object ────────────────────────────────────────────────────────
export const catalogApi = {
  products: (params: CatalogQuery = {}) =>
    apiClient.get<ApiSuccess<PaginatedData<CatalogProductDto>>>('/catalog/products', { params }),
  product: (slug: string) =>
    apiClient.get<ApiSuccess<CatalogProductDetailDto>>(`/catalog/products/${encodeURIComponent(slug)}`),
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

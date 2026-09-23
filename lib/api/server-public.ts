import { cookies } from 'next/headers';
import { API_BASE_URL } from '@/lib/constants';
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

export class PublicApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function publicGet<T>(path: string, params?: Record<string, string | number | boolean | undefined>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('shoozy-locale')?.value === 'ar' ? 'ar' : 'en';
  const url = new URL(`${API_BASE_URL.replace(/\/$/, '')}${path}`);
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
  });
  const response = await fetch(url, { cache: 'no-store', headers: { Accept: 'application/json', 'Accept-Language': locale } });
  const payload = (await response.json().catch(() => null)) as ApiSuccess<T> | { error?: { message?: string } } | null;
  if (!response.ok || !payload || !('data' in payload)) {
    throw new PublicApiError(payload && 'error' in payload ? payload.error?.message ?? 'Request failed.' : 'Request failed.', response.status);
  }
  return payload.data;
}

export const serverCatalog = {
  products: (query: CatalogQuery) => publicGet<PaginatedData<CatalogProductDto>>('/catalog/products', query as Record<string, string | number | boolean | undefined>),
  product: (slug: string) => publicGet<CatalogProductDetailDto>(`/catalog/products/${encodeURIComponent(slug)}`),
  brands: (page = 1, limit = 50) => publicGet<PaginatedData<CatalogBrandDto>>('/catalog/brands', { page, limit }),
  categories: (page = 1, limit = 24) => publicGet<PaginatedData<CatalogCategoryDto>>('/catalog/categories', { page, limit }),
  categoryTree: (page = 1, limit = 50) => publicGet<PaginatedData<CatalogCategoryDto>>('/catalog/categories/tree', { page, limit }),
  collections: (page = 1, limit = 24) => publicGet<PaginatedData<CatalogCollectionDto>>('/catalog/collections', { page, limit }),
  collection: (slug: string, page = 1, limit = 12) => publicGet<CatalogCollectionDetailDto>(`/catalog/collections/${encodeURIComponent(slug)}`, { page, limit }),
  sizeGuide: (id: string, page = 1, limit = 50) => publicGet<SizeGuideDto>(`/catalog/size-guides/${id}`, { page, limit }),
};

async function collectPages<T>(loader: (page: number, limit: number) => Promise<PaginatedData<T>>) {
  const items: T[] = [];
  for (let page = 1; page <= 50; page += 1) {
    const result = await loader(page, 50);
    items.push(...result.items);
    if (page >= result.pagination.totalPages) break;
  }
  return items;
}

export const serverCatalogEntities = {
  brands: () => collectPages(serverCatalog.brands),
  categories: () => collectPages(serverCatalog.categories),
  collections: () => collectPages(serverCatalog.collections),
};

export async function findPublicCategory(slug: string) {
  for (let page = 1; page <= 50; page += 1) {
    const result = await serverCatalog.categories(page, 50);
    const match = result.items.find((item) => item.slug === slug);
    if (match) return match;
    if (page >= result.pagination.totalPages) return null;
  }
  return null;
}

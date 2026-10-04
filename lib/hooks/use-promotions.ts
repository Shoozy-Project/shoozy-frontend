import { useQuery } from '@tanstack/react-query';
import { catalogApi, fetchCatalogProducts, fetchCatalogCollections } from '@/lib/api/catalog';
import type { CatalogBrandDto, CatalogQuery } from '@/types/commerce';

export function usePublicProducts() {
  return useQuery({
    queryKey: ['catalog', 'home-products'],
    queryFn: async () => {
      const result = await fetchCatalogProducts({ page: 1, limit: 3, sort: 'newest' });
      return result.data.items;
    },
    staleTime: 60 * 1000,
  });
}

export function useCarouselProducts(categorySlug: string | null) {
  return useQuery({
    queryKey: ['catalog', 'carousel-products', categorySlug],
    queryFn: async () => {
      const params: CatalogQuery = { page: 1, limit: 8, sort: 'newest' };
      if (categorySlug) params.category = categorySlug;
      const result = await fetchCatalogProducts(params);
      return result.data.items;
    },
    staleTime: 60 * 1000,
  });
}

export function useCollections() {
  return useQuery({
    queryKey: ['catalog', 'collections'],
    queryFn: async () => {
      const result = await fetchCatalogCollections({ page: 1, limit: 12 });
      return result.data.items;
    },
    staleTime: 60 * 1000,
  });
}

export function useBrands() {
  return useQuery<CatalogBrandDto[]>({
    queryKey: ['catalog', 'public-brands'],
    queryFn: async () => {
      const res = await catalogApi.brands({ page: 1, limit: 50 });
      return res.data.data.items;
    },
    staleTime: 5 * 60 * 1000,
  });
}

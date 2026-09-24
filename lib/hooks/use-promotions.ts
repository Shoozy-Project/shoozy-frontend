import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '@/lib/api/catalog';

export function usePublicProducts() {
  return useQuery({
    queryKey: ['catalog', 'home-products'],
    queryFn: async () => (await catalogApi.products({ page: 1, limit: 3, sort: 'newest' })).data.data.items,
    staleTime: 60 * 1000,
  });
}

export function useCarouselProducts(gender: string | null) {
  return useQuery({
    queryKey: ['catalog', 'carousel-products', gender],
    queryFn: async () => {
      const params: any = { page: 1, limit: 8, sort: 'newest' };
      if (gender) params.gender = gender;
      return (await catalogApi.products(params)).data.data.items;
    },
    staleTime: 60 * 1000,
  });
}

export function useCollections() {
  return useQuery({
    queryKey: ['catalog', 'collections'],
    queryFn: async () => (await catalogApi.collections({ page: 1, limit: 12 })).data.data.items,
    staleTime: 60 * 1000,
  });
}

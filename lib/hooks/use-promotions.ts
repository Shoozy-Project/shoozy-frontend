import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '@/lib/api/catalog';

export function usePublicProducts() {
  return useQuery({
    queryKey: ['catalog', 'home-products'],
    queryFn: async () => (await catalogApi.products({ page: 1, limit: 3, sort: 'newest' })).data.data.items,
    staleTime: 60 * 1000,
  });
}

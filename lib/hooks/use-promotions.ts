import { useQuery } from '@tanstack/react-query';
import { publicProductsApi } from '../api/public-products';

export function usePublicProducts() {
  return useQuery({
    queryKey: ['publicProducts'],
    queryFn: async () => (await publicProductsApi.listPublicProducts()).data.data,
    staleTime: 60 * 1000,
  });
}

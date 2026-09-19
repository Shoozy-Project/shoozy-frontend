import { useQuery } from '@tanstack/react-query';
import { promotionsApi } from '../api/promotions';
import { publicProductsApi } from '../api/public-products';

export function usePublicBanners() {
  return useQuery({
    queryKey: ['publicBanners'],
    queryFn: async () => {
      const response = await promotionsApi.publicBanners();
      return response.data.data;
    },
    staleTime: 60 * 1000,
  });
}

export function usePublicProducts() {
  return useQuery({
    queryKey: ['publicProducts'],
    queryFn: async () => {
      const response = await publicProductsApi.listPublicProducts();
      return response.data.data;
    },
    staleTime: 60 * 1000,
  });
}

import apiClient from '@/lib/api/client';
import type { ApiSuccess, PaginatedData } from '@/types/api';
import type { WishlistItemDto } from '@/types/commerce';

export const wishlistApi = {
  list: async (page = 1, limit = 20) =>
    (await apiClient.get<ApiSuccess<PaginatedData<WishlistItemDto>>>('/wishlist', { params: { page, limit } })).data.data,
  async listAll() {
    const items: WishlistItemDto[] = [];
    for (let page = 1; page <= 50; page += 1) {
      const result = await wishlistApi.list(page, 50);
      items.push(...result.items);
      if (page >= result.pagination.totalPages) break;
    }
    return items;
  },
  add: async (productId: string, variantId?: string) =>
    (await apiClient.post<ApiSuccess<WishlistItemDto>>('/wishlist/items', { productId, ...(variantId ? { variantId } : {}) })).data.data,
  remove: (wishlistItemId: string) => apiClient.delete(`/wishlist/items/${wishlistItemId}`),
};

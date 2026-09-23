'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '@/lib/api/cart';
import { wishlistApi } from '@/lib/api/wishlist';
import { selectIsAuthenticated, useAuthStore } from '@/stores/auth-store';
import { useCommerceStore } from '@/stores/commerce-store';

export const commerceKeys = {
  cart: ['commerce', 'cart'] as const,
  wishlist: ['commerce', 'wishlist'] as const,
  addresses: ['account', 'addresses'] as const,
  profile: ['account', 'profile'] as const,
  orders: ['account', 'orders'] as const,
  returns: ['account', 'returns'] as const,
  exchanges: ['account', 'exchanges'] as const,
};

export function useCurrentCart() {
  const authenticated = useAuthStore(selectIsAuthenticated);
  const authReady = useAuthStore((state) => state.isInitialized);
  const token = useCommerceStore((state) => state.guestSessionToken);
  const guestReady = useCommerceStore((state) => state.isGuestSessionHydrated);
  const hydrate = useCommerceStore((state) => state.hydrateGuestSession);

  useEffect(() => {
    if (!guestReady) hydrate();
  }, [guestReady, hydrate]);

  return useQuery({
    queryKey: [...commerceKeys.cart, authenticated ? 'account' : 'guest', authenticated ? null : token],
    queryFn: () => cartApi.get(authenticated),
    enabled: authReady && (authenticated || guestReady),
    staleTime: 30_000,
  });
}

export function useAddToCart() {
  const authenticated = useAuthStore(selectIsAuthenticated);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ variantId, quantity }: { variantId: string; quantity: number }) => cartApi.add(authenticated, variantId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: commerceKeys.cart }),
  });
}

export function useCartMutation(action: 'update' | 'remove' | 'coupon' | 'removeCoupon') {
  const authenticated = useAuthStore(selectIsAuthenticated);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { itemId?: string; quantity?: number; code?: string }) => {
      if (action === 'update') return cartApi.update(authenticated, input.itemId!, input.quantity!);
      if (action === 'remove') return cartApi.remove(authenticated, input.itemId!);
      if (action === 'coupon') return cartApi.setDiscountCode(authenticated, input.code!);
      return cartApi.removeDiscountCode(authenticated);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: commerceKeys.cart }),
  });
}

export function useWishlist() {
  const authenticated = useAuthStore(selectIsAuthenticated);
  const authReady = useAuthStore((state) => state.isInitialized);
  return useQuery({
    queryKey: commerceKeys.wishlist,
    queryFn: wishlistApi.listAll,
    enabled: authReady && authenticated,
    staleTime: 60_000,
  });
}

export function useWishlistMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { productId: string; variantId?: string; wishlistItemId?: string }) => {
      if (input.wishlistItemId) return wishlistApi.remove(input.wishlistItemId);
      return wishlistApi.add(input.productId, input.variantId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: commerceKeys.wishlist }),
  });
}

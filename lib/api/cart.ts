import { isAxiosError } from 'axios';
import apiClient from '@/lib/api/client';
import { currentGuestSessionToken, useCommerceStore } from '@/stores/commerce-store';
import type { ApiSuccess } from '@/types/api';
import type { CartDto } from '@/types/commerce';

export const EMPTY_CART: CartDto = {
  id: null,
  status: 'ACTIVE',
  currency: 'TND',
  discountCode: null,
  items: [],
  checkoutEligible: false,
  issues: ['CART_EMPTY'],
  totals: { subtotalMinor: '0', merchandiseDiscountMinor: '0', estimatedTotalMinor: '0' },
};

const guestHeaders = () => {
  const token = currentGuestSessionToken();
  return token ? { 'X-Guest-Session': token } : undefined;
};

async function addToGuestCart(variantId: string, quantity: number) {
  const request = (headers?: Record<string, string>) =>
    apiClient.post<ApiSuccess<CartDto | { sessionToken: string; cart: CartDto }>>(
      '/guest/cart/items',
      { variantId, quantity },
      { headers },
    );
  let response;
  try {
    response = await request(guestHeaders());
  } catch (error) {
    if (!isAxiosError(error) || error.response?.status !== 401 || !currentGuestSessionToken()) throw error;
    useCommerceStore.getState().clearGuestSession();
    response = await request();
  }
  const value = response.data.data;
  if ('sessionToken' in value) {
    useCommerceStore.getState().setGuestSessionToken(value.sessionToken);
    return value.cart;
  }
  return value;
}

export const cartApi = {
  async get(authenticated: boolean) {
    if (authenticated) return (await apiClient.get<ApiSuccess<CartDto>>('/cart')).data.data;
    if (!currentGuestSessionToken()) return EMPTY_CART;
    try {
      return (await apiClient.get<ApiSuccess<CartDto>>('/guest/cart', { headers: guestHeaders() })).data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        useCommerceStore.getState().clearGuestSession();
        return EMPTY_CART;
      }
      throw error;
    }
  },
  add: async (authenticated: boolean, variantId: string, quantity: number) =>
    authenticated
      ? (await apiClient.post<ApiSuccess<CartDto>>('/cart/items', { variantId, quantity })).data.data
      : addToGuestCart(variantId, quantity),
  update: async (authenticated: boolean, itemId: string, quantity: number) =>
    (await apiClient.patch<ApiSuccess<CartDto>>(
      `${authenticated ? '/cart' : '/guest/cart'}/items/${itemId}`,
      { quantity },
      authenticated ? undefined : { headers: guestHeaders() },
    )).data.data,
  remove: async (authenticated: boolean, itemId: string) =>
    (await apiClient.delete<ApiSuccess<CartDto>>(
      `${authenticated ? '/cart' : '/guest/cart'}/items/${itemId}`,
      authenticated ? undefined : { headers: guestHeaders() },
    )).data.data,
  setDiscountCode: async (authenticated: boolean, code: string) =>
    (await apiClient.put<ApiSuccess<CartDto>>(
      `${authenticated ? '/cart' : '/guest/cart'}/discount-code`,
      { code },
      authenticated ? undefined : { headers: guestHeaders() },
    )).data.data,
  removeDiscountCode: async (authenticated: boolean) =>
    (await apiClient.delete<ApiSuccess<CartDto>>(
      `${authenticated ? '/cart' : '/guest/cart'}/discount-code`,
      authenticated ? undefined : { headers: guestHeaders() },
    )).data.data,
};

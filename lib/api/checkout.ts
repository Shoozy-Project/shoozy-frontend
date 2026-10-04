import apiClient from '@/lib/api/client';
import { currentGuestSessionToken } from '@/stores/commerce-store';
import type { ApiSuccess, PaginatedData } from '@/types/api';
import type {
  CheckoutPreviewDto,
  GuestCheckoutInput,
  OrderDetailDto,
  PlaceOrderResultDto,
  ShippingMethodDto,
} from '@/types/commerce';

function guestSessionHeaders(extra?: Record<string, string>) {
  const token = currentGuestSessionToken();
  if (!token) throw new Error('Guest cart session is unavailable.');
  return { 'X-Guest-Session': token, ...extra };
}

export const checkoutApi = {
  shippingMethods: async (page = 1, limit = 20) =>
    (await apiClient.get<ApiSuccess<PaginatedData<ShippingMethodDto>>>('/shipping-methods', { params: { page, limit } })).data.data,
  previewAuthenticated: async (addressId: string, shippingMethodId: string) =>
    (await apiClient.post<ApiSuccess<CheckoutPreviewDto>>('/checkout/preview', { addressId, shippingMethodId })).data.data,
  previewGuest: async (input: GuestCheckoutInput) =>
    (await apiClient.post<ApiSuccess<CheckoutPreviewDto>>('/guest/checkout/preview', input, { headers: guestSessionHeaders() })).data.data,
  placeAuthenticated: async (input: { addressId: string; shippingMethodId: string; notes?: string | null }, idempotencyKey: string) =>
    (await apiClient.post<ApiSuccess<PlaceOrderResultDto>>('/orders', input, { headers: { 'Idempotency-Key': idempotencyKey } })).data.data,
  placeGuest: async (input: GuestCheckoutInput & { notes?: string | null }, idempotencyKey: string) =>
    (await apiClient.post<ApiSuccess<PlaceOrderResultDto>>('/guest/orders', input, { headers: guestSessionHeaders({ 'Idempotency-Key': idempotencyKey }) })).data.data,
  getGuestOrder: async (orderNumber: string, guestOrderToken: string) =>
    (await apiClient.get<ApiSuccess<OrderDetailDto>>(`/guest/orders/${encodeURIComponent(orderNumber)}`, { headers: { 'X-Guest-Order-Token': guestOrderToken } })).data.data,
};

export async function listAllShippingMethods() {
  const items: ShippingMethodDto[] = [];
  for (let page = 1; page <= 20; page += 1) {
    const result = await checkoutApi.shippingMethods(page, 50);
    items.push(...result.items);
    if (page >= result.pagination.totalPages) break;
  }
  return items;
}

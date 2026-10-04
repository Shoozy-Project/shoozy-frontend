import { apiClient } from './client';
import type { ApiSuccess, PaginatedData } from '@/types/api';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'RETURNED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'CANCELLED';

export interface OrderTotalsDto {
  currency: string;
  subtotalMinor: string;
  discountMinor: string;
  shippingMinor: string;
  totalMinor: string;
  paidMinor: string;
  refundedMinor: string;
}

export interface OrderListDto {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  itemCount: number;
  totals: OrderTotalsDto;
  placedAt: string;
  confirmedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderDetailDto extends Omit<OrderListDto, 'itemCount'> {
  customerEmail: string;
  customerPhone: string;
  customerFirstName: string;
  customerLastName: string;
  paidAt: string | null;
  notes: string | null;
  trackingNumber: string | null;
  shippingProvider: string | null;
  shippingMethod: { code: string; name: string } | null;
  shippingZone: { code: string; name: string } | null;
  address: null | {
    recipientName: string; phone: string; countryCode: string; state: string; city: string;
    area: string | null; line1: string; line2: string | null; postalCode: string | null;
    latitude: string | null; longitude: string | null;
  };
  items: Array<{
    id: string; productId: string; variantId: string; productName: string; variantName: string;
    sku: string; quantity: number; unitPriceMinor: string; discountMinor: string;
    lineTotalMinor: string; snapshotJson: unknown;
  }>;
  discounts: Array<{ discountId: string; name: string; code: string | null; amountMinor: string; redeemedAt: string }>;
  statusHistory: Array<{ id: string; fromStatus: OrderStatus | null; toStatus: OrderStatus; createdAt: string }>;
}

export interface OrderFilters {
  page?: number; limit?: number; search?: string; status?: OrderStatus;
  paymentStatus?: PaymentStatus; hasTracking?: boolean;
}

export type OrderAction = 'confirm' | 'cancel' | 'ship' | 'deliver';
export interface OrderActionPayload { reason?: string | null; shippingProvider?: string; trackingNumber?: string | null }

export const ordersApi = {
  list: (params: OrderFilters = {}) =>
    apiClient.get<ApiSuccess<PaginatedData<OrderListDto>>>('/admin/orders', { params }).then((response) => response.data.data),
  getById: (orderId: string) =>
    apiClient.get<ApiSuccess<OrderDetailDto>>(`/admin/orders/${orderId}`).then((response) => response.data.data),
  transition: (orderId: string, action: OrderAction, payload: OrderActionPayload = {}) =>
    apiClient.post<ApiSuccess<{ order: OrderDetailDto; idempotentReplay: boolean }>>(`/admin/orders/${orderId}/${action}`, payload).then((response) => response.data.data),
};

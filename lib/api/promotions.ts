import apiClient from './client';
import type { ApiSuccess, PaginatedData } from '@/types/api';

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
export type DiscountScope = 'ORDER' | 'PRODUCT' | 'CATEGORY';
export type DiscountTargetInput = { productId: string } | { categoryId: string };

export interface DiscountDto {
  id: string; name: string; code: string | null; type: DiscountType; scope: DiscountScope;
  priority: number; value: string; currency: string | null; minOrderMinor: string | null;
  maxDiscountMinor: string | null; usageLimit: number | null; perCustomerLimit: number | null;
  startsAt: string; endsAt: string | null; isActive: boolean; combinable: boolean;
  targets: Array<{ id: string; productId: string | null; categoryId: string | null; product: { id: string; name: string; slug: string; available: boolean } | null; category: { id: string; name: string; slug: string } | null }>;
  redemptionCount: number; createdAt: string; updatedAt: string;
}

export type CouponDto = DiscountDto;

export interface DiscountPayload {
  name: string; code: string | null; type: DiscountType; scope: DiscountScope; priority: number;
  value: string; currency: string | null; minOrderMinor: string | null;
  maxDiscountMinor: string | null; usageLimit: number | null; perCustomerLimit: number | null;
  startsAt: string; endsAt: string | null; isActive: boolean; combinable: boolean;
  targets: DiscountTargetInput[];
}

export const promotionsApi = {
  listCoupons: (params: { page?: number; limit?: number; search?: string; isActive?: boolean; type?: DiscountType; scope?: DiscountScope } = {}) =>
    apiClient.get<ApiSuccess<PaginatedData<DiscountDto>>>('/admin/discounts', { params }),
  createCoupon: (payload: DiscountPayload) => apiClient.post<ApiSuccess<DiscountDto>>('/admin/discounts', payload),
  updateCoupon: (id: string, payload: Partial<DiscountPayload>) => apiClient.patch<ApiSuccess<DiscountDto>>(`/admin/discounts/${id}`, payload),
  deleteCoupon: (id: string) => apiClient.delete(`/admin/discounts/${id}`),
  toggleCouponActive: (id: string, isActive: boolean) => apiClient.patch<ApiSuccess<DiscountDto>>(`/admin/discounts/${id}`, { isActive }),
};

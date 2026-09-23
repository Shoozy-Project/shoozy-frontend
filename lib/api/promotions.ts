import apiClient from './client';
import type { ApiSuccess, PaginatedData } from '@/types/api';
import type { EntityTranslation, TranslationMap } from '@/types/localization';

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
export type DiscountScope = 'ORDER' | 'PRODUCT' | 'VARIANT' | 'CATEGORY' | 'COLLECTION' | 'CATALOG';
export type DiscountStatus = 'SCHEDULED' | 'ACTIVE' | 'EXPIRED' | 'DISABLED' | 'ARCHIVED';
export type DiscountActivationMode = 'AUTOMATIC' | 'COUPON';
export type DiscountTargetInput = { productId: string } | { variantId: string } | { categoryId: string } | { collectionId: string };

export interface DiscountTargetDto {
  id: string;
  productId: string | null;
  variantId: string | null;
  categoryId: string | null;
  collectionId: string | null;
  product: { id: string; name: string; slug: string; available: boolean } | null;
  variant: { id: string; sku: string; available: boolean; product: { id: string; name: string; slug: string } } | null;
  category: { id: string; name: string; slug: string } | null;
  collection: { id: string; name: string; slug: string; isActive: boolean } | null;
}

export interface DiscountDto {
  id: string;
  name: string;
  description: string | null;
  translations?: TranslationMap<EntityTranslation>;
  code: string | null;
  activationMode: DiscountActivationMode;
  type: DiscountType;
  scope: DiscountScope;
  status: DiscountStatus;
  priority: number;
  value: string;
  currency: string | null;
  minOrderMinor: string | null;
  maxDiscountMinor: string | null;
  usageLimit: number | null;
  perCustomerLimit: number | null;
  startsAt: string;
  endsAt: string | null;
  isActive: boolean;
  combinable: boolean;
  archivedAt: string | null;
  targets: DiscountTargetDto[];
  redemptionCount: number;
  createdAt: string;
  updatedAt: string;
}

export type CouponDto = DiscountDto;

export interface DiscountPayload {
  name: string;
  description: string | null;
  translations?: TranslationMap<EntityTranslation>;
  code: string | null;
  type: DiscountType;
  scope: DiscountScope;
  priority: number;
  value: string;
  currency: string | null;
  minOrderMinor: string | null;
  maxDiscountMinor: string | null;
  usageLimit: number | null;
  perCustomerLimit: number | null;
  startsAt: string;
  endsAt: string | null;
  isActive: boolean;
  combinable: boolean;
  targets: DiscountTargetInput[];
}

export interface DiscountStatistics {
  usageCount: number;
  associatedOrders: number;
  totalDiscountGrantedMinor: string;
  revenueMinor: string;
}

export const promotionsApi = {
  listCoupons: (params: { page?: number; limit?: number; search?: string; isActive?: boolean; type?: DiscountType; scope?: DiscountScope } = {}) =>
    apiClient.get<ApiSuccess<PaginatedData<DiscountDto>>>('/admin/discounts', { params }),
  get: (id: string) => apiClient.get<ApiSuccess<DiscountDto>>(`/admin/discounts/${id}`).then((response) => response.data.data),
  createCoupon: (payload: DiscountPayload) => apiClient.post<ApiSuccess<DiscountDto>>('/admin/discounts', payload),
  updateCoupon: (id: string, payload: Partial<DiscountPayload>) => apiClient.patch<ApiSuccess<DiscountDto>>(`/admin/discounts/${id}`, payload),
  replaceTargets: (id: string, targets: DiscountTargetInput[]) => apiClient.put<ApiSuccess<DiscountDto>>(`/admin/discounts/${id}/targets`, { targets }),
  activate: (id: string) => apiClient.post<ApiSuccess<DiscountDto>>(`/admin/discounts/${id}/activate`),
  deactivate: (id: string) => apiClient.post<ApiSuccess<DiscountDto>>(`/admin/discounts/${id}/deactivate`),
  archive: (id: string) => apiClient.post<ApiSuccess<DiscountDto>>(`/admin/discounts/${id}/archive`),
  statistics: (id: string) => apiClient.get<ApiSuccess<DiscountStatistics>>(`/admin/discounts/${id}/statistics`).then((response) => response.data.data),
  deleteCoupon: (id: string) => apiClient.delete(`/admin/discounts/${id}`),
  toggleCouponActive: (id: string, isActive: boolean) => isActive
    ? apiClient.post<ApiSuccess<DiscountDto>>(`/admin/discounts/${id}/activate`)
    : apiClient.post<ApiSuccess<DiscountDto>>(`/admin/discounts/${id}/deactivate`),
};

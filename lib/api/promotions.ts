import apiClient from './client';
import type { ApiSuccess } from '@/types/api';

// ─── DTO Types ──────────────────────────────────────────────────

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';

export interface CouponDto {
  id: string;
  name: string;
  code: string;
  type: DiscountType;
  scope: string;
  value: number; // For PERCENTAGE: 10 means 10%. For FIXED_AMOUNT: minor units (10000 = 10 TND)
  currency?: string | null;
  minOrderMinor?: number | null;
  maxDiscountMinor?: number | null;
  usageLimit?: number | null;
  perCustomerLimit?: number | null;
  startsAt: string;
  endsAt?: string | null;
  isActive: boolean;
  combinable: boolean;
  usageCount: number;
  createdAt: string;
}

export interface CreateCouponPayload {
  code: string;
  type: DiscountType;
  value: number;
  minOrderRequirement?: number | null; // Pass minor units (e.g. 50000 for 50 TND)
  usageLimit?: number | null;
  startsAt?: string;
  endsAt?: string | null;
  isActive?: boolean;
  combinable?: boolean;
}

export interface UpdateCouponPayload extends Partial<CreateCouponPayload> {}

export interface BannerDto {
  id: string;
  title: string;
  subtitle?: string | null;
  badgeText?: string | null;
  imageDesktopUrl: string;
  imageMobileUrl?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateBannerPayload {
  title: string;
  subtitle?: string | null;
  badgeText?: string | null;
  imageDesktopUrl: string;
  imageMobileUrl?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateBannerPayload extends Partial<CreateBannerPayload> {}

export interface AnnouncementDto {
  id: string;
  message: string;
  link?: string | null;
  bgColor: string;
  textColor: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateAnnouncementPayload {
  message: string;
  link?: string | null;
  bgColor?: string;
  textColor?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateAnnouncementPayload extends Partial<CreateAnnouncementPayload> {}

// ─── API Client ─────────────────────────────────────────────────

export const promotionsApi = {
  // ── Admin Coupons ──────────────────────────────────────────────
  listCoupons: () =>
    apiClient.get<ApiSuccess<CouponDto[]>>('/admin/promotions/coupons'),

  createCoupon: (payload: CreateCouponPayload) =>
    apiClient.post<ApiSuccess<CouponDto>>('/admin/promotions/coupons', payload),

  updateCoupon: (id: string, payload: UpdateCouponPayload) =>
    apiClient.patch<ApiSuccess<CouponDto>>(`/admin/promotions/coupons/${id}`, payload),

  deleteCoupon: (id: string) =>
    apiClient.delete(`/admin/promotions/coupons/${id}`),

  toggleCouponActive: (id: string, isActive: boolean) =>
    apiClient.patch<ApiSuccess<CouponDto>>(`/admin/promotions/coupons/${id}`, { isActive }),

  // ── Admin Hero Banners ─────────────────────────────────────────
  listBanners: () =>
    apiClient.get<ApiSuccess<BannerDto[]>>('/admin/promotions/banners'),

  createBanner: (payload: CreateBannerPayload) =>
    apiClient.post<ApiSuccess<BannerDto>>('/admin/promotions/banners', payload),

  updateBanner: (id: string, payload: UpdateBannerPayload) =>
    apiClient.patch<ApiSuccess<BannerDto>>(`/admin/promotions/banners/${id}`, payload),

  deleteBanner: (id: string) =>
    apiClient.delete(`/admin/promotions/banners/${id}`),

  toggleBannerActive: (id: string, isActive: boolean) =>
    apiClient.patch<ApiSuccess<BannerDto>>(`/admin/promotions/banners/${id}`, { isActive }),

  reorderBanners: (orders: Array<{ id: string; displayOrder: number }>) =>
    apiClient.put<ApiSuccess<{ success: boolean }>>('/admin/promotions/banners/reorder', { orders }),

  // ── Admin Announcements ────────────────────────────────────────
  listAnnouncements: () =>
    apiClient.get<ApiSuccess<AnnouncementDto[]>>('/admin/promotions/announcements'),

  createAnnouncement: (payload: CreateAnnouncementPayload) =>
    apiClient.post<ApiSuccess<AnnouncementDto>>('/admin/promotions/announcements', payload),

  updateAnnouncement: (id: string, payload: UpdateAnnouncementPayload) =>
    apiClient.patch<ApiSuccess<AnnouncementDto>>(`/admin/promotions/announcements/${id}`, payload),

  deleteAnnouncement: (id: string) =>
    apiClient.delete(`/admin/promotions/announcements/${id}`),

  toggleAnnouncementActive: (id: string, isActive: boolean) =>
    apiClient.patch<ApiSuccess<AnnouncementDto>>(`/admin/promotions/announcements/${id}`, { isActive }),

  // ── Image Upload Helper ────────────────────────────────────────
  uploadBannerImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post<ApiSuccess<{ url: string }>>('/admin/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // ── Public Storefront Endpoints ────────────────────────────────
  publicBanners: () =>
    apiClient.get<ApiSuccess<BannerDto[]>>('/public/promotions/banners'),

  publicAnnouncements: () =>
    apiClient.get<ApiSuccess<AnnouncementDto[]>>('/public/promotions/announcements'),
};

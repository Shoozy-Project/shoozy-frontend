import apiClient from './client';
import type { ApiSuccess, PaginatedData } from '@/types/api';

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ReviewUserDto {
  id?: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface ReviewProductDto {
  id: string;
  name: string;
  slug?: string;
  media?: Array<{ url: string }>;
}

export interface ReviewDto {
  id: string;
  productId?: string;
  userId?: string;
  rating: number;
  title?: string | null;
  body?: string | null;
  status: ReviewStatus;
  isVerifiedPurchase: boolean;
  publishedAt?: string | null;
  createdAt: string;
  user: ReviewUserDto;
  product: ReviewProductDto;
}

export interface ReviewListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ReviewStatus | 'ALL';
}

export interface SubmitReviewPayload {
  productId: string;
  rating: number;
  title?: string;
  body?: string;
}

export interface StorefrontReviewDto {
  id: string;
  rating: number;
  title?: string | null;
  body?: string | null;
  isVerifiedPurchase: boolean;
  publishedAt: string;
  customerName: string;
}

export interface ProductReviewsSummaryDto {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
  distributionPercent: Record<number, number>;
  reviews: StorefrontReviewDto[];
}

export const reviewsApi = {
  /** Customer submission (requires Auth) */
  submitReview: (payload: SubmitReviewPayload) =>
    apiClient.post<ApiSuccess<ReviewDto>>('/reviews', payload),

  /** Admin list with search & filters */
  listAdminReviews: (params: ReviewListParams = {}) =>
    apiClient.get<ApiSuccess<PaginatedData<ReviewDto>>>('/admin/reviews', { params }),

  /** Admin status update (APPROVED, REJECTED, PENDING) */
  updateReviewStatus: (id: string, status: ReviewStatus) =>
    apiClient.patch<ApiSuccess<ReviewDto>>(`/admin/reviews/${id}/status`, { status }),

  /** Admin delete review */
  deleteReview: (id: string) =>
    apiClient.delete(`/admin/reviews/${id}`),

  /** Storefront product page reviews & aggregate rating summary */
  getProductReviews: (productId: string) =>
    apiClient.get<ApiSuccess<ProductReviewsSummaryDto>>(`/reviews/product/${productId}`),
};

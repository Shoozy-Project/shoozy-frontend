import apiClient from './client';
import type { ApiSuccess, PaginatedData, Pagination } from '@/types/api';

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ReviewDto {
  id: string; productId: string; userId: string; orderItemId: string; rating: number;
  title: string | null; body: string | null; status: ReviewStatus;
  isVerifiedPurchase: boolean; publishedAt: string | null; createdAt: string; updatedAt: string;
  reviewer: { firstName: string; lastName: string };
  product: { name: string; slug: string };
}

export interface PublicReviewDto {
  id: string; rating: number; title: string | null; body: string | null;
  isVerifiedPurchase: boolean; reviewer: { firstName: string; lastInitial: string };
  publishedAt: string; createdAt: string;
}

export const reviewsApi = {
  create: (productId: string, payload: { orderItemId: string; rating: number; title?: string | null; body?: string | null }) =>
    apiClient.post<ApiSuccess<Omit<ReviewDto, 'reviewer' | 'product' | 'userId'>>>(`/products/${productId}/reviews`, payload),
  update: (productId: string, reviewId: string, payload: { rating?: number; title?: string | null; body?: string | null }) =>
    apiClient.patch<ApiSuccess<Omit<ReviewDto, 'reviewer' | 'product' | 'userId'>>>(`/products/${productId}/reviews/${reviewId}`, payload),
  deleteOwn: (productId: string, reviewId: string) => apiClient.delete(`/products/${productId}/reviews/${reviewId}`),
  getProductReviews: (productId: string, params: { page?: number; limit?: number; sort?: 'newest' | 'oldest' | 'rating_desc' | 'rating_asc' } = {}) =>
    apiClient.get<ApiSuccess<{ items: PublicReviewDto[]; aggregate: { count: number; averageRating: string | null }; pagination: Pagination }>>(`/catalog/products/${productId}/reviews`, { params }),
  listAdminReviews: (params: { page?: number; limit?: number; status?: ReviewStatus; productId?: string; rating?: number } = {}) =>
    apiClient.get<ApiSuccess<PaginatedData<ReviewDto>>>('/admin/reviews', { params }),
  moderate: (reviewId: string, status: 'APPROVED' | 'REJECTED') =>
    apiClient.post<ApiSuccess<ReviewDto>>(`/admin/reviews/${reviewId}/moderation`, { status }),
};

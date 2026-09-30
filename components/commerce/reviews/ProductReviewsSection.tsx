'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { reviewsApi, PublicReviewDto } from '@/lib/api/reviews';
import { useAuthStore, selectUser } from '@/stores/auth-store';
import { ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';
import { motion, AnimatePresence } from 'framer-motion';

export function ProductReviewsSection({ productId }: { productId: string }) {
  const queryClient = useQueryClient();
  const user = useAuthStore(selectUser);
  const [editingReview, setEditingReview] = useState<PublicReviewDto | null>(null);
  const [isWriting, setIsWriting] = useState(false);

  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['product-reviews', productId, page],
    queryFn: async () => {
      const res = await reviewsApi.getProductReviews(productId, { limit: 5, page });
      return res.data.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (formData: { rating: number; title: string; body: string }) => {
      return reviewsApi.create(productId, { ...formData });
    },
    onSuccess: () => {
      toast.success('Thank you for your feedback. Your review has been submitted for moderation.');
      setIsWriting(false);
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
    },
    onError: (err: any) => {
      const responseData = err?.response?.data;
      if (responseData?.errors && Array.isArray(responseData.errors)) {
        const errorMessages = responseData.errors.map((e: any) => e.message || e).join(' ');
        toast.error(`Validation Error: ${errorMessages}`);
      } else {
        toast.error(responseData?.message || 'Failed to submit review. Please try again.');
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: { rating: number; title: string; body: string } }) => {
      return reviewsApi.update(productId, id, formData);
    },
    onSuccess: () => {
      toast.success('Review updated successfully.');
      setEditingReview(null);
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
    },
    onError: () => toast.error('Failed to update review.')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => reviewsApi.deleteOwn(productId, id),
    onSuccess: () => {
      toast.success('Review deleted.');
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
    },
    onError: () => toast.error('Failed to delete review.')
  });

  const reviews = data?.items || [];
  const aggregate = data?.aggregate || { count: 0, averageRating: null };
  const average = parseFloat(aggregate.averageRating || '0').toFixed(1);

  return (
    <section className="mt-24 md:mt-32 pt-16 border-t border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* ── Left Column: Aggregate Data (Sticky) ── */}
          <div className="md:col-span-4 md:sticky md:top-32 space-y-8 flex flex-col">
            <div>
              <h2 className="font-serif text-3xl text-neutral-900 dark:text-neutral-100 mb-6">Customer Reviews</h2>
              <div className="flex flex-col">
                <span className="text-7xl font-serif text-neutral-900 dark:text-white leading-none tracking-tighter mb-4">{average}</span>
                <div className="flex items-center gap-1.5 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(Number(average))
                          ? 'fill-amber-500 text-amber-500'
                          : 'fill-neutral-200 text-neutral-200 dark:fill-neutral-800 dark:text-neutral-800'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-neutral-500 tracking-widest uppercase">
                  Based on {aggregate.count} {aggregate.count === 1 ? 'Review' : 'Reviews'}
                </span>
              </div>
            </div>

            {!isWriting && !editingReview && (
              <button
                onClick={() => setIsWriting(true)}
                className="w-full sm:w-auto self-start border border-black dark:border-white text-black dark:text-white px-6 py-4 uppercase text-xs font-bold tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
              >
                Write a Review
              </button>
            )}

            <AnimatePresence>
              {(isWriting || editingReview) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden w-full"
                >
                  <div className="pt-4">
                    <h3 className="text-sm font-semibold uppercase tracking-widest mb-6">
                      {editingReview ? 'Edit Review' : 'Write a Review'}
                    </h3>
                    <ReviewForm
                      initialData={
                        editingReview
                          ? {
                              rating: editingReview.rating,
                              title: editingReview.title || '',
                              body: editingReview.body || ''
                            }
                          : undefined
                      }
                      isLoading={editingReview ? updateMutation.isPending : createMutation.isPending}
                      onSubmit={async (formData) => {
                        if (editingReview) {
                          await updateMutation.mutateAsync({ id: editingReview.id, formData });
                        } else {
                          await createMutation.mutateAsync(formData);
                        }
                      }}
                      onCancel={() => {
                        setIsWriting(false);
                        setEditingReview(null);
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* ── Right Column: Reviews List ── */}
          <div className="md:col-span-8 md:pl-8 lg:pl-12">
            <div className="space-y-0">
              {isLoading ? (
                <div className="animate-pulse space-y-12">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-neutral-100 dark:bg-neutral-900 w-full" />
                  ))}
                </div>
              ) : reviews.length > 0 ? (
                <div className="flex flex-col">
                  {reviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      isOwner={!!user && user.firstName === review.reviewer?.firstName}
                      onEdit={setEditingReview}
                      onDelete={(id) => {
                        if (confirm('Are you sure you want to delete this review?')) {
                          deleteMutation.mutate(id);
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-20 flex flex-col items-start justify-center">
                  <p className="font-serif text-2xl text-neutral-900 dark:text-neutral-100 mb-2">No reviews yet.</p>
                  <p className="text-sm text-neutral-500">Be the first to share your experience with this piece.</p>
                </div>
              )}

              {/* Pagination */}
              {data?.pagination && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-start gap-2 pt-8">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex h-10 w-10 items-center justify-center border border-transparent text-neutral-500 hover:text-black dark:hover:text-white hover:border-neutral-200 dark:hover:border-neutral-800 disabled:opacity-50 disabled:pointer-events-none transition-all rounded-full"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: data.pagination.totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`text-xs font-semibold w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          page === i + 1
                            ? 'bg-black text-white dark:bg-white dark:text-black'
                            : 'text-neutral-400 hover:text-black dark:hover:text-white'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                    disabled={page === data.pagination.totalPages}
                    className="flex h-10 w-10 items-center justify-center border border-transparent text-neutral-500 hover:text-black dark:hover:text-white hover:border-neutral-200 dark:hover:border-neutral-800 disabled:opacity-50 disabled:pointer-events-none transition-all rounded-full"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

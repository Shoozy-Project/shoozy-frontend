'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { reviewsApi } from '@/lib/api/reviews';
import { useAuthStore, selectIsAuthenticated } from '@/stores/auth-store';
import { ReviewCard } from './ReviewCard';
import { useTranslations } from '@/lib/hooks/use-translations';

const STAR_LEVELS = [5, 4, 3, 2, 1] as const;

export function ProductReviewsSection({ productId }: { productId: string }) {
  const [page, setPage] = useState(1);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const { locale, t } = useTranslations();
  const reviewsQuery = useQuery({
    queryKey: ['product-reviews', productId, page],
    queryFn: () => reviewsApi.getProductReviews(productId, { limit: 5, page }).then((response) => response.data.data),
  });

  const reviews = reviewsQuery.data?.items ?? [];
  const aggregate = reviewsQuery.data?.aggregate ?? {
    count: 0,
    averageRating: null,
    distribution: {
      1: { count: 0, percentage: 0 }, 2: { count: 0, percentage: 0 },
      3: { count: 0, percentage: 0 }, 4: { count: 0, percentage: 0 },
      5: { count: 0, percentage: 0 },
    },
  };
  const average = Number(aggregate.averageRating ?? 0).toFixed(1);
  const pagination = reviewsQuery.data?.pagination;

  return (
    <section className="mt-24 border-t border-neutral-200 pt-16 dark:border-neutral-800 md:mt-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 px-6 md:grid-cols-12 lg:gap-16 lg:px-12">
        <div className="flex flex-col space-y-8 md:sticky md:top-32 md:col-span-4">
          <div>
            <h2 className="mb-6 font-serif text-3xl text-neutral-900 dark:text-neutral-100">{t('reviews.customerReviews')}</h2>
            <span className="mb-4 block font-serif text-7xl leading-none tracking-tighter">{average}</span>
            <div className="mb-3 flex items-center gap-1.5" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((star) => <Star key={star} className={`size-5 ${star <= Math.round(Number(average)) ? 'fill-amber-500 text-amber-500' : 'fill-neutral-200 text-neutral-200 dark:fill-neutral-800 dark:text-neutral-800'}`} />)}
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">{t('reviews.basedOn', { count: aggregate.count })}</span>
            <div className="mt-6 space-y-2" aria-label={t('reviews.distribution')}>
              {STAR_LEVELS.map((star) => {
                const bucket = aggregate.distribution[star];
                return <div key={star} className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 text-xs"><span className="text-muted-foreground" dir="ltr">{star} ★</span><div className="h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800"><div className="h-full rounded-full bg-amber-500" style={{ width: `${bucket.percentage}%` }} /></div><span className="min-w-16 text-end text-muted-foreground" dir="ltr">{new Intl.NumberFormat(locale === 'ar' ? 'ar-TN' : 'en-TN', { maximumFractionDigits: 1 }).format(bucket.percentage)}% ({bucket.count})</span></div>;
              })}
            </div>
          </div>
          <div className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
            <p>{t(isAuthenticated ? 'reviews.deliveredOrderOnly' : 'reviews.signInOrderOnly')}</p>
            <Link href={isAuthenticated ? '/account/orders' : '/login'} className="mt-3 inline-flex font-semibold text-foreground underline underline-offset-4">{t(isAuthenticated ? 'reviews.viewOrders' : 'header.signIn')}</Link>
          </div>
        </div>

        <div className="md:col-span-8 md:ps-8 lg:ps-12">
          {reviewsQuery.isLoading ? <div className="animate-pulse space-y-12">{[1, 2, 3].map((item) => <div key={item} className="h-32 bg-neutral-100 dark:bg-neutral-900" />)}</div>
            : reviews.length ? <div>{reviews.map((review) => <ReviewCard key={review.id} review={review} />)}</div>
              : <div className="py-20"><p className="mb-2 font-serif text-2xl">{t('reviews.none')}</p><p className="text-sm text-neutral-500">{t('reviews.noneCopy')}</p></div>}
          {pagination && pagination.totalPages > 1 && <div className="flex items-center gap-2 pt-8">
            <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} aria-label={t('common.previous')} className="flex size-10 items-center justify-center rounded-full disabled:opacity-50"><ChevronLeft className="size-4 rtl:rotate-180" /></button>
            {Array.from({ length: pagination.totalPages }, (_, index) => <button type="button" key={index} onClick={() => setPage(index + 1)} aria-label={t('reviews.page', { page: index + 1 })} className={`flex size-8 items-center justify-center rounded-full text-xs font-semibold ${page === index + 1 ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-neutral-400'}`}>{index + 1}</button>)}
            <button type="button" onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))} disabled={page === pagination.totalPages} aria-label={t('common.next')} className="flex size-10 items-center justify-center rounded-full disabled:opacity-50"><ChevronRight className="size-4 rtl:rotate-180" /></button>
          </div>}
        </div>
      </div>
    </section>
  );
}

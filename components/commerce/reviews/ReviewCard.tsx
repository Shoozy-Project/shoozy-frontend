import { Star } from 'lucide-react';
import type { PublicReviewDto } from '@/lib/api/reviews';
import { useTranslations } from '@/lib/hooks/use-translations';

export function ReviewCard({ review }: { review: PublicReviewDto }) {
  const { locale, t } = useTranslations();
  const formattedDate = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-TN' : 'en-TN', { dateStyle: 'medium' }).format(new Date(review.createdAt));
  return <article className="mb-8 flex flex-col gap-3 border-b border-neutral-200 pb-8 last:mb-0 last:border-0 last:pb-0 dark:border-neutral-800">
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2"><span className="text-xs font-bold uppercase tracking-widest">{review.reviewer?.firstName || t('reviews.anonymous')} {review.reviewer?.lastInitial ? `${review.reviewer.lastInitial}.` : ''}</span><span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">•</span><time className="text-[10px] uppercase tracking-widest text-neutral-500">{formattedDate}</time></div>
      <div className="mt-1 flex items-center gap-0.5" aria-label={t('reviews.ratingOutOfFive', { rating: review.rating })}>{[1, 2, 3, 4, 5].map((star) => <Star key={star} className={`size-3.5 ${star <= review.rating ? 'fill-amber-500 text-amber-500' : 'fill-neutral-100 text-neutral-200 dark:fill-neutral-800 dark:text-neutral-800'}`} />)}</div>
    </div>
    <div className="mt-2 space-y-2">{review.title && <h3 className="font-serif text-lg">{review.title}</h3>}{review.body && <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{review.body}</p>}</div>
  </article>;
}

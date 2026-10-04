import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore, selectIsAuthenticated } from '@/stores/auth-store';
import { toast } from 'sonner';
import { useTranslations } from '@/lib/hooks/use-translations';

interface ReviewFormProps {
  onSubmit: (data: { rating: number; title: string; body: string }) => Promise<void>;
  initialData?: { rating: number; title: string; body: string } | null;
  onCancel?: () => void;
  isLoading: boolean;
}

export function ReviewForm({ onSubmit, initialData, onCancel, isLoading }: ReviewFormProps) {
  const { t } = useTranslations();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState(initialData?.title || '');
  const [body, setBody] = useState(initialData?.body || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error(t('reviews.loginRequired'));
      return;
    }
    if (rating === 0) {
      toast.error(t('reviews.ratingRequired'));
      return;
    }
    if (body.trim().length < 10) {
      toast.error(t('reviews.bodyMin'));
      return;
    }
    if (title.trim().length > 0 && title.trim().length < 3) {
      toast.error(t('reviews.titleMin'));
      return;
    }
    
    await onSubmit({ rating: Number(rating), title: title.trim(), body: body.trim() });
    if (!initialData) {
      setRating(0);
      setTitle('');
      setBody('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-neutral-50 dark:bg-neutral-900/50 p-6 md:p-8 rounded-2xl border border-neutral-100 dark:border-neutral-800">
      <div>
        <label className="mb-3 block text-xs font-semibold uppercase tracking-widest text-neutral-500">{t('reviews.overallRating')} *</label>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button" aria-label={t('reviews.setRating', { rating: star })} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(star)}>
              <Star className={`h-8 w-8 transition-all duration-200 ${star <= (hoverRating || rating) ? 'scale-110 fill-amber-500 text-amber-500' : 'fill-neutral-200 text-neutral-200 hover:scale-110 dark:fill-neutral-800 dark:text-neutral-800'}`} />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-neutral-500">{t('reviews.title')}</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('reviews.titlePlaceholder')}
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all shadow-sm"
          />
        </div>

        <div>
          <label htmlFor="body" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-neutral-500">{t('reviews.body')} *</label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={4}
            placeholder={t('reviews.bodyPlaceholder')}
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-none transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button 
          type="submit" 
          disabled={isLoading || rating === 0 || body.trim() === ''} 
          className="px-8 py-6 rounded-xl font-medium tracking-wide shadow-md hover:shadow-lg transition-all"
        >
          {isLoading ? t('reviews.submitting') : initialData ? t('reviews.update') : t('reviews.submit')}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="px-6 py-6 rounded-xl">
            {t('common.cancel')}
          </Button>
        )}
      </div>
      
      {!isAuthenticated && (
        <p className="mt-4 text-xs text-neutral-500">{t('reviews.loginRequired')}</p>
      )}
    </form>
  );
}

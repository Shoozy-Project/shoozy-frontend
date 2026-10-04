'use client';

import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { CommerceImage } from '@/components/commerce/CommerceImage';
import { Button } from '@/components/ui/button';
import { commerceErrorMessage } from '@/lib/api/errors';
import { formatMinorMoney } from '@/lib/format-money';
import { useWishlist, useWishlistMutation } from '@/lib/hooks/use-commerce';
import { selectIsAuthenticated, useAuthStore } from '@/stores/auth-store';
import { useTranslations } from '@/lib/hooks/use-translations';

export function WishlistPageClient() {
  const authenticated = useAuthStore(selectIsAuthenticated);
  const initialized = useAuthStore((state) => state.isInitialized);
  const wishlist = useWishlist();
  const mutation = useWishlistMutation();
  const { locale, t } = useTranslations();
  const intlLocale = locale === 'ar' ? 'ar-TN' : 'en-TN';

  if (!initialized || (authenticated && wishlist.isLoading)) return <p className="py-20 text-center text-muted-foreground">{t('wishlist.loading')}</p>;
  if (!authenticated) return <div className="rounded-xl border border-dashed px-6 py-20 text-center"><h2 className="font-serif text-3xl">{t('wishlist.signInTitle')}</h2><Button asChild className="mt-7"><Link href="/login">{t('header.signIn')}</Link></Button></div>;
  if (wishlist.isError) return <div className="rounded-xl border p-10 text-center"><p>{t('wishlist.loadError')}</p><Button variant="outline" className="mt-5" onClick={() => wishlist.refetch()}>{t('common.retry')}</Button></div>;
  if (!wishlist.data?.length) return <div className="rounded-xl border border-dashed px-6 py-20 text-center"><h2 className="font-serif text-3xl">{t('wishlist.empty')}</h2><p className="mt-3 text-muted-foreground">{t('wishlist.emptyCopy')}</p><Button asChild className="mt-7"><Link href="/products">{t('wishlist.browse')}</Link></Button></div>;

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {wishlist.data.map((item) => (
        <article key={item.id} className="relative">
          {item.product ? (
            <>
              <Link href={`/products/${item.product.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-muted"><CommerceImage src={item.product.primaryMedia?.url} alt={item.product.primaryMedia?.altText || item.product.name} sizes="(max-width: 640px) 100vw, 25vw" className="object-contain p-4 transition-transform group-hover:scale-105" /></div>
                <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">{item.product.brand.name}</p>
                <h2 className="mt-1 font-serif text-xl">{item.product.name}</h2>
                {item.variant && <p className="mt-2 text-sm font-medium">{formatMinorMoney(item.variant.priceMinor, 'TND', 3, intlLocale)}</p>}
              </Link>
              <Button size="icon" variant="secondary" className="absolute end-3 top-3 rounded-full" aria-label={t('wishlist.removeItem', { name: item.product.name })} disabled={mutation.isPending} onClick={() => mutation.mutate({ productId: item.productId, wishlistItemId: item.id }, { onSuccess: () => toast.success(t('wishlist.removed')), onError: (error) => toast.error(commerceErrorMessage(error)) })}><Trash2 /></Button>
            </>
          ) : <div className="rounded-xl border border-dashed p-6"><p className="text-sm text-muted-foreground">{t('wishlist.productUnavailable')}</p><Button variant="ghost" className="mt-3" onClick={() => mutation.mutate({ productId: item.productId, wishlistItemId: item.id })}>{t('common.remove')}</Button></div>}
        </article>
      ))}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { HoverMedia } from '@/components/commerce/HoverMedia';
import { WishlistButton } from '@/components/commerce/WishlistButton';
import { formatMinorMoney } from '@/lib/format-money';
import type { CatalogProductDto } from '@/types/commerce';
import { useTranslations } from '@/lib/hooks/use-translations';

export function ProductCard({ product }: { product: CatalogProductDto }) {
  const { locale, t } = useTranslations();
  const intlLocale = locale === 'ar' ? 'ar-TN' : 'en-TN';
  const promotion = product.promotionalPricing;
  const price = product.minimumEffectivePriceMinor ?? product.minimumVariantPriceMinor;
  const percent = promotion ? Number(promotion.discountPercentageBasisPoints) / 100 : 0;
  const endsAt = promotion?.promotions.map((item) => item.endsAt).filter((value): value is string => Boolean(value)).sort()[0];
  return (
    <article className="group relative flex min-w-0 flex-col">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
        <Link href={`/products/${product.slug}`} className="absolute inset-0" aria-label={t('product.view', { name: product.name })}>
          <HoverMedia imageUrl={product.primaryMedia?.url} videoUrl={product.previewVideo?.url} videoMimeType={product.previewVideo?.mimeType} alt={product.primaryMedia?.altText || product.name} sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" mediaClassName="object-cover object-center" />
        </Link>
        <WishlistButton productId={product.id} className="absolute end-3 top-3 z-20" />
        {promotion && percent > 0 && <span className="absolute start-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white">−{new Intl.NumberFormat(intlLocale, { maximumFractionDigits: 1 }).format(percent)}%</span>}
        {!product.inStock && (
          <span className="absolute bottom-3 start-3 bg-background/90 px-2 py-1 text-xs font-medium uppercase tracking-wide">{t('catalog.outOfStock')}</span>
        )}
      </div>
      <Link href={`/products/${product.slug}`} className="flex flex-1 flex-col gap-1 pt-4">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{product.brand.name}</span>
        <h2 className="font-serif text-lg leading-tight transition-colors group-hover:text-foreground/70">{product.name}</h2>
        {product.shortDescription && <p className="line-clamp-2 text-sm text-muted-foreground">{product.shortDescription}</p>}
        <div className="mt-2 flex flex-wrap items-baseline gap-2 text-sm"><span className="font-semibold">{price ? formatMinorMoney(price, 'TND', 3, intlLocale) : t('catalog.priceUnavailable')}</span>{promotion && <span className="text-xs text-muted-foreground line-through">{formatMinorMoney(promotion.originalPriceMinor, 'TND', 3, intlLocale)}</span>}</div>
        {endsAt && <time dateTime={endsAt} className="mt-1 text-xs text-red-700 dark:text-red-400">{t('catalog.offerEnds', { date: new Intl.DateTimeFormat(intlLocale, { dateStyle: 'medium' }).format(new Date(endsAt)) })}</time>}
      </Link>
    </article>
  );
}

'use client';

import Link from 'next/link';
import { HoverMedia } from '@/components/commerce/HoverMedia';
import { WishlistButton } from '@/components/commerce/WishlistButton';
import { formatMinorMoney } from '@/lib/format-money';
import { resolveProductColor } from '@/lib/product-colors';
import type { CatalogProductDto } from '@/types/commerce';
import { useTranslations } from '@/lib/hooks/use-translations';

export function ProductCard({ product }: { product: CatalogProductDto }) {
  const { locale, t } = useTranslations();
  const intlLocale = locale === 'ar' ? 'ar-TN' : 'en-TN';
  const promotion = product.promotionalPricing;
  const price = product.minimumEffectivePriceMinor ?? product.minimumVariantPriceMinor;
  const percent = promotion ? Number(promotion.discountPercentageBasisPoints) / 100 : 0;
  const colors = product.previewColors ?? [];
  const remainingColors = Math.max(0, (product.colorCount ?? colors.length) - colors.length);
  return (
    <article className="group relative flex h-full min-w-0 flex-col border border-border/70 bg-card text-card-foreground">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
        <Link href={`/products/${product.slug}`} className="absolute inset-0" aria-label={t('product.view', { name: product.name })}>
          <HoverMedia imageUrl={product.primaryMedia?.url} previewImages={product.previewImages} videoUrl={product.previewVideo?.url} videoMimeType={product.previewVideo?.mimeType} alt={product.primaryMedia?.altText || product.name} sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" mediaClassName="object-cover object-center" />
        </Link>
        <WishlistButton productId={product.id} className="absolute end-3 top-3 z-20" />
        {!product.inStock && (
          <span className="absolute bottom-3 start-3 z-10 bg-background/90 px-2 py-1 text-xs font-medium uppercase tracking-wide text-foreground backdrop-blur-sm">{t('catalog.outOfStock')}</span>
        )}
        {colors.length > 0 && (
          <div className="absolute bottom-3 end-3 z-10 flex items-center gap-1.5 rounded-full border border-border/60 bg-background/85 px-2 py-1.5 text-foreground shadow-sm backdrop-blur-sm" aria-label={colors.map((color) => color.displayValue).join(', ')}>
            {colors.map((color) => (
              <span
                key={color.value.toLocaleLowerCase('en-US')}
                role="img"
                aria-label={color.displayValue}
                title={color.displayValue}
                className="size-3.5 rounded-full border border-black/30 shadow-[0_0_0_1px_rgba(255,255,255,0.4)] dark:border-white/50"
                style={{ backgroundColor: resolveProductColor(color.colorHex, color.displayValue || color.value) }}
              />
            ))}
            {remainingColors > 0 && (
              <span className="ms-0.5 text-[10px] font-semibold leading-none" aria-label={t('catalog.moreColors', { count: remainingColors })} title={t('catalog.moreColors', { count: remainingColors })}>
                +{new Intl.NumberFormat(intlLocale).format(remainingColors)}
              </span>
            )}
          </div>
        )}
      </div>
      <Link href={`/products/${product.slug}`} className="flex flex-1 flex-col p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{product.brand.name}</span>
        <h2 className="mt-1 line-clamp-2 font-serif text-lg leading-tight text-foreground transition-colors group-hover:text-foreground/70">{product.name}</h2>
        <div className="mt-auto pt-4">
          <span className="block text-base font-semibold text-foreground">{price !== null ? formatMinorMoney(price, 'TND', 3, intlLocale) : t('catalog.priceUnavailable')}</span>
          {promotion && percent > 0 && (
            <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-xs text-muted-foreground line-through">{formatMinorMoney(promotion.originalPriceMinor, 'TND', 3, intlLocale)}</span>
              <span className="text-xs font-semibold text-red-700 dark:text-red-400">-{new Intl.NumberFormat(intlLocale, { maximumFractionDigits: 1 }).format(percent)}%</span>
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}

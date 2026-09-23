'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { CommerceImage } from '@/components/commerce/CommerceImage';
import { WishlistButton } from '@/components/commerce/WishlistButton';
import { Button } from '@/components/ui/button';
import { commerceErrorMessage } from '@/lib/api/errors';
import { formatMinorMoney } from '@/lib/format-money';
import { useAddToCart } from '@/lib/hooks/use-commerce';
import { cn } from '@/lib/utils';
import type { CatalogMediaDto, CatalogProductDetailDto, CatalogVariantDto, SizeGuideDto } from '@/types/commerce';
import { useTranslations } from '@/lib/hooks/use-translations';

function hasSelection(variant: CatalogVariantDto, optionId: string, valueId: string) {
  return variant.optionValues.some((value) => value.optionId === optionId && value.id === valueId);
}

function Media({ media, name, priority = false }: { media: CatalogMediaDto; name: string; priority?: boolean }) {
  const { t } = useTranslations();
  if (media.type === 'VIDEO') {
    return <video src={media.url} controls className="h-full w-full object-contain" aria-label={media.altText || t('product.video', { name })} />;
  }
  return <CommerceImage src={media.url} alt={media.altText || name} sizes="(max-width: 768px) 100vw, 55vw" priority={priority} className="object-contain p-4" />;
}

export function ProductDetailClient({ product, sizeGuide }: { product: CatalogProductDetailDto; sizeGuide: SizeGuideDto | null }) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [directVariantId, setDirectVariantId] = useState(product.options.length === 0 && product.variants.length === 1 ? product.variants[0]!.id : '');
  const [quantity, setQuantity] = useState(1);
  const addToCart = useAddToCart();
  const { locale, t } = useTranslations();
  const intlLocale = locale === 'ar' ? 'ar-TN' : 'en-TN';

  const selectedVariant = useMemo(() => {
    if (product.options.length === 0) return product.variants.find((variant) => variant.id === directVariantId);
    if (Object.keys(selected).length !== product.options.length) return undefined;
    return product.variants.find((variant) => product.options.every((option) => hasSelection(variant, option.id, selected[option.id]!)));
  }, [directVariantId, product.options, product.variants, selected]);

  const media = useMemo(() => {
    if (!selectedVariant) return product.media;
    const variantMedia = product.media.filter((item) => item.variantId === selectedVariant.id);
    const sharedMedia = product.media.filter((item) => !item.variantId);
    return [...variantMedia, ...sharedMedia];
  }, [product.media, selectedVariant]);
  const [activeMediaId, setActiveMediaId] = useState<string | null>(media[0]?.id ?? null);
  const activeMedia = media.find((item) => item.id === activeMediaId) ?? media[0];

  const lowestVariant = useMemo(() => product.variants.reduce<CatalogVariantDto | undefined>((lowest, variant) => !lowest || BigInt(variant.priceMinor) < BigInt(lowest.priceMinor) ? variant : lowest, undefined), [product.variants]);
  const priceVariant = selectedVariant ?? lowestVariant;
  const promotionalPricing = priceVariant?.promotionalPricing;
  const selectionComplete = Boolean(selectedVariant);
  const canAdd = Boolean(selectedVariant && selectedVariant.stockQuantity >= quantity && quantity > 0);

  const valuePossible = (optionId: string, valueId: string) => product.variants.some((variant) => {
    if (!hasSelection(variant, optionId, valueId)) return false;
    return Object.entries(selected).every(([selectedOptionId, selectedValueId]) => selectedOptionId === optionId || hasSelection(variant, selectedOptionId, selectedValueId));
  });

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,.8fr)] lg:gap-16">
      <section aria-label={t('product.gallery')} className="min-w-0">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {activeMedia ? <Media media={activeMedia} name={product.name} priority /> : <CommerceImage src={null} alt={product.name} sizes="100vw" />}
        </div>
        {media.length > 1 && (
          <div className="mt-3 grid grid-cols-5 gap-3 sm:grid-cols-6">
            {media.map((item) => (
              <button key={item.id} type="button" onClick={() => setActiveMediaId(item.id)} aria-label={t('product.showMedia', { name: item.altText || product.name })} aria-pressed={activeMedia?.id === item.id} className={cn('relative aspect-square overflow-hidden border bg-muted', activeMedia?.id === item.id ? 'border-foreground ring-1 ring-foreground' : 'border-transparent')}>
                {item.type === 'VIDEO' ? <video src={item.url} muted className="h-full w-full object-cover" /> : <CommerceImage src={item.url} alt="" sizes="120px" className="object-contain p-1" />}
              </button>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-start justify-between gap-5">
          <div>
            <Link href={`/products?brand=${encodeURIComponent(product.brand.slug)}`} className="text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground">{product.brand.name}</Link>
            <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">{product.name}</h1>
          </div>
          <WishlistButton productId={product.id} variantId={selectedVariant?.id} />
        </div>
        {product.shortDescription && <p className="mt-4 text-muted-foreground">{product.shortDescription}</p>}
        <div className="mt-6 flex items-baseline gap-3">
          <span className="text-xl font-semibold">{promotionalPricing ? formatMinorMoney(promotionalPricing.effectivePriceMinor, 'TND', 3, intlLocale) : priceVariant ? formatMinorMoney(priceVariant.priceMinor, 'TND', 3, intlLocale) : t('catalog.priceUnavailable')}</span>
          {promotionalPricing ? <span className="text-sm text-muted-foreground line-through">{formatMinorMoney(promotionalPricing.originalPriceMinor, 'TND', 3, intlLocale)}</span> : selectedVariant?.compareAtPriceMinor && BigInt(selectedVariant.compareAtPriceMinor) > BigInt(selectedVariant.priceMinor) ? <span className="text-sm text-muted-foreground line-through">{formatMinorMoney(selectedVariant.compareAtPriceMinor, 'TND', 3, intlLocale)}</span> : null}
          {promotionalPricing && <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">−{(Number(promotionalPricing.discountPercentageBasisPoints) / 100).toFixed(0)}%</span>}
        </div>
        {promotionalPricing?.promotions[0] && <p className="mt-2 text-xs text-red-700 dark:text-red-400">{promotionalPricing.promotions.map((promotion) => promotion.name).join(' + ')}{promotionalPricing.promotions[0].endsAt ? ` · ${t('product.offerEnds', { date: new Intl.DateTimeFormat(intlLocale, { dateStyle: 'medium' }).format(new Date(promotionalPricing.promotions[0].endsAt)) })}` : ''}</p>}

        <div className="mt-8 space-y-7">
          {product.options.length === 0 && product.variants.length > 1 && (
            <fieldset>
              <legend className="mb-3 text-sm font-medium">{t('product.variant')}</legend>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => <button key={variant.id} type="button" disabled={variant.stockQuantity <= 0} aria-pressed={directVariantId === variant.id} onClick={() => setDirectVariantId(variant.id)} className={cn('rounded-lg border px-3 py-2 text-sm', directVariantId === variant.id ? 'border-primary bg-primary text-primary-foreground' : 'hover:border-foreground', variant.stockQuantity <= 0 && 'opacity-35 line-through')}>{variant.sku || variant.title}</button>)}
              </div>
            </fieldset>
          )}
          {product.options.map((option) => (
            <fieldset key={option.id}>
              <legend className="mb-3 text-sm font-medium">{option.name}</legend>
              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => {
                  const possible = valuePossible(option.id, value.id);
                  const chosen = selected[option.id] === value.id;
                  const label = value.displayValue || value.value;
                  return (
                    <button
                      key={value.id}
                      type="button"
                      disabled={!possible}
                      aria-pressed={chosen}
                      onClick={() => setSelected((current) => ({ ...current, [option.id]: value.id }))}
                      className={cn('flex min-h-10 items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors', chosen ? 'border-primary bg-primary text-primary-foreground' : 'hover:border-foreground', !possible && 'cursor-not-allowed opacity-35 line-through')}
                    >
                      {value.colorHex && <span className="size-4 rounded-full border border-foreground/20" style={{ backgroundColor: value.colorHex }} aria-hidden="true" />}
                      {label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="mt-8 rounded-xl border p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">{!selectionComplete ? t('product.chooseOptions') : selectedVariant && selectedVariant.stockQuantity > 0 ? t('product.available', { count: selectedVariant.stockQuantity }) : t('catalog.outOfStock')}</p>
              {selectedVariant?.sku && <p className="mt-1 text-xs text-muted-foreground">{t('product.sku', { sku: selectedVariant.sku })}</p>}
            </div>
            <div className="flex items-center rounded-lg border" aria-label={t('product.quantity')}>
              <button type="button" className="p-2" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity <= 1} aria-label={t('product.decrease')}><Minus className="size-4" /></button>
              <span className="min-w-9 text-center text-sm" aria-live="polite">{quantity}</span>
              <button type="button" className="p-2" onClick={() => setQuantity((value) => Math.min(selectedVariant?.stockQuantity ?? value + 1, value + 1))} disabled={!selectedVariant || quantity >= selectedVariant.stockQuantity} aria-label={t('product.increase')}><Plus className="size-4" /></button>
            </div>
          </div>
          <Button
            className="mt-4 h-12 w-full"
            disabled={!canAdd || addToCart.isPending}
            onClick={() => selectedVariant && addToCart.mutate({ variantId: selectedVariant.id, quantity }, {
              onSuccess: () => toast.success(t('product.added')),
              onError: (error) => toast.error(commerceErrorMessage(error, t('product.addError'))),
            })}
          >
            <ShoppingBag /> {addToCart.isPending ? t('product.adding') : t('product.add')}
          </Button>
        </div>

        <div className="mt-8 space-y-5 border-t pt-8 text-sm">
          {product.description && <div><h2 className="font-medium">{t('product.description')}</h2><p className="mt-2 whitespace-pre-line text-muted-foreground">{product.description}</p></div>}
          {product.material && <div><h2 className="font-medium">{t('product.material')}</h2><p className="mt-1 text-muted-foreground">{product.material}</p></div>}
          {product.categories.length > 0 && <div className="flex flex-wrap gap-2">{product.categories.map((category) => <Link key={category.id} href={`/categories/${category.slug}`} className="rounded-full border px-3 py-1 text-xs hover:bg-muted">{category.name}</Link>)}</div>}
        </div>

        {sizeGuide && (
          <details className="mt-8 rounded-xl border p-4">
            <summary className="cursor-pointer font-medium">{sizeGuide.name}</summary>
            {sizeGuide.notes && <p className="mt-3 text-sm text-muted-foreground">{sizeGuide.notes}</p>}
            {sizeGuide.entries.length > 0 && <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[420px] text-start text-sm"><thead><tr className="border-b"><th className="py-2">EU</th><th>US</th><th>UK</th><th>{t('product.footLength')}</th></tr></thead><tbody>{sizeGuide.entries.map((entry) => <tr key={entry.id} className="border-b last:border-0"><td className="py-2">{entry.euSize ?? '—'}</td><td>{entry.usSize ?? '—'}</td><td>{entry.ukSize ?? '—'}</td><td>{entry.footLengthCm ? `${entry.footLengthCm} cm` : '—'}</td></tr>)}</tbody></table></div>}
          </details>
        )}
      </section>
    </div>
  );
}

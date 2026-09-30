'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { CommerceImage } from '@/components/commerce/CommerceImage';
import { WishlistButton } from '@/components/commerce/WishlistButton';
import { commerceErrorMessage } from '@/lib/api/errors';
import { formatMinorMoney } from '@/lib/format-money';
import { useAddToCart } from '@/lib/hooks/use-commerce';
import { cn } from '@/lib/utils';
import type { CatalogMediaDto, CatalogProductDetailDto, CatalogVariantDto, SizeGuideDto } from '@/types/commerce';
import { useTranslations } from '@/lib/hooks/use-translations';
import { ProductReviewsSection } from './reviews/ProductReviewsSection';
import { RelatedProductsSection } from './RelatedProductsSection';
import { motion, AnimatePresence } from 'framer-motion';

function hasSelection(variant: CatalogVariantDto, optionId: string, valueId: string) {
  return variant.optionValues.some((value) => value.optionId === optionId && value.id === valueId);
}

// ─── Animated Accordion ──────────────────────────────────────────────────────
function Accordion({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-neutral-200 dark:border-neutral-800 py-4 first:border-t-0">
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="flex w-full items-center justify-between text-left focus:outline-none group">
        <span className="text-xs font-semibold uppercase tracking-widest text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-500 transition-colors">{title}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="text-lg font-light text-neutral-400 dark:text-neutral-500"
        >
          {isOpen ? '−' : '+'}
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-4 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main PDP Component ───────────────────────────────────────────────────────
export function ProductDetailClient({ product, sizeGuide }: { product: CatalogProductDetailDto; sizeGuide: SizeGuideDto | null }) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [directVariantId, setDirectVariantId] = useState(product.options.length === 0 && product.variants.length === 1 ? product.variants[0]!.id : '');
  const [quantity, setQuantity] = useState(1);
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);
  const addToCart = useAddToCart();
  const { locale, t } = useTranslations();
  const intlLocale = locale === 'ar' ? 'ar-TN' : 'en-TN';

  const selectedVariant = useMemo(() => {
    if (product.options.length === 0) return product.variants.find((variant) => variant.id === directVariantId);
    if (Object.keys(selected).length !== product.options.length) return undefined;
    return product.variants.find((variant) => product.options.every((option) => hasSelection(variant, option.id, selected[option.id]!)));
  }, [directVariantId, product.options, product.variants, selected]);

  // Derive media based on color/variant selection
  const media = useMemo(() => {
    if (!selectedVariant) return product.media;
    const variantMedia = product.media.filter((item) => item.variantId === selectedVariant.id);
    const sharedMedia = product.media.filter((item) => !item.variantId);
    return [...variantMedia, ...sharedMedia];
  }, [product.media, selectedVariant]);

  const lowestVariant = useMemo(() => product.variants.reduce<CatalogVariantDto | undefined>((lowest, variant) => !lowest || BigInt(variant.priceMinor) < BigInt(lowest.priceMinor) ? variant : lowest, undefined), [product.variants]);
  const priceVariant = selectedVariant ?? lowestVariant;
  const promotionalPricing = priceVariant?.promotionalPricing;
  const selectionComplete = Boolean(selectedVariant);
  const canAdd = Boolean(selectedVariant && selectedVariant.stockQuantity >= quantity && quantity > 0);

  const valuePossible = (optionId: string, valueId: string) => product.variants.some((variant) => {
    if (!hasSelection(variant, optionId, valueId)) return false;
    return Object.entries(selected).every(([selectedOptionId, selectedValueId]) => selectedOptionId === optionId || hasSelection(variant, selectedOptionId, selectedValueId));
  });

  const scrollToImage = (id: string) => {
    const el = document.getElementById(`media-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Mobile scroll tracking for dots
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollPosition = target.scrollLeft;
    const itemWidth = target.clientWidth;
    const newIndex = Math.round(scrollPosition / itemWidth);
    if (newIndex !== activeMobileIndex) {
      setActiveMobileIndex(newIndex);
    }
  };

  // Find active color name
  const colorOption = product.options.find(o => o.name.toLowerCase() === 'color' || o.name.toLowerCase() === 'couleur');
  const activeColorValue = colorOption?.values.find(v => selected[colorOption.id] === v.id);

  return (
    <div className="w-full bg-white dark:bg-[#0c0c0d]">
      <div className="mx-auto max-w-screen-2xl">
        <div className="grid grid-cols-1 md:grid-cols-12 md:gap-8 lg:gap-12 relative items-start">
          
          {/* ── COL 1: THUMBNAILS (Desktop Only) ── */}
          <div className="hidden md:flex flex-col gap-3 md:col-span-1 lg:col-span-1 sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide pt-6 pl-4 lg:pl-8">
            <AnimatePresence mode="popLayout">
              {media.map((item, index) => (
                <motion.button
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  key={item.id}
                  onClick={() => scrollToImage(item.id)}
                  className="w-full aspect-[4/5] bg-neutral-100 dark:bg-neutral-900 border border-transparent hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors rounded-sm overflow-hidden shrink-0"
                >
                  {item.type === 'VIDEO' ? (
                    <video src={item.url} muted className="h-full w-full object-cover" />
                  ) : (
                    <CommerceImage src={item.url} alt="" sizes="100px" className="object-cover w-full h-full" />
                  )}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          {/* ── COL 2: MAIN IMAGES (Desktop Stack / Mobile Carousel) ── */}
          <div className="md:col-span-6 lg:col-span-6 flex flex-col pt-0 md:pt-6 relative">
            
            {/* Mobile Wishlist Button */}
            <div className="absolute top-4 right-4 z-10 md:hidden">
              <WishlistButton productId={product.id} variantId={selectedVariant?.id} className="h-10 w-10 bg-white/70 backdrop-blur-md rounded-full shadow-sm" />
            </div>

            <div 
              onScroll={handleScroll}
              className="flex md:flex-col overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none scrollbar-hide md:gap-4 lg:gap-6 w-full aspect-[4/5] md:aspect-auto"
            >
              <AnimatePresence mode="popLayout">
                {media.map((item, index) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    id={`media-${item.id}`} 
                    key={item.id} 
                    className="w-full shrink-0 snap-center md:snap-align-none md:aspect-[4/5] bg-neutral-50 dark:bg-[#111] flex items-center justify-center relative"
                  >
                    {item.type === 'VIDEO' ? (
                      <video src={item.url} controls autoPlay loop muted playsInline className="h-full w-full object-cover" />
                    ) : (
                      <CommerceImage src={item.url} alt={item.altText || product.name} sizes="(max-width: 768px) 100vw, 50vw" priority={index === 0} className="object-cover w-full h-full" />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Mobile Carousel Dots */}
            <div className="md:hidden flex justify-center gap-2 mt-4">
              {media.map((_, i) => (
                <div key={i} className={cn("h-1 rounded-full transition-all duration-300", activeMobileIndex === i ? "w-4 bg-black dark:bg-white" : "w-1 bg-neutral-300 dark:bg-neutral-700")} />
              ))}
            </div>
          </div>

          {/* ── COL 3: PRODUCT INFO (Right Panel) ── */}
          <div className="md:col-span-5 lg:col-span-5 px-5 md:px-8 lg:px-12 pt-8 md:pt-6 pb-32 md:pb-24">
            <div className="md:sticky md:top-28 max-w-lg mx-auto md:mx-0">
              
              {/* Brand & Title */}
              <div className="flex items-start justify-between">
                <div>
                  <Link href={`/products?brand=${encodeURIComponent(product.brand.slug)}`} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 hover:text-black dark:hover:text-white transition-colors">
                    {product.brand.name}
                  </Link>
                  <h1 className="mt-2 font-serif text-3xl md:text-4xl text-neutral-900 dark:text-white leading-tight tracking-tight">
                    {product.name}
                  </h1>
                  <button 
                    onClick={() => {
                      const el = document.getElementById('customer-reviews');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="mt-3 flex items-center gap-2 text-xs text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
                  >
                    <span className="flex items-center text-amber-500">
                      {'★'.repeat(5)}
                    </span>
                    <span className="underline underline-offset-2">Read Reviews</span>
                  </button>
                </div>
                <div className="hidden md:block shrink-0 ml-4">
                  <WishlistButton productId={product.id} variantId={selectedVariant?.id} className="h-10 w-10 border border-neutral-200 dark:border-neutral-800 rounded-full hover:border-black dark:hover:border-white transition-colors" />
                </div>
              </div>

              {/* Price Row */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-lg font-bold text-neutral-900 dark:text-white">
                  {promotionalPricing ? formatMinorMoney(promotionalPricing.effectivePriceMinor, 'TND', 3, intlLocale) : priceVariant ? formatMinorMoney(priceVariant.priceMinor, 'TND', 3, intlLocale) : t('catalog.priceUnavailable')}
                </span>
                {(promotionalPricing || (selectedVariant?.compareAtPriceMinor && BigInt(selectedVariant.compareAtPriceMinor) > BigInt(selectedVariant.priceMinor))) && (
                  <span className="text-sm font-medium text-neutral-400 line-through">
                    {formatMinorMoney((promotionalPricing ? promotionalPricing.originalPriceMinor : selectedVariant!.compareAtPriceMinor)!, 'TND', 3, intlLocale)}
                  </span>
                )}
                {promotionalPricing && (
                  <span className="ml-2 bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    −{(Number(promotionalPricing.discountPercentageBasisPoints) / 100).toFixed(0)}%
                  </span>
                )}
              </div>

              {/* Category Pills */}
              {product.categories.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.categories.map((category) => (
                    <Link key={category.id} href={`/categories/${category.slug}`} className="text-[9px] uppercase tracking-widest font-semibold border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 px-2.5 py-1 rounded-sm hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-colors">
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}

              <div className="w-full h-px bg-neutral-100 dark:bg-neutral-900 my-8" />

              {/* ── SELECTORS ── */}
              <div className="space-y-8">
                {product.options.map((option) => {
                  const isColor = option.name.toLowerCase() === 'color' || option.name.toLowerCase() === 'couleur';
                  return (
                    <div key={option.id}>
                      {isColor ? (
                        <>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] uppercase tracking-widest font-semibold text-neutral-900 dark:text-white">Color:</span>
                            <span className="text-[10px] uppercase tracking-widest text-neutral-500">{activeColorValue?.displayValue || activeColorValue?.value || 'Select a color'}</span>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {option.values.map((value) => {
                              const possible = valuePossible(option.id, value.id);
                              const chosen = selected[option.id] === value.id;
                              return (
                                <button
                                  key={value.id}
                                  type="button"
                                  disabled={!possible}
                                  onClick={() => setSelected((current) => ({ ...current, [option.id]: value.id }))}
                                  title={value.displayValue || value.value}
                                  className={cn(
                                    'w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-700 transition-all duration-300',
                                    chosen ? 'ring-1 ring-offset-2 ring-black dark:ring-white dark:ring-offset-[#0c0c0d]' : 'hover:border-neutral-400 dark:hover:border-neutral-500 hover:scale-110',
                                    !possible && 'opacity-30 cursor-not-allowed relative after:absolute after:inset-0 after:w-full after:h-[1px] after:bg-red-500 after:-rotate-45 after:top-1/2 after:-translate-y-1/2'
                                  )}
                                  style={{ backgroundColor: value.colorHex || '#ccc' }}
                                />
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] uppercase tracking-widest font-semibold text-neutral-900 dark:text-white">{option.name}</span>
                            {sizeGuide && (
                              <button className="text-[9px] uppercase tracking-widest text-neutral-400 underline hover:text-black dark:hover:text-white transition-colors">
                                Size Guide
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            {option.values.map((value) => {
                              const possible = valuePossible(option.id, value.id);
                              const chosen = selected[option.id] === value.id;
                              return (
                                <button
                                  key={value.id}
                                  type="button"
                                  disabled={!possible}
                                  onClick={() => setSelected((current) => ({ ...current, [option.id]: value.id }))}
                                  className={cn(
                                    'relative h-11 flex items-center justify-center border text-xs font-medium tracking-wider transition-colors overflow-hidden',
                                    chosen ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-black dark:hover:border-white',
                                    !possible && 'opacity-40 cursor-not-allowed text-neutral-400 after:absolute after:inset-0 after:w-[150%] after:h-[1px] after:bg-neutral-400 dark:after:bg-neutral-600 after:top-1/2 after:left-[-25%] after:-rotate-12'
                                  )}
                                >
                                  {value.displayValue || value.value}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Desktop Add to Bag */}
              <div className="hidden md:block mt-10">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  disabled={!canAdd || addToCart.isPending}
                  onClick={() => selectedVariant && addToCart.mutate({ variantId: selectedVariant.id, quantity }, {
                    onSuccess: () => toast.success(t('product.added')),
                    onError: (error) => toast.error(commerceErrorMessage(error, t('product.addError'))),
                  })}
                  className="w-full py-4 bg-black dark:bg-white text-white dark:text-black uppercase tracking-widest text-xs font-semibold transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <ShoppingBag className="size-4" />
                  {addToCart.isPending ? 'Adding...' : 'Add To Bag'}
                </motion.button>
                {selectedVariant && selectedVariant.stockQuantity > 0 && selectedVariant.stockQuantity <= 5 && (
                  <p className="text-center mt-3 text-[10px] uppercase tracking-widest text-red-500 font-semibold">
                    Only {selectedVariant.stockQuantity} remaining
                  </p>
                )}
              </div>

              {/* ── ACCORDIONS ── */}
              <div className="mt-12 border-t border-neutral-200 dark:border-neutral-800">
                {product.description && (
                  <Accordion title="Description" defaultOpen>
                    {product.description}
                  </Accordion>
                )}
                {product.material && (
                  <Accordion title="Material & Care">
                    {product.material}
                  </Accordion>
                )}
                <Accordion title="Shipping & Returns">
                  Enjoy complimentary express shipping on all orders.
                  Returns are accepted within 30 days of delivery for a full refund.
                  Bespoke and customized items are final sale.
                </Accordion>
              </div>

            </div>
          </div>
        </div>

        {/* ── MOBILE STICKY ADD TO BAG ── */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0c0c0d]/95 backdrop-blur-xl border-t border-neutral-200 dark:border-neutral-900 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={!canAdd || addToCart.isPending}
            onClick={() => selectedVariant && addToCart.mutate({ variantId: selectedVariant.id, quantity }, {
              onSuccess: () => toast.success(t('product.added')),
              onError: (error) => toast.error(commerceErrorMessage(error, t('product.addError'))),
            })}
            className="w-full py-4 bg-black dark:bg-white text-white dark:text-black uppercase tracking-widest text-xs font-semibold transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <ShoppingBag className="size-4" />
            {addToCart.isPending ? 'Adding...' : 'Add To Bag'}
          </motion.button>
        </div>

      </div>

      <div id="customer-reviews">
        <ProductReviewsSection productId={product.id} />
      </div>
      <RelatedProductsSection currentProductId={product.id} categorySlug={product.categories[0]?.slug} />
    </div>
  );
}

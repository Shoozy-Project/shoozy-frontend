'use client';

import { useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { CommerceImage } from '@/components/commerce/CommerceImage';
import { WishlistButton } from '@/components/commerce/WishlistButton';
import { fetchCatalogProducts } from '@/lib/api/catalog';
import { useTranslations } from '@/lib/hooks/use-translations';

// ─── Luxury Product Card ──────────────────────────────────────────────────────
function RelatedProductCard({ product, index }: { product: any; index: number }) {
  const basePrice = Number(product.basePrice || product.minimumVariantPriceMinor || 0);
  const comparePrice = Number(product.compareAtPrice || 0);
  const hasDiscount = comparePrice > basePrice;
  const discountPercent = hasDiscount
    ? Math.round(((comparePrice - basePrice) / comparePrice) * 100)
    : 0;

  const formattedPrice = `${basePrice.toFixed(3)} TND`;
  const formattedComparePrice = hasDiscount ? `${comparePrice.toFixed(3)} TND` : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="shrink-0 w-[calc(70%-1rem)] sm:w-[calc(50%-1rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1rem)] snap-start flex flex-col group cursor-pointer"
    >
      <Link href={`/products/${product.slug}`} className="flex flex-col h-full">
        {/* ── Frameless Image Container ── */}
        <div className="relative aspect-[4/5] bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
          {/* Discount Badge */}
          {discountPercent > 0 && (
            <div className="absolute top-3 left-3 z-10 bg-white/90 dark:bg-black/90 backdrop-blur-md text-[10px] font-bold px-2 py-1 uppercase tracking-wider shadow-sm text-black dark:text-white">
              -{discountPercent}%
            </div>
          )}

          {/* Wishlist Button */}
          <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <WishlistButton
              productId={product.id}
              compact
              className="h-8 w-8 bg-white/80 dark:bg-black/60 backdrop-blur-md shadow-sm hover:bg-white dark:hover:bg-black border-0"
            />
          </div>

          {/* Product Image with Hover Zoom */}
          <CommerceImage
            src={product.primaryMedia?.url}
            alt={product.primaryMedia?.altText || product.name}
            sizes="(max-width: 768px) 70vw, 25vw"
            className="object-cover object-center w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>

        {/* ── Product Info (Left Aligned) ── */}
        <div className="flex flex-col gap-1 mt-4">
          {/* Brand */}
          <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-medium">
            {product.brand?.name || 'Shoezy'}
          </span>

          {/* Product Name */}
          <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate mt-1">
            {product.name}
          </h3>

          {/* Pricing Row */}
          <div className="flex items-baseline mt-1">
            <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              {formattedPrice}
            </span>
            {hasDiscount && formattedComparePrice && (
              <span className="text-xs text-neutral-400 line-through ml-2">
                {formattedComparePrice}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Main Section Component ───────────────────────────────────────────────────
export function RelatedProductsSection({ currentProductId, categorySlug }: { currentProductId: string, categorySlug?: string }) {
  const { t } = useTranslations();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Fetch related products (using category slug if available)
  const { data: productsResponse, isLoading } = useQuery({
    queryKey: ['related-products', categorySlug, currentProductId],
    queryFn: async () => fetchCatalogProducts({ category: categorySlug, limit: 12 }),
  });

  // Filter out the current product
  const products = (productsResponse?.data?.items || []).filter((p: any) => p.id !== currentProductId);

  // Navigation
  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const amount = scrollContainerRef.current.clientWidth * 0.75;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  }, []);

  if (!isLoading && products.length === 0) {
    return null; // Don't render section if no related products
  }

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-white dark:bg-background py-20 border-t border-neutral-200 dark:border-neutral-900 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        {/* ── Header ── */}
        <div className="flex items-end justify-between mb-8 md:mb-10">
          <h2 className="font-serif text-2xl md:text-3xl text-neutral-900 dark:text-neutral-100 font-light tracking-tight">
            Complete The Look
          </h2>

          {/* Desktop Navigation Arrows */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => scroll('left')}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-800 bg-transparent text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-300"
              aria-label="Scroll left"
            >
              <ChevronLeft strokeWidth={1.25} className="size-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-800 bg-transparent text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-300"
              aria-label="Scroll right"
            >
              <ChevronRight strokeWidth={1.25} className="size-5" />
            </button>
          </div>
        </div>

        {/* ── Carousel Container ── */}
        <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide [&::-webkit-scrollbar]:hidden gap-4 md:gap-6 pb-6"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {isLoading ? (
              // Skeletons
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="shrink-0 w-[calc(70%-1rem)] sm:w-[calc(50%-1rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1rem)] snap-start">
                  <div className="aspect-[4/5] bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
                  <div className="mt-4 space-y-2">
                    <div className="h-2 w-16 bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
                    <div className="h-3 w-3/4 bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
                    <div className="h-3 w-1/3 bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
                  </div>
                </div>
              ))
            ) : (
              products.map((product: any, index: number) => (
                <RelatedProductCard key={product.id} product={product} index={index} />
              ))
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

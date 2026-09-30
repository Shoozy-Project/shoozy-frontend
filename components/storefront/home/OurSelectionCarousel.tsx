'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { CommerceImage } from '@/components/commerce/CommerceImage';
import { WishlistButton } from '@/components/commerce/WishlistButton';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { fetchCatalogProducts } from '@/lib/api/catalog';

/* ─────────────────────────── Category Tabs ─────────────────────────── */

function CategoryTabs({
  categories,
  activeSlug,
  onSelect,
  isLoading,
  isError,
  onRetry,
}: {
  categories: any[];
  activeSlug: string | null;
  onSelect: (slug: string) => void;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  return (
    <div className="w-full relative">
      <div className="flex overflow-x-auto whitespace-nowrap scrollbar-hide w-full gap-6 md:gap-8 border-b border-neutral-100 dark:border-neutral-800">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="pb-3 w-20 h-5 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-sm shrink-0"
            />
          ))
        ) : isError ? (
          <div className="inline-flex items-center gap-2 text-xs font-medium py-1.5 px-4 rounded-full bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 mb-2">
            <span>Failed to load categories</span>
            <button
              onClick={onRetry}
              className="ml-2 underline hover:text-rose-800 dark:hover:text-rose-300 uppercase tracking-widest text-[10px]"
            >
              Retry
            </button>
          </div>
        ) : (
          categories.map((category: any) => (
            <button
              key={category.id}
              onClick={() => onSelect(category.slug)}
              className="relative pb-3 shrink-0 group"
            >
              <span
                className={`text-xs uppercase tracking-[0.2em] transition-colors duration-300 ${
                  activeSlug === category.slug
                    ? 'text-neutral-900 dark:text-white font-semibold'
                    : 'text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 font-medium'
                }`}
              >
                {category.name}
              </span>
              {activeSlug === category.slug && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-neutral-900 dark:bg-white"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────── Product Card ──────────────────────────── */

function ProductCard({
  product,
  index,
}: {
  product: any;
  index: number;
}) {
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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.55,
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="shrink-0 w-[calc(50%-0.5rem)] md:w-[calc(33.333%-13px)] lg:w-[calc(25%-15px)] xl:w-[calc(20%-16px)] snap-start flex flex-col group cursor-pointer"
    >
      <Link href={`/products/${product.slug}`} className="flex flex-col h-full">
        {/* ── Image Container ── */}
        <div className="relative aspect-[4/5] bg-neutral-100 dark:bg-neutral-900 rounded-lg overflow-hidden">
          {/* Discount Badge */}
          {discountPercent > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="absolute top-3 left-3 z-10 px-2 py-1 rounded-sm bg-white/80 dark:bg-black/70 backdrop-blur-md text-black dark:text-white text-[10px] font-bold tracking-wider uppercase shadow-sm"
            >
              -{discountPercent}%
            </motion.div>
          )}

          {/* Out of Stock Overlay */}
          {product.inStock === false && (
            <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-20 flex items-center justify-center backdrop-blur-[2px]">
              <span className="bg-black dark:bg-white text-white dark:text-black px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest">
                Sold Out
              </span>
            </div>
          )}

          {/* Wishlist Button */}
          <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
            <WishlistButton
              productId={product.id}
              compact
              className="h-8 w-8 bg-white/80 dark:bg-black/60 backdrop-blur-md shadow-sm hover:bg-white dark:hover:bg-black border-0"
            />
          </div>

          {/* Product Image */}
          <CommerceImage
            src={product.primaryMedia?.url}
            alt={product.primaryMedia?.altText || product.name}
            sizes="(max-width: 640px) 50vw, 260px"
            className="object-cover object-center w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>

        {/* ── Product Info ── */}
        <div className="flex flex-col gap-0.5 pt-3 px-0.5">
          {/* Brand */}
          <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400 font-medium">
            {product.brand?.name || 'Shoezy'}
          </span>

          {/* Product Name */}
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate mt-0.5">
            {product.name}
          </h3>

          {/* Pricing Row */}
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-sm font-bold text-neutral-900 dark:text-white">
              {formattedPrice}
            </span>
            {hasDiscount && formattedComparePrice && (
              <span className="text-xs line-through text-neutral-400 dark:text-neutral-500">
                {formattedComparePrice}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ──────────────────────── Skeleton Card ────────────────────────────── */

function SkeletonCard() {
  return (
    <div className="shrink-0 w-[calc(50%-0.5rem)] md:w-[calc(33.333%-13px)] lg:w-[calc(25%-15px)] xl:w-[calc(20%-16px)] flex flex-col">
      <div className="aspect-[4/5] bg-neutral-100 dark:bg-neutral-800 rounded-lg animate-pulse" />
      <div className="pt-3 space-y-2 px-0.5">
        <div className="h-2.5 w-14 bg-neutral-100 dark:bg-neutral-800 rounded-sm animate-pulse" />
        <div className="h-3.5 w-3/4 bg-neutral-100 dark:bg-neutral-800 rounded-sm animate-pulse" />
        <div className="h-3.5 w-1/2 bg-neutral-100 dark:bg-neutral-800 rounded-sm animate-pulse mt-1" />
      </div>
    </div>
  );
}

/* ───────────────────── Main Carousel Component ────────────────────── */

export default function OurSelectionCarousel() {
  const { t } = useTranslations();
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  // Fetch Categories
  const {
    data: categoriesResponse,
    isLoading: isLoadingCategories,
    isError,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ['our-selection-categories'],
    queryFn: async () => {
      const res = await apiClient.get('/catalog/categories?limit=50');
      return res.data;
    },
  });

  const categories = categoriesResponse?.data?.items || [];

  useEffect(() => {
    if (categories.length > 0 && !activeCategorySlug) {
      setActiveCategorySlug(categories[0].slug);
    }
  }, [categories, activeCategorySlug]);

  // Fetch Products based on active category
  const { data: productsResponse, isFetching: isLoadingProducts } = useQuery({
    queryKey: ['products', 'category', activeCategorySlug],
    queryFn: async () => fetchCatalogProducts({ category: activeCategorySlug!, limit: 12 }),
    enabled: !!activeCategorySlug,
  });

  const products = productsResponse?.data?.items || [];

  // Navigation
  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const amount = scrollContainerRef.current.clientWidth * 0.6;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-white dark:bg-neutral-950 py-20 md:py-28 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-12 lg:px-16">
        {/* ── Header Row ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-10 flex flex-col gap-6"
        >
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-neutral-900 dark:text-white tracking-tight">
              Our Selection
            </h2>

            {/* Desktop Navigation Arrows — Aligned with title */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 hover:scale-105 active:scale-95"
                aria-label="Previous products"
              >
                <ChevronLeft strokeWidth={1.5} className="size-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 hover:scale-105 active:scale-95"
                aria-label="Next products"
              >
                <ChevronRight strokeWidth={1.5} className="size-5" />
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <CategoryTabs
            categories={categories}
            activeSlug={activeCategorySlug}
            onSelect={setActiveCategorySlug}
            isLoading={isLoadingCategories}
            isError={isError}
            onRetry={() => refetchCategories()}
          />
        </motion.div>

        {/* ── Carousel ── */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 md:gap-5 pb-4"
          >
            <AnimatePresence mode="wait">
              {isLoadingProducts ? (
                <motion.div
                  key="skeletons"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex gap-4 md:gap-5 w-full"
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </motion.div>
              ) : products && products.length > 0 ? (
                products.map((product: any, index: number) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                  />
                ))
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-full py-20 flex flex-col items-center justify-center rounded-lg"
                >
                  <div className="w-14 h-14 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-neutral-300 dark:text-neutral-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <p className="text-xs uppercase tracking-[0.2em] font-medium text-neutral-400 dark:text-neutral-500">
                    No products found in this category
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── View More CTA ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 md:mt-14 flex justify-center"
        >
          <Link
            href={`/products${activeCategorySlug ? `?category=${activeCategorySlug}` : ''}`}
            className="group inline-flex items-center gap-2.5 text-xs uppercase tracking-[0.2em] font-medium text-neutral-900 dark:text-neutral-100 hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors duration-300"
          >
            <span className="relative">
              Discover the Full Collection
              <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-neutral-900 dark:bg-neutral-100 group-hover:bg-neutral-500 dark:group-hover:bg-neutral-400 transition-colors duration-300 origin-left group-hover:scale-x-110" />
            </span>
            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

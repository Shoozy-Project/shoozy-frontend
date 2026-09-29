'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { CommerceImage } from '@/components/commerce/CommerceImage';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { fetchCatalogProducts } from '@/lib/api/catalog';

export default function OurSelectionCarousel() {
  const { t } = useTranslations();
  
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(null);

  // Fetch Categories
  const { data: categoriesResponse, isLoading: isLoadingCategories, isError, refetch: refetchCategories } = useQuery({
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

  // Scroll Container Ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-0 md:px-12">
        
        {/* Header & Category Tabs */}
        <div className="mb-8 flex flex-col gap-6 px-4 md:px-0">
          <h2 className="font-serif text-3xl md:text-5xl font-light text-neutral-900 tracking-wide">
            Our Selection
          </h2>
          
          {/* Scrollable Tabs */}
          <div className="w-full relative">
            <div className="flex overflow-x-auto whitespace-nowrap scrollbar-hide w-full gap-8 border-b border-neutral-200">
              {isLoadingCategories ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="pb-2 w-24 h-6 bg-neutral-200 animate-pulse rounded shrink-0" />
                ))
              ) : isError ? (
                <div className="inline-flex items-center gap-2 text-sm font-medium py-1.5 px-4 rounded-full bg-rose-50 border border-rose-200 text-rose-600 mb-2">
                  <span>Failed to load categories</span>
                  <button 
                    onClick={() => refetchCategories()}
                    className="ml-2 underline hover:text-rose-800 uppercase tracking-widest text-[10px]"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                categories.map((category: any) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategorySlug(category.slug)}
                    className={`pb-2 text-sm md:text-base transition-colors shrink-0 ${
                      activeCategorySlug === category.slug 
                        ? 'border-b-2 border-black text-black font-semibold' 
                        : 'text-neutral-500 hover:text-neutral-800 border-b-2 border-transparent'
                    }`}
                  >
                    {category.name}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Product Carousel Container */}
        <div className="w-full relative group">
          {/* Desktop Navigation Arrows */}
          <button 
            onClick={scrollLeft}
            className="hidden md:flex absolute -left-5 md:-left-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-md hover:shadow-lg items-center justify-center transition-all hover:scale-105 z-20 opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft strokeWidth={1.75} className="size-5 text-neutral-600 dark:text-neutral-300" />
          </button>
          
          <button 
            onClick={scrollRight}
            className="hidden md:flex absolute -right-5 md:-right-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-md hover:shadow-lg items-center justify-center transition-all hover:scale-105 z-20 opacity-0 group-hover:opacity-100"
          >
            <ChevronRight strokeWidth={1.75} className="size-5 text-neutral-600 dark:text-neutral-300" />
          </button>

          {/* Scrollable Area */}
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 md:gap-6 px-4 md:px-0 pb-4"
          >
            {isLoadingProducts ? (
              /* Skeletons */
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-col shrink-0 w-[calc(50%-0.5rem)] sm:w-[240px] md:w-[260px] snap-start bg-white rounded-lg shadow-sm border border-neutral-100 overflow-hidden">
                  <div className="aspect-[4/5] bg-neutral-100 animate-pulse" />
                  <div className="p-4 flex flex-col gap-3">
                    <div className="h-4 w-1/3 bg-neutral-100 animate-pulse" />
                    <div className="h-4 w-2/3 bg-neutral-100 animate-pulse" />
                    <div className="h-5 w-1/2 bg-neutral-100 animate-pulse mt-2" />
                  </div>
                </div>
              ))
            ) : products && products.length > 0 ? (
              products.map((product: any) => {
                const basePrice = Number(product.basePrice || product.minimumVariantPriceMinor || 0);
                const comparePrice = Number(product.compareAtPrice || 0);
                const showCompare = comparePrice > basePrice;

                const formattedPrice = `${basePrice.toFixed(3)} TND`;
                const formattedComparePrice = showCompare ? `${comparePrice.toFixed(3)} TND` : null;
                const discountPercent = showCompare
                  ? Math.round(((comparePrice - basePrice) / comparePrice) * 100)
                  : 0;

                return (
                  <div 
                    key={product.id} 
                    className="shrink-0 w-[calc(50%-0.5rem)] sm:w-[240px] md:w-[260px] lg:w-[280px] snap-start bg-white rounded-lg shadow-sm border border-neutral-100 overflow-hidden flex flex-col group cursor-pointer transition-shadow hover:shadow-md"
                  >
                    <Link href={`/products/${product.slug}`} className="flex flex-col h-full">
                      {/* A. Top Image Area */}
                      <div className="relative aspect-[4/5] bg-neutral-50 overflow-hidden flex items-center justify-center w-full">
                        
                        {/* Discount Badge */}
                        {discountPercent > 0 && (
                          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wider uppercase backdrop-blur-md bg-neutral-900/90 text-white shadow-sm dark:bg-white/90 dark:text-neutral-900 border border-white/20 dark:border-black/10">
                            -{discountPercent}% OFF
                          </div>
                        )}
                        {/* Out of stock overlay */}
                        {product.inStock === false && (
                          <div className="absolute inset-0 bg-white/40 z-20 flex items-center justify-center backdrop-blur-[2px]">
                            <span className="bg-black text-white px-3 py-1.5 text-xs font-semibold uppercase tracking-widest">
                              Out of Stock
                            </span>
                          </div>
                        )}
                        
                        {/* Primary Image */}
                        <CommerceImage
                          src={product.primaryMedia?.url}
                          alt={product.primaryMedia?.altText || product.name}
                          sizes="(max-width: 640px) 70vw, 280px"
                          className="object-cover object-center w-full h-full p-4 transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>

                      {/* B. Bottom Details Area */}
                      <div className="p-4 flex flex-col flex-1">
                        {/* Brand & Action */}
                        <div className="flex items-start justify-between gap-2 mb-0.5">
                          <span className="text-xs md:text-sm font-bold text-neutral-900 truncate">
                            {product.brand?.name || 'Shoezy'}
                          </span>
                          <button 
                            className="text-neutral-400 hover:text-red-500 transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              // Add to wishlist logic
                            }}
                          >
                            <Heart className="size-4" strokeWidth={2} />
                          </button>
                        </div>
                        
                        {/* Product Title */}
                        <h3 className="text-xs md:text-sm text-neutral-500 truncate mb-3">
                          {product.name}
                        </h3>
                        
                        {/* Pricing Row */}
                        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-auto">
                          <span className="font-semibold text-sm md:font-bold md:text-base text-neutral-900">
                            {formattedPrice}
                          </span>
                          {showCompare && (
                            <>
                              <span className="text-xs md:text-sm text-neutral-400 line-through">
                                {formattedComparePrice}
                              </span>
                              <span className="text-xs md:text-sm font-bold text-red-500">
                                -{discountPercent}%
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })
            ) : (
              <div className="w-full py-16 flex flex-col items-center justify-center bg-neutral-50 border border-neutral-100 rounded-lg">
                <span className="text-neutral-300 mb-4">
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </span>
                <p className="text-sm uppercase tracking-widest font-medium text-neutral-500">
                  No products found in this category
                </p>
              </div>
            )}
          </div>
        </div>

        {/* View More CTA */}
        <div className="mt-8 md:mt-12 flex justify-center">
          <Link
            href={`/products${activeCategorySlug ? `?category=${activeCategorySlug}` : ''}`}
            className="inline-flex items-center gap-2 border-b border-black pb-1 text-sm md:text-base uppercase tracking-widest font-medium hover:text-neutral-500 hover:border-neutral-500 transition-colors"
          >
            Discover the Full Collection
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CommerceImage } from '@/components/commerce/CommerceImage';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { fetchCatalogProducts } from '@/lib/api/catalog';

export default function OurSelectionCarousel() {
  const { t } = useTranslations();
  
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(null);

  // Fetch Categories
  const { data: categoriesResponse, isLoading: isLoadingCategories, isError } = useQuery({
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
    queryFn: async () => fetchCatalogProducts({ category: activeCategorySlug!, limit: 4 }),
    enabled: !!activeCategorySlug,
  });

  const products = productsResponse?.data?.items || [];

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header & Navigation Controls */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 w-full">
          <div className="flex flex-col gap-6 w-full min-w-0">
            <h2 className="font-serif text-4xl md:text-5xl font-light text-neutral-900 tracking-wide">
              Our Selection
            </h2>
            
            {/* Tabs */}
            <div className="w-full relative [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
              <div className="flex overflow-x-auto whitespace-nowrap snap-x snap-mandatory scrollbar-hide py-2 w-full gap-8">
                {isLoadingCategories ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="pb-3 w-20 h-6 bg-neutral-200 animate-pulse rounded shrink-0 snap-center" />
                  ))
                ) : isError ? (
                  <div className="pb-3 text-sm text-neutral-400">Failed to load categories</div>
                ) : (
                  categories.map((category: any) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategorySlug(category.slug)}
                      className={`pb-3 text-sm md:text-base tracking-widest uppercase transition-colors shrink-0 snap-center ${
                        activeCategorySlug === category.slug 
                          ? 'border-b-2 border-black text-black font-semibold' 
                          : 'border-b-2 border-transparent text-gray-400 hover:text-black'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="w-full">
          {isLoadingProducts ? (
            /* Skeletons */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col">
                  <div className="aspect-square bg-neutral-100 animate-pulse mb-4" />
                  <div className="h-3 w-1/4 bg-neutral-100 animate-pulse mb-1" />
                  <div className="h-5 w-2/3 bg-neutral-100 animate-pulse mb-2" />
                  <div className="h-4 w-1/3 bg-neutral-100 animate-pulse" />
                </div>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product: any) => {
                const priceMinor = product.minimumVariantPriceMinor;
                const formattedPrice = priceMinor 
                  ? `${(Number(priceMinor) / 1000).toFixed(3)} TND`
                  : t('catalog.priceUnavailable');

                const showCompare = product.compareAtPrice && product.basePrice && (Number(product.compareAtPrice) > Number(product.basePrice));
                const formattedComparePrice = showCompare 
                  ? `${Number(product.compareAtPrice).toFixed(3)} TND` 
                  : null;

                return (
                  <div key={product.id} className="group cursor-pointer flex flex-col relative">
                    <Link href={`/products/${product.slug}`} className="block">
                      {/* Product Image Box */}
                      <div className="relative aspect-square bg-[#F5F5F5] overflow-hidden mb-4 flex items-center justify-center">
                        {/* Out of stock badge */}
                        {product.inStock === false && (
                          <div className="absolute inset-0 bg-white/40 z-20 flex items-center justify-center backdrop-blur-[2px]">
                            <span className="bg-black text-white px-3 py-1.5 text-xs font-semibold uppercase tracking-widest">
                              Out of Stock
                            </span>
                          </div>
                        )}
                        {/* New badge */}
                        {product.inStock !== false && (
                          <div className="absolute top-3 left-3 z-10">
                            <span className="bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-black">
                              New
                            </span>
                          </div>
                        )}
                        
                        {/* Primary Image */}
                        <CommerceImage
                          src={product.primaryMedia?.url}
                          alt={product.primaryMedia?.altText || product.name}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className={`object-contain object-center p-6 transition-opacity duration-500 ${
                            product.secondaryMedia ? 'group-hover:opacity-0' : ''
                          }`}
                        />
                        
                        {/* Secondary Image (Hover) */}
                        {product.secondaryMedia && (
                          <CommerceImage
                            src={product.secondaryMedia.url}
                            alt={product.secondaryMedia.altText || product.name}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-contain object-center p-6 absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                          />
                        )}
                      </div>

                      {/* Product Metadata */}
                      <div className="flex flex-col gap-1">
                        {product.brand?.name && (
                          <span className="text-[10px] md:text-xs font-medium uppercase tracking-widest text-neutral-500">
                            {product.brand.name}
                          </span>
                        )}
                        <h3 className="text-base font-bold font-serif md:text-lg text-neutral-900 leading-tight line-clamp-1">
                          {product.name}
                        </h3>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="font-semibold text-sm text-neutral-900">
                            {formattedPrice}
                          </span>
                          {showCompare && (
                            <span className="text-xs text-neutral-400 line-through">
                              {formattedComparePrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="w-full py-16 flex flex-col items-center justify-center bg-neutral-50 border border-neutral-100">
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

        {/* View More CTA */}
        <div className="mt-12 md:mt-16 flex justify-center">
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

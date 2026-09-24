'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useCarouselProducts } from '@/lib/hooks/use-promotions';
import { CommerceImage } from '@/components/commerce/CommerceImage';
import { formatMinorMoney } from '@/lib/format-money';
import { useTranslations } from '@/lib/hooks/use-translations';

const TABS = [
  { id: 'MALE', label: 'Men' },
  { id: 'FEMALE', label: 'Women' },
  { id: 'ACCESSORIES', label: 'Accessories' },
];

export default function OurSelectionCarousel() {
  const { locale, t } = useTranslations();
  const intlLocale = locale === 'ar' ? 'ar-TN' : 'en-TN';
  
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  
  // For accessories, we might want to map it differently in a real app, 
  // but we'll use it as gender filter for now or pass null if it's accessories.
  const genderFilter = activeTab === 'ACCESSORIES' ? null : activeTab;
  const { data: products, isLoading } = useCarouselProducts(genderFilter);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  });

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header & Navigation Controls */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-6">
            <h2 className="font-serif text-4xl md:text-5xl font-light text-neutral-900 tracking-wide">
              Our Selection
            </h2>
            
            {/* Tabs */}
            <div className="flex items-center gap-6 md:gap-8 border-b border-neutral-200">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 text-sm md:text-base tracking-widest uppercase transition-colors relative ${
                    activeTab === tab.id 
                      ? 'text-black font-medium' 
                      : 'text-neutral-400 hover:text-neutral-600'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Carousel Controls */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={scrollPrev}
              className="p-3 rounded-full border border-neutral-300 text-neutral-600 hover:border-black hover:text-black hover:bg-neutral-50 transition-all focus:outline-none"
              aria-label="Previous slide"
            >
              <ChevronLeft className="size-5 stroke-[1.5]" />
            </button>
            <button
              onClick={scrollNext}
              className="p-3 rounded-full border border-neutral-300 text-neutral-600 hover:border-black hover:text-black hover:bg-neutral-50 transition-all focus:outline-none"
              aria-label="Next slide"
            >
              <ChevronRight className="size-5 stroke-[1.5]" />
            </button>
          </div>
        </div>

        {/* Carousel Architecture */}
        <div className="overflow-hidden -mx-4 px-4 sm:mx-0 sm:px-0" ref={emblaRef}>
          <div className="flex gap-4 sm:gap-6">
            {isLoading ? (
              /* Skeletons */
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-[0_0_80%] sm:flex-[0_0_45%] lg:flex-[0_0_23%] min-w-0">
                  <div className="aspect-[4/5] bg-neutral-100 animate-pulse mb-4" />
                  <div className="h-4 w-2/3 bg-neutral-100 animate-pulse mb-2" />
                  <div className="h-3 w-1/2 bg-neutral-100 animate-pulse" />
                </div>
              ))
            ) : products && products.length > 0 ? (
              products.map((product) => {
                const price = product.minimumEffectivePriceMinor ?? product.minimumVariantPriceMinor;
                return (
                  <div key={product.id} className="flex-[0_0_80%] sm:flex-[0_0_45%] lg:flex-[0_0_23%] min-w-0 group cursor-pointer">
                    <Link href={`/products/${product.slug}`} className="block">
                      {/* Product Image Box */}
                      <div className="relative aspect-[4/5] bg-[#F5F5F5] overflow-hidden mb-4">
                        {/* Badges */}
                        <div className="absolute top-3 left-3 z-10">
                          <span className="bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-black">
                            New
                          </span>
                        </div>
                        
                        {/* Primary Image */}
                        <CommerceImage
                          src={product.primaryMedia?.url}
                          alt={product.primaryMedia?.altText || product.name}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className={`object-cover object-center p-6 transition-opacity duration-500 ${
                            product.secondaryMedia ? 'group-hover:opacity-0' : ''
                          }`}
                        />
                        
                        {/* Secondary Image (Hover) */}
                        {product.secondaryMedia && (
                          <CommerceImage
                            src={product.secondaryMedia.url}
                            alt={product.secondaryMedia.altText || product.name}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover object-center p-6 absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                          />
                        )}
                      </div>

                      {/* Product Metadata */}
                      <div className="flex flex-col gap-1">
                        <h3 className="text-sm md:text-base font-semibold text-neutral-900 leading-tight">
                          {product.name}
                        </h3>
                        {product.shortDescription && (
                          <p className="text-xs md:text-sm text-neutral-500 line-clamp-1">
                            {product.shortDescription}
                          </p>
                        )}
                        <div className="mt-1 font-medium text-sm text-neutral-900">
                          {price ? formatMinorMoney(price, 'TND', 3, intlLocale) : t('catalog.priceUnavailable')}
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })
            ) : (
              <div className="w-full py-12 text-center text-neutral-500">
                No products found for this selection.
              </div>
            )}
          </div>
        </div>

        {/* View More CTA */}
        <div className="mt-12 md:mt-16 flex justify-center">
          <Link
            href={`/products${activeTab !== 'ACCESSORIES' ? `?gender=${activeTab}` : ''}`}
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

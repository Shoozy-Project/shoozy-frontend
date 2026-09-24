'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { CommerceImage } from '@/components/commerce/CommerceImage';
import { useCollections } from '@/lib/hooks/use-promotions';

export default function CollectionsCarousel() {
  const { data: collections, isLoading } = useCollections();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  });

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  // Filter only active collections
  const activeCollections = collections?.filter((c) => c.isActive) || [];

  return (
    <section className="bg-background py-16 md:py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header & Navigation Controls */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-medium">
              Curated Archives
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-light text-neutral-900 dark:text-neutral-50 tracking-wide">
              The Collections
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <Link 
              href="/collections" 
              className="hidden md:inline-flex items-center gap-2 border-b border-transparent hover:border-neutral-500 pb-1 text-xs uppercase tracking-widest text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-all"
            >
              View All Collections
              <ArrowRight className="size-4" />
            </Link>

            {/* Carousel Controls */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={scrollPrev}
                className="p-3 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-black hover:text-black dark:hover:border-white dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all focus:outline-none"
                aria-label="Previous slide"
              >
                <ChevronLeft className="size-4 stroke-[1.5]" />
              </button>
              <button
                onClick={scrollNext}
                className="p-3 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-black hover:text-black dark:hover:border-white dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all focus:outline-none"
                aria-label="Next slide"
              >
                <ChevronRight className="size-4 stroke-[1.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Architecture */}
        <div className="overflow-visible -mx-4 px-4 sm:mx-0 sm:px-0" ref={emblaRef}>
          <div className="flex gap-4 sm:gap-6">
            {isLoading ? (
              /* Skeletons */
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-[0_0_80%] sm:flex-[0_0_42%] lg:flex-[0_0_30%] min-w-0">
                  <div className="aspect-[3/4] bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
                </div>
              ))
            ) : activeCollections.length > 0 ? (
              activeCollections.map((collection) => (
                <div key={collection.id} className="flex-[0_0_80%] sm:flex-[0_0_42%] lg:flex-[0_0_30%] min-w-0 group cursor-pointer relative overflow-hidden aspect-[3/4] bg-neutral-100 dark:bg-neutral-900">
                  <Link href={`/collections/${collection.slug}`} className="block absolute inset-0 w-full h-full">
                    {/* Collection Image */}
                    {collection.imageUrl ? (
                      <CommerceImage
                        src={collection.imageUrl}
                        alt={collection.name}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover object-center w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-200 dark:bg-neutral-800" />
                    )}
                    
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Card Content (Positioned at Bottom-Left) */}
                    <div className="absolute bottom-0 left-0 p-6 md:p-8 flex flex-col gap-2 w-full text-white">
                      <h3 className="text-2xl md:text-3xl font-serif font-light tracking-wide leading-tight drop-shadow-sm">
                        {collection.name}
                      </h3>
                      {collection.description ? (
                        <p className="text-xs md:text-sm text-neutral-200 font-medium tracking-wide line-clamp-1 drop-shadow-sm">
                          {collection.description}
                        </p>
                      ) : (
                        <p className="text-xs md:text-sm text-neutral-200 font-medium tracking-wide drop-shadow-sm">
                          Explore the line
                        </p>
                      )}
                      
                      <div className="mt-4 overflow-hidden">
                        <span className="inline-flex items-center text-xs uppercase tracking-widest font-semibold border-b border-transparent group-hover:border-white transition-all duration-300 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 pb-1">
                          Discover Collection
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="w-full py-12 text-center text-neutral-500">
                No active collections available.
              </div>
            )}
          </div>
        </div>

        {/* Bottom Global CTA */}
        <div className="mt-12 md:mt-16 flex justify-center">
          <Link
            href="/collections"
            className="inline-flex items-center justify-center px-8 md:px-10 py-4 border border-black dark:border-white text-black dark:text-white text-[11px] md:text-xs uppercase tracking-[0.25em] font-semibold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
          >
            Explore All Collections
          </Link>
        </div>
      </div>
    </section>
  );
}

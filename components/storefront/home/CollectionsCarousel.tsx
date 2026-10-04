'use client';

import { useCallback, useRef } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { SwiperRef } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { HoverMedia } from '@/components/commerce/HoverMedia';
import { useCollections } from '@/lib/hooks/use-promotions';
import { useTranslations } from '@/lib/hooks/use-translations';

export default function CollectionsCarousel() {
  const { data: collections, isLoading } = useCollections();
  const { t } = useTranslations();

  const swiperRef = useRef<SwiperRef | null>(null);

  const scrollPrev = useCallback(() => {
    if (swiperRef.current?.swiper) swiperRef.current.swiper.slidePrev();
  }, []);
  const scrollNext = useCallback(() => {
    if (swiperRef.current?.swiper) swiperRef.current.swiper.slideNext();
  }, []);

  // Filter only active collections
  const activeCollections = collections?.filter((c) => c.isActive) || [];

  return (
    <section className="bg-background py-16 md:py-24 overflow-hidden">
      <div className="w-full max-w-none">
        
        {/* Header & Navigation Controls */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-medium">
              {t('home.curatedArchives')}
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-light text-neutral-900 dark:text-neutral-50 tracking-wide">
              {t('home.theCollections')}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <Link 
              href="/collections" 
              className="hidden md:inline-flex items-center gap-2 border-b border-transparent hover:border-neutral-500 pb-1 text-xs uppercase tracking-widest text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-all"
            >
              {t('home.viewAllCollections')}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>

            {/* Carousel Controls */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={scrollPrev}
                className="p-3 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-black hover:text-black dark:hover:border-white dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all focus:outline-none"
                aria-label={t('home.previousCollection')}
              >
                <ChevronLeft className="size-4 stroke-[1.5]" />
              </button>
              <button
                onClick={scrollNext}
                className="p-3 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-black hover:text-black dark:hover:border-white dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all focus:outline-none"
                aria-label={t('home.nextCollection')}
              >
                <ChevronRight className="size-4 stroke-[1.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Architecture */}
        {/* Carousel Architecture */}
        <div className="w-full">
          <style>{`
            .collections-swiper .swiper-wrapper {
              transition-timing-function: linear !important;
            }
          `}</style>
          
          <Swiper
            ref={swiperRef}
            modules={[Autoplay]}
            spaceBetween={12}
            breakpoints={{
              768: {
                spaceBetween: 24
              }
            }}
            slidesPerView="auto"
            loop={true}
            speed={8000}
            autoplay={{
              delay: 0,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            className="collections-swiper overflow-visible"
          >
            {isLoading ? (
              /* Skeletons */
              Array.from({ length: 4 }).map((_, i) => (
                <SwiperSlide key={i} className="!w-[45vw] sm:!w-[42vw] lg:!w-[28vw] xl:!w-[24vw] !h-auto">
                  <div className="aspect-[3/4] bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
                </SwiperSlide>
              ))
            ) : activeCollections.length > 0 ? (
              activeCollections.map((collection) => (
                <SwiperSlide key={collection.id} className="!w-[45vw] sm:!w-[42vw] lg:!w-[28vw] xl:!w-[24vw] !h-auto group cursor-pointer relative overflow-hidden aspect-[3/4] bg-neutral-100 dark:bg-neutral-900">
                  <Link href={`/collections/${collection.slug}`} className="block absolute inset-0 w-full h-full">
                    <HoverMedia imageUrl={collection.imageUrl} videoUrl={collection.videoUrl} videoMimeType={collection.videoMimeType} alt={collection.name} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" mediaClassName="object-cover object-center" />
                    
                    {/* Gradient Overlay for Text Readability */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />

                    {/* Card Content (Positioned at Bottom-Left) */}
                    <div className="pointer-events-none absolute bottom-0 left-0 flex w-full flex-col gap-2 p-6 text-white md:p-8">
                      <h3 className="text-2xl md:text-3xl font-serif font-light tracking-wide leading-tight drop-shadow-sm">
                        {collection.name}
                      </h3>
                      {collection.description ? (
                        <p className="text-xs md:text-sm text-neutral-200 font-medium tracking-wide line-clamp-1 drop-shadow-sm">
                          {collection.description}
                        </p>
                      ) : (
                        <p className="text-xs md:text-sm text-neutral-200 font-medium tracking-wide drop-shadow-sm">
                          {t('home.exploreLine')}
                        </p>
                      )}
                      <p className="text-[10px] uppercase tracking-[0.16em] text-white/65">{t('home.collectionProducts', { count: collection.productCount })}</p>
                      
                      <div className="mt-4 overflow-hidden">
                        <span className="inline-flex items-center text-xs uppercase tracking-widest font-semibold border-b border-transparent group-hover:border-white transition-all duration-300 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 pb-1">
                          {t('home.discoverCollection')}
                        </span>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))
            ) : (
              <div className="w-full py-12 text-center text-neutral-500">
                {t('home.noCollections')}
              </div>
            )}
          </Swiper>
        </div>

        {/* Bottom Global CTA */}
        <div className="mt-12 md:mt-16 flex justify-center">
          <Link
            href="/collections"
            className="inline-flex items-center justify-center px-8 md:px-10 py-4 border border-black dark:border-white text-black dark:text-white text-[11px] md:text-xs uppercase tracking-[0.25em] font-semibold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
          >
            {t('home.exploreCollections')}
          </Link>
        </div>
      </div>
    </section>
  );
}

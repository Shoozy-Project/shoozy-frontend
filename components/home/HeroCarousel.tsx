'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { promotionsApi } from '@/lib/api/promotions';

export default function HeroCarousel() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['public-banners'],
    queryFn: async () => {
      const res = await promotionsApi.publicBanners();
      return res.data.data;
    },
    staleTime: 60 * 1000, // 1 minute caching
    refetchOnWindowFocus: true,
  });

  const banners = data ?? [];

  // Embla Carousel Hook setup
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  // ─── Loading Skeleton State ───
  if (isLoading) {
    return (
      <div className="relative w-full h-[65vh] min-h-[480px] max-h-[720px] bg-gray-900 animate-pulse flex items-center justify-center">
        <div className="text-center text-white/50 space-y-3">
          <div className="w-10 h-10 border-2 border-white/20 border-t-[#FF8C00] rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold uppercase tracking-widest">Loading Hero Drop...</p>
        </div>
      </div>
    );
  }

  // ─── Fallback Static Hero if No Active Banners ───
  if (banners.length === 0) {
    return (
      <div className="relative w-full h-[60vh] min-h-[440px] bg-[var(--surface-primary)] flex flex-col items-center justify-center text-center px-6 py-24">
        <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#FF8C00] mb-6 flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Quality Shoes. Every Step.
        </p>
        <h1
          className="text-5xl lg:text-7xl font-bold text-[var(--text-primary)] mb-6 leading-tight"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Discover Your <br /> Perfect Pair
        </h1>
        <p className="text-base lg:text-lg text-[var(--text-muted)] max-w-md mx-auto mb-8 leading-relaxed">
          Premium footwear crafted for those who appreciate quality in every step.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-10 py-4 text-xs font-semibold tracking-widest uppercase bg-[#FF8C00] text-white hover:bg-[#e67e00] transition-all shadow-lg shadow-[#FF8C00]/25"
          >
            Shop Collection <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="relative w-full h-[65vh] min-h-[480px] max-h-[720px] bg-black select-none">
      {/* Embla Viewport Container */}
      <div className="overflow-hidden h-full w-full" ref={emblaRef}>
        <div className="flex h-full w-full">
          {banners.map((banner, index) => {
            const isCurrent = index === selectedIndex;
            return (
              <div
                key={banner.id}
                className="flex-[0_0_100%] min-w-0 relative h-full w-full"
              >
                {/* Responsive Desktop & Mobile Image */}
                <picture className="w-full h-full">
                  {banner.imageMobileUrl && (
                    <source media="(max-width: 640px)" srcSet={banner.imageMobileUrl} />
                  )}
                  <Image
                    src={banner.imageDesktopUrl}
                    alt={banner.title}
                    fill
                    priority={index === 0}
                    className="object-cover opacity-75"
                    unoptimized
                  />
                </picture>

                {/* Dark Vignette Overlay for Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

                {/* Banner Content Container */}
                <div className="absolute inset-0 max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-end pb-16 sm:pb-20 text-white z-10">
                  <motion.div
                    key={isCurrent ? `slide-${banner.id}` : `idle-${banner.id}`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={isCurrent ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="max-w-2xl space-y-4"
                  >
                    {/* Optional Badge */}
                    {banner.badgeText && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.25em] text-white bg-[#FF8C00] px-3 py-1 rounded-md shadow-md">
                        <Sparkles className="w-3 h-3" /> {banner.badgeText}
                      </span>
                    )}

                    {/* Banner Title */}
                    <h1
                      className="text-4xl sm:text-6xl font-extrabold leading-tight text-white drop-shadow-md tracking-tight"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {banner.title}
                    </h1>

                    {/* Subtitle */}
                    {banner.subtitle && (
                      <p className="text-base sm:text-lg text-gray-200 line-clamp-2 max-w-xl font-normal leading-relaxed">
                        {banner.subtitle}
                      </p>
                    )}

                    {/* Call to Action Button */}
                    {banner.ctaText && (
                      <div className="pt-2">
                        <Link
                          href={banner.ctaLink || '/products'}
                          className="inline-flex items-center justify-center px-8 py-3.5 text-xs font-bold tracking-widest uppercase bg-[#FF8C00] text-white hover:bg-[#e67e00] transition-all rounded-lg shadow-xl shadow-[#FF8C00]/30 group"
                        >
                          {banner.ctaText}
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prev / Next Slider Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            aria-label="Previous Banner"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center border border-white/10 backdrop-blur-sm transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={scrollNext}
            aria-label="Next Banner"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center border border-white/10 backdrop-blur-sm transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dot Pagination */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollTo(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === selectedIndex
                    ? 'w-8 bg-[#FF8C00]'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

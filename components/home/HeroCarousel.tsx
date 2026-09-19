'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePublicBanners } from '@/lib/hooks/use-promotions';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeroCarousel() {
  const { data: banners, isLoading, isError } = usePublicBanners();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, dragFree: false });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Fallback while loading
  if (isLoading) {
    return (
      <section className="relative w-full h-[85vh] md:h-screen min-h-[700px] overflow-hidden bg-surface-variant/50 animate-pulse flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-foreground border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  // Error or no banners
  if (isError || !banners || banners.length === 0) {
    return (
      <section className="relative w-full h-[85vh] md:h-screen min-h-[700px] overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA48StYLsUc7nxVJ3xg8gOGChnT_WEZZxpsLiaScpXHruo53dksZYnoxSqGeBRIZcEIIr5M_iqcaFEQR5-rVqUewhLEoq1zUvy-0Lwlifs7A_jTe4TDdvexLzhn73O9HlktR78lFUS9xEGHBjDZZBHsVUIrNyl8fB0GYt0GWMe7Drb025kHh32kawKLHf7XGpiZzLXWxYlIQ6OyomXEirnrrA4PTqcLQ8avAujYm4IKFSp6-fl96TSHSw"
            alt="Shoezy Default Hero"
            fill
            priority
            className="object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pt-[160px]">
          <h2 className="font-serif text-5xl md:text-7xl text-white mb-6 leading-tight drop-shadow-sm">
            A Summer by Shoezy
          </h2>
          <Link 
            href="/collections" 
            className="bg-white text-black hover:bg-transparent hover:text-white border border-white transition-all duration-300 uppercase tracking-widest px-10 py-4 text-sm font-semibold"
          >
            Discover
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full h-[85vh] md:h-screen min-h-[700px] overflow-hidden group">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {banners.map((banner, index) => (
            <div key={banner.id} className="relative flex-[0_0_100%] min-w-0 h-full">
              <Image
                src={banner.imageDesktopUrl}
                alt={banner.title}
                fill
                priority={true}
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-black/30"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pt-[160px]">
                <AnimatePresence mode="wait">
                  {selectedIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -30 }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="flex flex-col items-center w-full max-w-4xl"
                    >
                      {banner.badgeText && (
                        <span className="text-xs font-semibold tracking-[0.2em] text-white/90 uppercase mb-4">
                          {banner.badgeText}
                        </span>
                      )}
                      <h2 className="font-serif text-5xl md:text-7xl text-white mb-6 leading-tight drop-shadow-sm">
                        {banner.title}
                      </h2>
                      {banner.subtitle && (
                        <p className="text-lg md:text-xl text-white/80 font-light max-w-2xl mx-auto mb-10">
                          {banner.subtitle}
                        </p>
                      )}
                      <Link 
                        href={banner.ctaLink || '/collections'} 
                        className="bg-white text-black hover:bg-transparent hover:text-white border border-white transition-all duration-300 uppercase tracking-widest px-10 py-4 text-sm font-semibold"
                      >
                        {banner.ctaText || 'Discover'}
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows - only show if more than 1 banner */}
      {banners.length > 1 && (
        <>
          <button 
            onClick={scrollPrev} 
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-foreground/50 hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 hidden md:block"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-8 h-8" strokeWidth={1} />
          </button>
          <button 
            onClick={scrollNext} 
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-foreground/50 hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 hidden md:block"
            aria-label="Next banner"
          >
            <ChevronRight className="w-8 h-8" strokeWidth={1} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === selectedIndex ? 'bg-foreground scale-125' : 'bg-foreground/30 hover:bg-foreground/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CommerceImage } from '@/components/commerce/CommerceImage';
import { useBrands } from '@/lib/hooks/use-promotions';
import type { CatalogBrandDto } from '@/types/commerce';

// Extend the DTO just in case the type isn't fully updated yet, but we expect images.
type BrandWithImages = CatalogBrandDto & { images?: string[] };

function AnimatedBrandCircle({ brand }: { brand: BrandWithImages }) {
  const images = brand.images?.length ? brand.images : (brand.logoUrl ? [brand.logoUrl] : []);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    
    // Add a slight random delay (stagger) to initial start so they don't all flip at the exact same ms
    const initialDelay = Math.random() * 1000;
    
    let interval: NodeJS.Timeout;
    
    const timeout = setTimeout(() => {
      // Switch once after random delay
      setCurrentIndex((prev) => (prev + 1) % images.length);
      
      // Then start the regular 3s interval
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 3000);
    }, initialDelay);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [images.length]);

  const initials = brand.name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link
      href={`/products?brand=${brand.slug}`}
      className="group flex flex-col items-center flex-shrink-0 snap-start outline-none"
      title={`Shop ${brand.name}`}
    >
      <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 shadow-sm mx-auto group cursor-pointer group-hover:scale-105 transition-transform duration-500">
        <AnimatePresence mode="wait">
          {images.length > 0 ? (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <CommerceImage
                src={images[currentIndex]!}
                alt={`${brand.name} image ${currentIndex + 1}`}
                sizes="160px"
                className="object-cover w-full h-full"
              />
            </motion.div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-50 dark:bg-neutral-800">
              <span className="font-serif text-xl font-light tracking-[0.15em] text-neutral-400 select-none">
                {initials}
              </span>
            </div>
          )}
        </AnimatePresence>
      </div>
      <span className="text-xs font-medium uppercase tracking-[0.15em] text-neutral-800 dark:text-neutral-200 mt-4 text-center">
        {brand.name}
      </span>
    </Link>
  );
}

function SkeletonRow() {
  return (
    <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-8 pb-4 px-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center flex-shrink-0">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          <div className="h-3 w-20 rounded-full bg-neutral-100 dark:bg-neutral-800 animate-pulse mt-4" />
        </div>
      ))}
    </div>
  );
}

export default function ShopByBrandCarousel() {
  const { data: brands, isLoading } = useBrands();
  
  if (!isLoading && (!brands || brands.length === 0)) return null;

  return (
    <section className="w-full py-16 md:py-24 bg-white dark:bg-neutral-950 overflow-hidden">
      <div className="max-w-[1600px] mx-auto">
        <div className="px-4 md:px-8 lg:px-12 mb-8">
          <span className="block text-[10px] tracking-widest text-neutral-500 uppercase mb-2">
            OUR PARTNERS
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-neutral-900 dark:text-white">
            Shop by Brand
          </h2>
        </div>

        {isLoading ? (
          <SkeletonRow />
        ) : (
          <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-8 pb-4 px-4 md:px-8 lg:px-12">
            {brands?.map((brand) => (
              <AnimatedBrandCircle key={brand.id} brand={brand as BrandWithImages} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

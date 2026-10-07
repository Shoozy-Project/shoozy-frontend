'use client';

import { Children, type ReactNode, useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Autoplay, FreeMode, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import { cn } from '@/lib/utils';

interface HorizontalAutoRailProps {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  ariaLabel: string;
  speed?: number;
  spaceBetween?: number;
}

const MINIMUM_LOOP_ITEMS = 16;

export function HorizontalAutoRail({
  children,
  className,
  itemClassName,
  ariaLabel,
  speed = 4_000,
  spaceBetween = 16,
}: HorizontalAutoRailProps) {
  const items = Children.toArray(children);
  const loopItems = items.length > 0 && items.length < MINIMUM_LOOP_ITEMS
    ? Array.from({ length: MINIMUM_LOOP_ITEMS }, (_, index) => items[index % items.length])
    : items;
  const [reducedMotion, setReducedMotion] = useState(false);
  const itemSignature = items
    .map((item, index) => (typeof item === 'object' && item !== null && 'key' in item ? String(item.key) : String(index)))
    .join('\u001f');

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(motion.matches);
    updateMotion();
    motion.addEventListener('change', updateMotion);
    return () => motion.removeEventListener('change', updateMotion);
  }, []);

  if (items.length === 0) return null;

  const canLoop = loopItems.length > 1;
  const initialSlide = loopItems.length > items.length
    ? Math.floor(loopItems.length / (items.length * 2)) * items.length
    : 0;

  return (
    <div className={className}>
      <style>{`
        .horizontal-auto-rail .swiper-wrapper {
          transition-timing-function: linear !important;
        }
        .horizontal-auto-rail .swiper-slide {
          height: auto;
        }
      `}</style>
      <Swiper
        key={`${itemSignature}:${loopItems.length}:${reducedMotion}`}
        modules={[A11y, Autoplay, FreeMode, Mousewheel]}
        role="region"
        aria-label={ariaLabel}
        slidesPerView="auto"
        spaceBetween={spaceBetween}
        initialSlide={initialSlide}
        loop={canLoop}
        loopAdditionalSlides={4}
        loopPreventsSliding={false}
        speed={speed}
        autoplay={!reducedMotion && canLoop ? {
          delay: 0,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
          stopOnLastSlide: false,
        } : false}
        freeMode={{
          enabled: true,
          momentum: true,
          momentumRatio: 0.65,
          momentumBounce: false,
        }}
        mousewheel={{
          forceToAxis: true,
          releaseOnEdges: false,
          sensitivity: 0.75,
        }}
        grabCursor
        simulateTouch
        preventClicks
        preventClicksPropagation
        className="horizontal-auto-rail !overflow-visible"
      >
        {loopItems.map((item, index) => (
          <SwiperSlide
            key={`${typeof item === 'object' && item !== null && 'key' in item ? String(item.key) : index}-${index}`}
            className={cn('!h-auto', itemClassName)}
          >
            {item}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

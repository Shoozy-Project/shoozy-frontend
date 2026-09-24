'use client';

import { useCallback, useRef } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import { ArrowRight } from 'lucide-react';
import { CommerceImage } from '@/components/commerce/CommerceImage';
import { useBrands } from '@/lib/hooks/use-promotions';

// ─── Brand placeholder when no image ─────────────────────────────────────────
function BrandPlaceholder({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
      <span className="font-serif text-3xl font-light tracking-[0.18em] text-neutral-400 select-none">
        {initials}
      </span>
    </div>
  );
}

// ─── Single brand card ────────────────────────────────────────────────────────
function BrandCard({
  name,
  logoUrl,
  slug,
}: {
  name: string;
  logoUrl: string | null;
  slug: string;
}) {
  return (
    <Link
      href={`/products?brand=${slug}`}
      className="group flex flex-col items-center gap-3"
      title={`Shop ${name}`}
    >
      {/* Image container */}
      <div className="w-full aspect-square overflow-hidden rounded-2xl bg-neutral-100 relative">
        {logoUrl ? (
          <CommerceImage
            src={logoUrl}
            alt={name}
            sizes="(max-width: 640px) 55vw, (max-width: 1024px) 30vw, 22vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <BrandPlaceholder name={name} />
        )}

        {/* Subtle dark vignette on hover for depth */}
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5 group-hover:ring-black/10 transition-all duration-300" />
      </div>

      {/* Brand name */}
      <span className="text-[13px] font-medium tracking-[0.06em] text-neutral-700 group-hover:text-neutral-900 transition-colors duration-200 text-center leading-tight">
        {name}
      </span>
    </Link>
  );
}

// ─── Skeleton cards ───────────────────────────────────────────────────────────
function SkeletonCards() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <SwiperSlide
          key={i}
          className="!w-[52vw] sm:!w-[32vw] md:!w-[24vw] lg:!w-[18vw] xl:!w-[16vw]"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-full aspect-square rounded-2xl bg-neutral-100 animate-pulse" />
            <div className="h-3 w-20 rounded bg-neutral-100 animate-pulse" />
          </div>
        </SwiperSlide>
      ))}
    </>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export default function BrandsCarousel() {
  const { data: brands, isLoading } = useBrands();
  const swiperRef = useRef<any>(null);

  const scrollPrev = useCallback(() => {
    if (swiperRef.current?.swiper) swiperRef.current.swiper.slidePrev();
  }, []);
  const scrollNext = useCallback(() => {
    if (swiperRef.current?.swiper) swiperRef.current.swiper.slideNext();
  }, []);

  const hasData = brands && brands.length > 0;

  return (
    <section className="bg-white py-16 md:py-24 overflow-hidden">
      <div className="w-full max-w-none">

        {/* ─── Header ──────────────────────────────────────────── */}
        <div className="mb-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-medium">
              Our Partners
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-light text-neutral-900 tracking-wide">
              Shop by Brand
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/products"
              className="hidden md:inline-flex items-center gap-2 border-b border-transparent hover:border-neutral-500 pb-1 text-xs uppercase tracking-widest text-neutral-600 hover:text-black transition-all"
            >
              View All Brands
              <ArrowRight className="size-4" />
            </Link>

            {/* Nav controls */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={scrollPrev}
                className="p-3 rounded-full border border-neutral-300 text-neutral-600 hover:border-black hover:text-black hover:bg-neutral-50 transition-all focus:outline-none"
                aria-label="Previous brand"
              >
                <svg className="size-4 stroke-[1.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={scrollNext}
                className="p-3 rounded-full border border-neutral-300 text-neutral-600 hover:border-black hover:text-black hover:bg-neutral-50 transition-all focus:outline-none"
                aria-label="Next brand"
              >
                <svg className="size-4 stroke-[1.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ─── Carousel ──────────────────────────────────────────── */}
        <div className="w-full pl-4 sm:pl-6 lg:pl-8">
          <Swiper
            ref={swiperRef}
            modules={[Autoplay, FreeMode]}
            spaceBetween={16}
            slidesPerView="auto"
            loop={hasData && brands!.length >= 4}
            speed={600}
            grabCursor={true}
            freeMode={{ enabled: true, momentumRatio: 0.5 }}
            autoplay={
              hasData
                ? {
                    delay: 3500,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }
                : false
            }
            breakpoints={{
              640: { spaceBetween: 20 },
              1024: { spaceBetween: 24 },
            }}
            className="!overflow-visible"
          >
            {isLoading ? (
              <SkeletonCards />
            ) : hasData ? (
              brands!.map((brand) => (
                <SwiperSlide
                  key={brand.id}
                  className="!w-[52vw] sm:!w-[32vw] md:!w-[24vw] lg:!w-[18vw] xl:!w-[15vw]"
                >
                  <BrandCard
                    name={brand.name}
                    logoUrl={brand.logoUrl}
                    slug={brand.slug}
                  />
                </SwiperSlide>
              ))
            ) : null}
          </Swiper>
        </div>

        {/* ─── Mobile CTA ─────────────────────────────────────────── */}
        <div className="mt-10 flex justify-center md:hidden">
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-8 py-3.5 border border-black text-black text-[11px] uppercase tracking-[0.25em] font-semibold hover:bg-black hover:text-white transition-colors"
          >
            View All Brands
          </Link>
        </div>

      </div>
    </section>
  );
}

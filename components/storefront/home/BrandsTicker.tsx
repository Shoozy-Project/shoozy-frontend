'use client';

import Link from 'next/link';
import { CommerceImage } from '@/components/commerce/CommerceImage';
import { useBrands } from '@/lib/hooks/use-promotions';
import type { CatalogBrandDto } from '@/types/commerce';
import { useTranslations } from '@/lib/hooks/use-translations';

// ─── Placeholder when no image ────────────────────────────────────────────────
function BrandPlaceholder({ name }: { name: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-neutral-100 px-3 text-center dark:bg-neutral-900">
      <span className="font-serif text-base font-light tracking-[0.08em] text-neutral-500 dark:text-neutral-400">
        {name}
      </span>
    </div>
  );
}

// ─── Single circular brand pill ───────────────────────────────────────────────
function BrandCard({ name, logoUrl, slug, productCount }: { name: string; logoUrl: string | null; slug: string; productCount: number }) {
  const { t } = useTranslations();
  return (
    <Link
      href={`/products?brand=${encodeURIComponent(slug)}`}
      className="group flex flex-col items-center justify-center gap-3 px-6 py-2 flex-shrink-0"
      title={t('home.shopBrand', { name })}
    >
      {/* Circle */}
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-neutral-200 bg-white p-3 shadow-sm transition-all duration-300 group-hover:border-neutral-300 group-hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950 sm:h-28 sm:w-28 md:h-32 md:w-32">
        {logoUrl ? (
          <CommerceImage
            src={logoUrl}
            alt={name}
            sizes="128px"
            className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <BrandPlaceholder name={name} />
        )}
      </div>
      {/* Name */}
      <span className="text-xs sm:text-[13px] font-medium tracking-wide text-neutral-700 group-hover:text-neutral-900 transition-colors duration-200 text-center leading-tight max-w-[120px]">
        {name}
      </span>
      <span className="text-[10px] text-muted-foreground">{t('home.brandProducts', { count: productCount })}</span>
    </Link>
  );
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-3 px-6 py-2 flex-shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-neutral-100 animate-pulse" />
          <div className="h-3 w-16 rounded-full bg-neutral-100 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

// ─── Marquee track (renders items × 3 for seamless loop) ─────────────────────
function MarqueeTrack({ brands }: { brands: CatalogBrandDto[] }) {
  // Triple the array so there's always enough items to fill the screen
  // and the loop transition is invisible
  const tripled = [...brands, ...brands, ...brands];

  return (
    <>
      <style>{`
        @keyframes brands-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .brands-track {
          animation: brands-scroll 28s linear infinite;
          width: max-content;
        }
        .brands-track:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .brands-track { animation: none; }
        }
      `}</style>

      <div className="brands-track flex items-start">
        {tripled.map((brand, idx) => (
          <BrandCard
            key={`${brand.id}-${idx}`}
            name={brand.name}
            logoUrl={brand.logoUrl}
            slug={brand.slug}
            productCount={brand.productCount}
          />
        ))}
      </div>
    </>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export default function BrandsCarousel() {
  const { data: brands, isLoading } = useBrands();
  const { t } = useTranslations();
  const hasData = brands && brands.length > 0;

  return (
    <section className="overflow-hidden border-t border-border bg-background py-16 md:py-20">
      {/* Header */}
      <div className="mb-10 text-center">
        <span className="text-xs uppercase tracking-[0.3em] text-neutral-400 font-medium">
          {t('home.ourPartners')}
        </span>
        <h2 className="mt-2 font-serif text-3xl font-light tracking-wide text-neutral-900 dark:text-neutral-100 md:text-4xl">
          {t('home.shopByBrand')}
        </h2>
      </div>

      {/* Marquee with edge fade */}
      <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        {isLoading ? (
          <SkeletonRow />
        ) : hasData ? (
          <MarqueeTrack brands={brands} />
        ) : null}
      </div>
    </section>
  );
}

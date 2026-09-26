'use client';

import Link from 'next/link';
import { CommerceImage } from '@/components/commerce/CommerceImage';
import { useBrands } from '@/lib/hooks/use-promotions';
import type { CatalogBrandDto } from '@/types/commerce';

// ─── Placeholder when no image ────────────────────────────────────────────────
function BrandPlaceholder({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="w-full h-full flex items-center justify-center bg-neutral-100">
      <span className="font-serif text-xl font-light tracking-[0.15em] text-neutral-400 select-none">
        {initials}
      </span>
    </div>
  );
}

// ─── Single circular brand pill ───────────────────────────────────────────────
function BrandCard({ name, logoUrl, slug }: { name: string; logoUrl: string | null; slug: string }) {
  return (
    <Link
      href={`/products?brand=${slug}`}
      className="group flex flex-col items-center justify-center gap-3 px-6 py-2 flex-shrink-0"
      title={`Shop ${name}`}
    >
      {/* Circle */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden border border-neutral-200 bg-neutral-50 shadow-sm relative flex-shrink-0 transition-all duration-300 group-hover:shadow-md group-hover:border-neutral-300">
        {logoUrl ? (
          <CommerceImage
            src={logoUrl}
            alt={name}
            sizes="128px"
            className="object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <BrandPlaceholder name={name} />
        )}
      </div>
      {/* Name */}
      <span className="text-xs sm:text-[13px] font-medium tracking-wide text-neutral-700 group-hover:text-neutral-900 transition-colors duration-200 text-center leading-tight max-w-[120px]">
        {name}
      </span>
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
      `}</style>

      <div className="brands-track flex items-start">
        {tripled.map((brand, idx) => (
          <BrandCard
            key={`${brand.id}-${idx}`}
            name={brand.name}
            logoUrl={brand.logoUrl}
            slug={brand.slug}
          />
        ))}
      </div>
    </>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export default function BrandsCarousel() {
  const { data: brands, isLoading } = useBrands();
  const hasData = brands && brands.length > 0;

  return (
    <section className="bg-white py-16 md:py-20 overflow-hidden border-t border-neutral-100">
      {/* Header */}
      <div className="mb-10 text-center">
        <span className="text-xs uppercase tracking-[0.3em] text-neutral-400 font-medium">
          Our Partners
        </span>
        <h2 className="mt-2 font-serif text-3xl md:text-4xl font-light text-neutral-900 tracking-wide">
          Shop by Brand
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

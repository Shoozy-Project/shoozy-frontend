'use client';

import Link from 'next/link';
import { CommerceImage } from '@/components/commerce/CommerceImage';
import { HorizontalAutoRail } from '@/components/storefront/HorizontalAutoRail';
import { useBrands } from '@/lib/hooks/use-promotions';
import { useTranslations } from '@/lib/hooks/use-translations';
import type { CatalogBrandDto } from '@/types/commerce';

const CARD_WIDTH = '!w-[62%] sm:!w-[42%] md:!w-[29%] lg:!w-[19%]';

function BrandBackdrop({ name }: { name: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-muted via-background to-muted">
      <span aria-hidden="true" className="font-serif text-[7rem] font-light uppercase leading-none text-foreground/[0.06] dark:text-foreground/[0.08]">
        {name.trim().charAt(0)}
      </span>
    </div>
  );
}

function BrandCard({ brand }: { brand: CatalogBrandDto }) {
  const { t } = useTranslations();
  const backgroundImage = brand.showcaseImageUrl || brand.logoUrl;
  const hasShowcaseImage = Boolean(brand.showcaseImageUrl);

  return (
    <Link
      href={`/products?brand=${encodeURIComponent(brand.slug)}`}
      aria-label={t('home.shopBrand', { name: brand.name })}
      title={t('home.shopBrand', { name: brand.name })}
      className="group relative block h-full overflow-hidden border border-border/70 bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {backgroundImage ? (
        <CommerceImage
          src={backgroundImage}
          alt={brand.name}
          sizes="(max-width: 640px) 62vw, (max-width: 768px) 42vw, (max-width: 1024px) 29vw, 19vw"
          className={hasShowcaseImage
            ? 'object-cover object-center transition-transform duration-700 ease-out motion-reduce:transition-none group-hover:scale-[1.025]'
            : 'bg-white object-contain object-center p-6 transition-transform duration-700 ease-out motion-reduce:transition-none group-hover:scale-[1.025] dark:bg-neutral-950 sm:p-8'}
        />
      ) : (
        <BrandBackdrop name={brand.name} />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex min-h-24 items-end p-4 sm:p-5">
        {hasShowcaseImage && brand.logoUrl ? (
          <div className="relative h-11 w-full max-w-[9rem] sm:h-12 sm:max-w-[10rem]">
            <CommerceImage
              src={brand.logoUrl}
              alt={brand.name}
              sizes="160px"
              className="object-contain object-left [filter:drop-shadow(0_1px_2px_rgb(0_0_0/0.9))_drop-shadow(0_0_2px_rgb(255_255_255/0.9))] rtl:object-right"
            />
          </div>
        ) : (
          <h3 className="font-serif text-xl font-light tracking-wide text-white drop-shadow-md sm:text-2xl">{brand.name}</h3>
        )}
      </div>
    </Link>
  );
}

function BrandSkeletons() {
  return Array.from({ length: 6 }, (_, index) => (
    <div key={index} className="h-full animate-pulse bg-muted" />
  ));
}

export default function TopBrandsRail() {
  const { data: brands, isPending } = useBrands();
  const { t } = useTranslations();

  if (!isPending && !brands?.length) return null;

  return (
    <section id="top-brands" className="scroll-mt-20 overflow-hidden border-t border-border bg-background py-16 text-foreground md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">{t('home.ourPartners')}</p>
        <h2 className="mt-2 font-serif text-3xl font-light tracking-wide md:text-5xl">{t('home.topBrands')}</h2>
        <HorizontalAutoRail
          ariaLabel={t('home.topBrands')}
          className="-mx-4 mt-8 px-4 pb-2 sm:mx-0 sm:px-0 md:mt-10"
          itemClassName={`${CARD_WIDTH} aspect-[3/4]`}
          spaceBetween={12}
        >
          {isPending || !brands ? BrandSkeletons() : brands.map((brand) => <BrandCard key={brand.id} brand={brand} />)}
        </HorizontalAutoRail>
      </div>
    </section>
  );
}

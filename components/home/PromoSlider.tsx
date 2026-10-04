'use client';

import { useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { SwiperRef } from 'swiper/react';
import { catalogApi } from '@/lib/api/catalog';
import { CommerceImage } from '@/components/commerce/CommerceImage';
import { formatMinorMoney } from '@/lib/format-money';
import { useTranslations } from '@/lib/hooks/use-translations';
import { cn } from '@/lib/utils';
import type { CatalogPromotionDto } from '@/types/commerce';
import 'swiper/css';

function discountLabel(offer: CatalogPromotionDto, locale: string, t: (key: string, values?: Record<string, string | number>) => string) {
  if (offer.discount.type === 'PERCENTAGE' && offer.discount.percentage) return t('home.percentOff', { amount: offer.discount.percentage });
  if (offer.discount.type === 'FIXED_AMOUNT' && offer.discount.amountMinor) return t('home.amountOff', { amount: formatMinorMoney(offer.discount.amountMinor, offer.discount.currency ?? 'TND', undefined, locale) });
  return t('promotion.freeShipping');
}

function promotionDestination(value: string | null) {
  if (!value) return null;
  if (value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\')) return { href: value, external: false };
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? { href: value, external: true } : null;
  } catch {
    return null;
  }
}

function OfferCard({ offer, locale, t, wide = false, sizes }: { offer: CatalogPromotionDto; locale: string; t: (key: string, values?: Record<string, string | number>) => string; wide?: boolean; sizes: string }) {
  const destination = promotionDestination(offer.ctaUrl);
  const ctaClassName = 'mt-6 inline-flex w-fit items-center gap-2 border-b border-white/70 pb-1 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:border-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white';
  const ctaContent = <>{t('home.viewOffer')} <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" /></>;

  return (
    <article className={cn('group relative w-full overflow-hidden border border-neutral-200 bg-neutral-900 dark:border-neutral-800', wide ? 'aspect-[4/5] md:aspect-[16/7]' : 'aspect-[4/5]')}>
      <CommerceImage src={offer.imageUrl} alt={offer.name} sizes={sizes} className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
      <div className={cn('absolute inset-x-0 bottom-0 z-10 flex flex-col items-start p-6 text-start text-white md:p-8', wide && 'max-w-3xl')}>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">{discountLabel(offer, locale, t)}</p>
        <h3 className={cn('font-serif font-light leading-tight', wide ? 'text-3xl md:text-5xl' : 'text-3xl')}>{offer.name}</h3>
        {offer.description && <p className="mt-3 line-clamp-3 max-w-xl text-sm leading-relaxed text-white/75">{offer.description}</p>}
        {destination && (destination.external
          ? <a href={destination.href} className={ctaClassName}>{ctaContent}</a>
          : <Link href={destination.href} className={ctaClassName}>{ctaContent}</Link>)}
      </div>
    </article>
  );
}

export default function PromoSlider() {
  const { locale, t } = useTranslations();
  const intlLocale = locale === 'ar' ? 'ar-TN' : 'en-TN';
  const swiperRef = useRef<SwiperRef | null>(null);
  const promotions = useQuery({
    queryKey: ['catalog', 'storefront-promotions'],
    queryFn: () => catalogApi.promotions().then((response) => response.data.data.items),
    staleTime: 60_000,
    retry: 1,
  });
  const offers = useMemo(() => [...(promotions.data ?? [])].sort((left, right) => left.sortOrder - right.sortOrder), [promotions.data]);
  const previous = useCallback(() => swiperRef.current?.swiper.slidePrev(), []);
  const next = useCallback(() => swiperRef.current?.swiper.slideNext(), []);

  if (promotions.isLoading || promotions.isError || !offers.length) return null;

  return (
    <section className="overflow-hidden border-y border-neutral-200 bg-background py-16 dark:border-neutral-800 md:py-24">
      <div className="mx-auto mb-10 flex max-w-7xl items-end justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-neutral-500">{t('home.specialOffers')}</p>
          <h2 className="mt-2 font-serif text-3xl font-light tracking-wide text-neutral-900 dark:text-neutral-50 md:text-5xl">{t('home.exclusiveOffers')}</h2>
        </div>
        {offers.length >= 3 && <div className="hidden items-center gap-3 md:flex"><button type="button" onClick={previous} aria-label={t('home.previousOffer')} className="rounded-full border border-neutral-300 p-3 text-neutral-600 transition-colors hover:border-black hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-white dark:hover:text-white dark:focus-visible:ring-white"><ChevronLeft className="size-4 stroke-[1.5]" aria-hidden="true" /></button><button type="button" onClick={next} aria-label={t('home.nextOffer')} className="rounded-full border border-neutral-300 p-3 text-neutral-600 transition-colors hover:border-black hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-white dark:hover:text-white dark:focus-visible:ring-white"><ChevronRight className="size-4 stroke-[1.5]" aria-hidden="true" /></button></div>}
      </div>

      {offers.length === 1 && <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><OfferCard offer={offers[0]!} locale={intlLocale} t={t} wide sizes="100vw" /></div>}
      {offers.length === 2 && <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-2 lg:px-8">{offers.map((offer) => <OfferCard key={offer.id} offer={offer} locale={intlLocale} t={t} sizes="(max-width: 768px) 100vw, 50vw" />)}</div>}
      {offers.length >= 3 && <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" dir={locale === 'ar' ? 'rtl' : 'ltr'}><Swiper ref={swiperRef} spaceBetween={16} slidesPerView={1.08} breakpoints={{ 640: { slidesPerView: 1.7, spaceBetween: 20 }, 768: { slidesPerView: 2.25, spaceBetween: 24 }, 1280: { slidesPerView: 3.15, spaceBetween: 24 } }} className="offers-swiper !overflow-visible">{offers.map((offer) => <SwiperSlide key={offer.id} className="!h-auto"><OfferCard offer={offer} locale={intlLocale} t={t} sizes="(max-width: 640px) 90vw, (max-width: 1280px) 45vw, 32vw" /></SwiperSlide>)}</Swiper></div>}
    </section>
  );
}

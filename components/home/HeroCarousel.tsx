'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useCollections } from '@/lib/hooks/use-promotions';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function HeroCarousel() {
  const { t } = useTranslations();
  const { data: collections, isLoading } = useCollections();

  if (isLoading) {
    return (
      <div className="w-full bg-background -mt-[130px] md:-mt-[150px]">
        <div className="relative w-full h-[90vh] md:h-screen min-h-[700px] bg-neutral-900 animate-pulse" />
      </div>
    );
  }

  // Filter active collections
  const activeCollections = collections?.filter(c => c.isActive && c.imageUrl) || [];

  if (activeCollections.length === 0) {
    // Static Fallback
    return (
      <div className="w-full bg-background -mt-[130px] md:-mt-[150px]">
        <section className="relative w-full h-[90vh] md:h-screen min-h-[700px] overflow-hidden">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA48StYLsUc7nxVJ3xg8gOGChnT_WEZZxpsLiaScpXHruo53dksZYnoxSqGeBRIZcEIIr5M_iqcaFEQR5-rVqUewhLEoq1zUvy-0Lwlifs7A_jTe4TDdvexLzhn73O9HlktR78lFUS9xEGHBjDZZBHsVUIrNyl8fB0GYt0GWMe7Drb025kHh32kawKLHf7XGpiZzLXWxYlIQ6OyomXEirnrrA4PTqcLQ8avAujYm4IKFSp6-fl96TSHSw"
            alt={t('home.heroAlt')}
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pt-[140px]">
            <span className="text-xs uppercase tracking-[0.4em] text-neutral-300 mb-3 font-sans">
              Haute Chaussure • Maison Shoozy
            </span>
            <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-6 leading-tight drop-shadow-sm font-light tracking-wide">
              {t('home.heroTitle')}
            </h2>
            <Link
              href="/collections"
              className="bg-white text-black hover:bg-transparent hover:text-white border border-white transition-all duration-300 uppercase tracking-[0.25em] px-10 py-4 text-xs font-semibold"
            >
              {t('home.discover')}
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full bg-background -mt-[130px] md:-mt-[150px]">
      <section className="relative w-full h-[90vh] md:h-screen min-h-[700px] overflow-hidden group">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          loop
          className="w-full h-full [&_.swiper-pagination-bullet]:bg-white [&_.swiper-pagination-bullet-active]:bg-white [&_.swiper-button-next]:text-white [&_.swiper-button-prev]:text-white [&_.swiper-button-next]:opacity-0 [&_.swiper-button-prev]:opacity-0 group-hover:[&_.swiper-button-next]:opacity-100 group-hover:[&_.swiper-button-prev]:opacity-100 [&_.swiper-button-next]:transition-opacity [&_.swiper-button-prev]:transition-opacity"
        >
          {activeCollections.map((collection, index) => (
            <SwiperSlide key={collection.id} className="relative w-full h-full">
              <Image
                src={collection.imageUrl!}
                alt={collection.name}
                fill
                priority={index === 0}
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pt-[140px]">
                {collection.endsAt && (
                  <span className="inline-block px-3 py-1 border border-white/50 text-[10px] uppercase tracking-[0.25em] text-white mb-4 bg-black/20 backdrop-blur-sm rounded-sm">
                    LIMITED TIME
                  </span>
                )}
                <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-4 leading-tight drop-shadow-sm font-light tracking-wide max-w-5xl">
                  {collection.name}
                </h2>
                {collection.description && (
                  <p className="text-sm md:text-base text-neutral-200 font-medium tracking-wide max-w-2xl mx-auto mb-8 drop-shadow-md">
                    {collection.description}
                  </p>
                )}
                <Link
                  href={`/collections/${collection.slug}`}
                  className="bg-white text-black hover:bg-transparent hover:text-white border border-white transition-all duration-300 uppercase tracking-[0.25em] px-10 py-4 text-xs font-semibold"
                >
                  {t('home.discover')}
                </Link>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
    </div>
  );
}

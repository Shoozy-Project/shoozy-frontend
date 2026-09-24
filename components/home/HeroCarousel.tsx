'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from '@/lib/hooks/use-translations';

export default function HeroCarousel() {
  const { t } = useTranslations();
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

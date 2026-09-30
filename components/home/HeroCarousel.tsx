'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useCollections } from '@/lib/hooks/use-promotions';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

/* ─── Stagger Animation Variants ─── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.6,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

/* ─── Hero Slide Content ─── */
function SlideContent({
  kicker,
  headline,
  description,
  ctaHref,
  ctaLabel,
}: {
  kicker: string;
  headline: string;
  description?: string | null;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10"
    >
      {/* Kicker */}
      <motion.span
        variants={itemVariants}
        className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-white/80 mb-4 font-sans"
      >
        {kicker}
      </motion.span>

      {/* Headline */}
      <motion.h1
        variants={itemVariants}
        className="font-serif text-5xl md:text-7xl lg:text-8xl text-white leading-[1.05] font-light tracking-wide max-w-5xl drop-shadow-sm"
      >
        {headline}
      </motion.h1>

      {/* Description */}
      {description && (
        <motion.p
          variants={itemVariants}
          className="text-sm md:text-base text-white/70 font-medium tracking-wide max-w-2xl mx-auto mt-5 mb-2 leading-relaxed"
        >
          {description}
        </motion.p>
      )}

      {/* CTA Button — Ghost Luxury */}
      <motion.div variants={itemVariants} className="mt-8">
        <Link
          href={ctaHref}
          className="inline-block bg-transparent border border-white/80 text-white px-10 py-3.5 text-xs uppercase tracking-[0.25em] font-semibold transition-all duration-500 hover:bg-white hover:text-black hover:border-white"
        >
          {ctaLabel}
        </Link>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Hero Carousel ─── */
export default function HeroCarousel() {
  const { t } = useTranslations();
  const { data: collections, isLoading } = useCollections();
  const heroRef = useRef<HTMLDivElement>(null);

  // Parallax: image moves slower than scroll
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 800], [0, 200]);
  const imageScale = useTransform(scrollY, [0, 600], [1.08, 1]);

  if (isLoading) {
    return (
      <div className="w-full bg-background -mt-[88px] md:-mt-[96px]">
        <div className="relative w-full h-screen min-h-[700px] bg-neutral-900 animate-pulse" />
      </div>
    );
  }

  // Filter active collections
  const activeCollections = collections?.filter(c => c.isActive && c.imageUrl) || [];

  if (activeCollections.length === 0) {
    // Static Fallback — Single Hero
    return (
      <div className="w-full bg-background -mt-[88px] md:-mt-[96px]">
        <section ref={heroRef} className="relative w-full h-screen min-h-[700px] overflow-hidden">
          {/* Parallax Image */}
          <motion.div
            style={{ y: parallaxY, scale: imageScale }}
            className="absolute inset-0 w-full h-[120%] -top-[10%]"
          >
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA48StYLsUc7nxVJ3xg8gOGChnT_WEZZxpsLiaScpXHruo53dksZYnoxSqGeBRIZcEIIr5M_iqcaFEQR5-rVqUewhLEoq1zUvy-0Lwlifs7A_jTe4TDdvexLzhn73O9HlktR78lFUS9xEGHBjDZZBHsVUIrNyl8fB0GYt0GWMe7Drb025kHh32kawKLHf7XGpiZzLXWxYlIQ6OyomXEirnrrA4PTqcLQ8avAujYm4IKFSp6-fl96TSHSw"
              alt={t('home.heroAlt')}
              fill
              priority
              className="object-cover object-center"
            />
          </motion.div>

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-[1]" />

          {/* Content */}
          <SlideContent
            kicker="Haute Chaussure • Maison Shoezy"
            headline={t('home.heroTitle')}
            ctaHref="/collections"
            ctaLabel={t('home.discover')}
          />

          {/* Bottom Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
          >
            <span className="text-[9px] uppercase tracking-[0.3em] text-white/50 font-medium">
              Scroll
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              className="w-[1px] h-6 bg-white/30"
            />
          </motion.div>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full bg-background -mt-[88px] md:-mt-[96px]">
      <section ref={heroRef} className="relative w-full h-screen min-h-[700px] overflow-hidden group">
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          pagination={{
            clickable: true,
            el: '.swiper-custom-pagination',
            renderBullet: (index, className) => {
              return `<span class="${className} transition-all duration-500 rounded-full cursor-pointer"></span>`;
            },
            bulletClass: 'w-8 h-[2px] bg-white/30 block',
            bulletActiveClass: '!w-14 !bg-white'
          }}
          loop
          className="w-full h-full"
        >
          {activeCollections.map((collection, index) => (
            <SwiperSlide key={collection.id} className="relative w-full h-full">
              {/* Image with subtle initial zoom animation */}
              <motion.div
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 2.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="absolute inset-0"
              >
                <Image
                  src={collection.imageUrl!}
                  alt={collection.name}
                  fill
                  priority={index === 0}
                  className="object-cover object-center"
                />
              </motion.div>

              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-[1]" />

              {/* Content */}
              <SlideContent
                kicker={collection.endsAt ? 'Limited Time Collection' : 'The Fall/Winter Edit'}
                headline={collection.name}
                description={collection.description}
                ctaHref={`/collections/${collection.slug}`}
                ctaLabel={t('home.discover')}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Pagination */}
        <div className="swiper-custom-pagination absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20" />
      </section>
    </div>
  );
}

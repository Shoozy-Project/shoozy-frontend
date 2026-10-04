'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import type { Swiper as SwiperInstance } from 'swiper';
import { homepageApi } from '@/lib/api/homepage';
import { CommerceImage } from '@/components/commerce/CommerceImage';
import { useTranslations } from '@/lib/hooks/use-translations';
import type { HomepageBannerDto } from '@/types/homepage';
import { storefrontHref } from '@/lib/storefront-href';
import 'swiper/css';
import 'swiper/css/pagination';

const HERO_IMAGE_DURATION_MS = 5000;

type HeroMedia =
  | { kind: 'video'; src: string; mimeType: string; fallbackImage: string | null }
  | { kind: 'image'; src: string }
  | { kind: 'none' };

function useMediaPreference(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const update = () => setMatches(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, [query]);

  return matches;
}

function fallbackImage(banner: HomepageBannerDto, isMobile: boolean) {
  return isMobile
    ? banner.mobileImageUrl ?? banner.desktopImageUrl
    : banner.desktopImageUrl ?? banner.mobileImageUrl;
}

function supportedVideo(src: string | null, mimeType: string | null) {
  return Boolean(src) && (!mimeType || mimeType.toLowerCase() === 'video/mp4');
}

function videoMedia(src: string | null, mimeType: string | null, imageFallback: string | null): HeroMedia {
  return supportedVideo(src, mimeType) && src
    ? { kind: 'video', src, mimeType: mimeType ?? 'video/mp4', fallbackImage: imageFallback }
    : { kind: 'none' };
}

function selectMedia(banner: HomepageBannerDto, isMobile: boolean, reducedMotion: boolean, videoFailed: boolean): HeroMedia {
  const imageFallback = fallbackImage(banner, isMobile);
  if (reducedMotion || videoFailed) return imageFallback ? { kind: 'image', src: imageFallback } : { kind: 'none' };

  const candidates: HeroMedia[] = isMobile
    ? [
        videoMedia(banner.mobileVideoUrl, banner.mobileVideoMimeType, imageFallback),
        banner.mobileImageUrl ? { kind: 'image', src: banner.mobileImageUrl } : { kind: 'none' },
        videoMedia(banner.desktopVideoUrl, banner.desktopVideoMimeType, imageFallback),
        banner.desktopImageUrl ? { kind: 'image', src: banner.desktopImageUrl } : { kind: 'none' },
      ]
    : [
        videoMedia(banner.desktopVideoUrl, banner.desktopVideoMimeType, imageFallback),
        banner.desktopImageUrl ? { kind: 'image', src: banner.desktopImageUrl } : { kind: 'none' },
        videoMedia(banner.mobileVideoUrl, banner.mobileVideoMimeType, imageFallback),
        banner.mobileImageUrl ? { kind: 'image', src: banner.mobileImageUrl } : { kind: 'none' },
      ];

  return candidates.find((candidate) => candidate.kind !== 'none') ?? { kind: 'none' };
}

function HeroSlide({ banner, media, active, priority, onVideoRef, onVideoEnded, onVideoError }: { banner: HomepageBannerDto; media: HeroMedia; active: boolean; priority: boolean; onVideoRef: (id: string, video: HTMLVideoElement | null) => void; onVideoEnded: (id: string) => void; onVideoError: (id: string) => void }) {
  const { t } = useTranslations();
  const hasMedia = media.kind !== 'none';

  return (
    <article className="relative h-[78vh] min-h-[560px] w-full overflow-hidden bg-neutral-900 md:min-h-[680px]">
      {media.kind === 'image' && <div className="absolute inset-0 transition-opacity duration-300"><CommerceImage src={media.src} alt="" sizes="100vw" priority={priority} className="object-cover" /></div>}
      {media.kind === 'video' && <div className="absolute inset-0 transition-opacity duration-300">{media.fallbackImage && <CommerceImage src={media.fallbackImage} alt="" sizes="100vw" priority={priority} className="object-cover" />}<video key={media.src} ref={(video) => onVideoRef(banner.id, video)} className="pointer-events-none absolute inset-0 size-full object-cover [transform:none]" autoPlay={active} muted playsInline loop={false} preload={active ? 'metadata' : 'none'} aria-hidden="true" tabIndex={-1} disablePictureInPicture onEnded={() => onVideoEnded(banner.id)} onError={() => onVideoError(banner.id)}><source src={media.src} type={media.mimeType} /></video></div>}
      <div className={`absolute inset-0 ${hasMedia ? 'bg-gradient-to-b from-black/45 via-black/20 to-black/65' : 'bg-[radial-gradient(circle_at_top,#3b332b,#111_70%)]'}`} />
      <div className="relative z-10 flex h-full items-center justify-center px-6 text-center text-white">
        <div className="max-w-4xl">
          {banner.subtitle && <p className="mb-4 text-xs uppercase tracking-[0.28em] text-white/75 md:text-sm">{banner.subtitle}</p>}
          <h1 className="font-serif text-4xl font-light leading-tight sm:text-6xl lg:text-7xl">{banner.title}</h1>
          {banner.description && <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">{banner.description}</p>}
          <Link href={storefrontHref(banner.ctaUrl)} className="mt-8 inline-flex border border-white/80 px-8 py-3 text-xs font-semibold uppercase tracking-[0.22em] transition-colors hover:bg-white hover:text-black">
            {banner.ctaLabel || t('home.discover')}
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function HeroCarousel() {
  const { t } = useTranslations();
  const banners = useQuery({
    queryKey: ['homepage', 'banners', 'HERO_SLIDER'],
    queryFn: () => homepageApi.banners('HERO_SLIDER').then((response) => response.data.data),
    staleTime: 5 * 60_000,
    retry: 1,
  });
  const items = useMemo(() => [...(banners.data ?? [])].sort((left, right) => left.sortOrder - right.sortOrder), [banners.data]);
  const isMobile = useMediaPreference('(max-width: 767px)');
  const reducedMotion = useMediaPreference('(prefers-reduced-motion: reduce)');
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedVideos, setFailedVideos] = useState<Set<string>>(() => new Set());
  const swiperRef = useRef<SwiperInstance | null>(null);
  const videoRefs = useRef(new Map<string, HTMLVideoElement>());
  const timerRef = useRef<number | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const playAttemptRef = useRef(0);
  const endedVideosRef = useRef(new Set<string>());
  const currentIndex = activeIndex < items.length ? activeIndex : 0;
  const activeBanner = items[currentIndex];
  const activeBannerId = activeBanner?.id ?? null;
  const activeMedia = useMemo(() => activeBanner ? selectMedia(activeBanner, isMobile, reducedMotion, failedVideos.has(activeBanner.id)) : { kind: 'none' } satisfies HeroMedia, [activeBanner, failedVideos, isMobile, reducedMotion]);
  const hasAnotherMedia = useMemo(() => items.some((banner) => banner.id !== activeBanner?.id && selectMedia(banner, isMobile, reducedMotion, failedVideos.has(banner.id)).kind !== 'none'), [activeBanner?.id, failedVideos, isMobile, items, reducedMotion]);

  const clearSlideTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const pauseAndResetVideos = useCallback(() => {
    for (const video of videoRefs.current.values()) {
      video.pause();
      try { video.currentTime = 0; } catch { /* The media may not have metadata yet. */ }
    }
  }, []);

  const scheduleAdvance = useCallback((bannerId: string, delay: number) => {
    clearSlideTimer();
    if (items.length <= 1) return;
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      if (activeIdRef.current === bannerId && document.visibilityState === 'visible') swiperRef.current?.slideNext();
    }, delay);
  }, [clearSlideTimer, items.length]);

  const markVideoFailed = useCallback((bannerId: string) => {
    if (activeIdRef.current !== bannerId) return;
    setFailedVideos((current) => {
      if (current.has(bannerId)) return current;
      const next = new Set(current);
      next.add(bannerId);
      return next;
    });
  }, []);

  const safelyPlay = useCallback((bannerId: string, restart: boolean) => {
    const video = videoRefs.current.get(bannerId);
    if (!video || endedVideosRef.current.has(bannerId)) return;
    const attempt = ++playAttemptRef.current;
    if (restart) {
      try { video.currentTime = 0; } catch { /* The media may not have metadata yet. */ }
    }
    try {
      void video.play().catch((error: unknown) => {
        if (attempt !== playAttemptRef.current) return;
        if (error instanceof DOMException && error.name === 'AbortError') return;
        markVideoFailed(bannerId);
      });
    } catch {
      if (attempt === playAttemptRef.current) markVideoFailed(bannerId);
    }
  }, [markVideoFailed]);

  const registerVideo = useCallback((bannerId: string, video: HTMLVideoElement | null) => {
    if (video) videoRefs.current.set(bannerId, video);
    else videoRefs.current.delete(bannerId);
  }, []);

  const handleVideoEnded = useCallback((bannerId: string) => {
    if (activeIdRef.current !== bannerId) return;
    endedVideosRef.current.add(bannerId);
    if (items.length > 1) swiperRef.current?.slideNext();
  }, [items.length]);

  const handleSlideChange = useCallback((swiper: SwiperInstance) => {
    playAttemptRef.current += 1;
    clearSlideTimer();
    pauseAndResetVideos();
    const nextIndex = swiper.realIndex;
    const nextBanner = items[nextIndex];
    activeIdRef.current = nextBanner?.id ?? null;
    if (nextBanner) endedVideosRef.current.delete(nextBanner.id);
    setActiveIndex(nextIndex);
  }, [clearSlideTimer, items, pauseAndResetVideos]);

  useEffect(() => {
    activeIdRef.current = activeBannerId;
  }, [activeBannerId]);

  useEffect(() => {
    clearSlideTimer();
    playAttemptRef.current += 1;
    pauseAndResetVideos();
    if (!activeBanner || document.visibilityState !== 'visible') return;
    if (activeMedia.kind === 'video') safelyPlay(activeBanner.id, true);
    else if (activeMedia.kind === 'image') scheduleAdvance(activeBanner.id, HERO_IMAGE_DURATION_MS);
    else if (hasAnotherMedia) scheduleAdvance(activeBanner.id, 0);
    return () => {
      playAttemptRef.current += 1;
      clearSlideTimer();
    };
  }, [activeBanner, activeMedia, clearSlideTimer, hasAnotherMedia, pauseAndResetVideos, safelyPlay, scheduleAdvance]);

  useEffect(() => {
    const handleVisibility = () => {
      playAttemptRef.current += 1;
      clearSlideTimer();
      const bannerId = activeIdRef.current;
      if (!bannerId) return;
      const video = videoRefs.current.get(bannerId);
      if (document.visibilityState === 'hidden') {
        video?.pause();
        return;
      }
      if (activeMedia.kind === 'video') safelyPlay(bannerId, false);
      else if (activeMedia.kind === 'image') scheduleAdvance(bannerId, HERO_IMAGE_DURATION_MS);
      else if (hasAnotherMedia) scheduleAdvance(bannerId, 0);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [activeMedia, clearSlideTimer, hasAnotherMedia, safelyPlay, scheduleAdvance]);

  useEffect(() => () => {
    playAttemptRef.current += 1;
    clearSlideTimer();
    pauseAndResetVideos();
  }, [clearSlideTimer, pauseAndResetVideos]);

  if (banners.isLoading) return <div className="-mt-[88px] h-[78vh] min-h-[560px] animate-pulse bg-neutral-900 md:-mt-[96px] md:min-h-[680px]" />;

  if (!items.length) {
    return (
      <section className="-mt-[88px] flex h-[70vh] min-h-[520px] items-center justify-center bg-[radial-gradient(circle_at_top,#3b332b,#111_70%)] px-6 text-center text-white md:-mt-[96px]">
        <div><p className="text-xs uppercase tracking-[0.3em] text-white/60">Shoozy</p><h1 className="mt-4 font-serif text-5xl font-light md:text-7xl">{t('home.heroFallbackTitle')}</h1><Link href="/products" className="mt-8 inline-flex border border-white/80 px-8 py-3 text-xs uppercase tracking-[0.22em] hover:bg-white hover:text-black">{t('home.shopAll')}</Link></div>
      </section>
    );
  }

  return (
    <section className="-mt-[88px] md:-mt-[96px]">
      <Swiper modules={[Pagination]} pagination={items.length > 1 ? { clickable: true } : false} rewind={items.length > 1} speed={reducedMotion ? 0 : 300} onSwiper={(swiper) => { swiperRef.current = swiper; activeIdRef.current = items[swiper.realIndex]?.id ?? null; setActiveIndex(swiper.realIndex); }} onSlideChange={handleSlideChange} className="hero-cms-swiper">
        {items.map((banner, index) => {
          const media = selectMedia(banner, isMobile, reducedMotion, failedVideos.has(banner.id));
          return <SwiperSlide key={banner.id}><HeroSlide banner={banner} media={media} active={index === currentIndex} priority={index === 0} onVideoRef={registerVideo} onVideoEnded={handleVideoEnded} onVideoError={markVideoFailed} /></SwiperSlide>;
        })}
      </Swiper>
    </section>
  );
}

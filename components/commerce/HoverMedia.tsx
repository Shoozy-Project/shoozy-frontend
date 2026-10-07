'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CommerceImage } from '@/components/commerce/CommerceImage';
import { cn } from '@/lib/utils';
import type { CatalogMediaDto } from '@/types/commerce';

interface HoverMediaProps {
  imageUrl?: string | null;
  previewImages?: CatalogMediaDto[];
  videoUrl?: string | null;
  videoMimeType?: string | null;
  alt: string;
  sizes: string;
  className?: string;
  mediaClassName?: string;
  priority?: boolean;
}

const EMPTY_PREVIEW_IMAGES: CatalogMediaDto[] = [];
type VisibilityListener = (isVisible: boolean) => void;

const visibilityListeners = new WeakMap<Element, VisibilityListener>();
let visibilityObserver: IntersectionObserver | null = null;
let observedMediaCount = 0;

function observeMediaVisibility(node: Element, listener: VisibilityListener) {
  if (typeof IntersectionObserver === 'undefined') {
    listener(true);
    return () => undefined;
  }

  visibilityObserver ??= new IntersectionObserver((entries) => {
    entries.forEach((entry) => visibilityListeners.get(entry.target)?.(entry.isIntersecting));
  }, { threshold: 0.05 });

  visibilityListeners.set(node, listener);
  observedMediaCount += 1;
  visibilityObserver.observe(node);

  return () => {
    visibilityObserver?.unobserve(node);
    visibilityListeners.delete(node);
    observedMediaCount -= 1;
    if (observedMediaCount === 0) {
      visibilityObserver?.disconnect();
      visibilityObserver = null;
    }
  };
}

export function HoverMedia({ imageUrl, previewImages = EMPTY_PREVIEW_IMAGES, videoUrl, videoMimeType, alt, sizes, className, mediaClassName, priority }: HoverMediaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hoveringRef = useRef(false);
  const [hovering, setHovering] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [failedVideoSource, setFailedVideoSource] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => typeof document === 'undefined' || document.visibilityState === 'visible');
  const [reducedMotion, setReducedMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const images = useMemo(() => {
    const urls = [imageUrl, ...previewImages.map((image) => image.url)].filter((url): url is string => Boolean(url));
    return [...new Set(urls)];
  }, [imageUrl, previewImages]);
  const supportedVideo = Boolean(videoUrl && videoUrl !== failedVideoSource && (!videoMimeType || videoMimeType === 'video/mp4'));

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    return observeMediaVisibility(node, setIsVisible);
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
      if (event.matches) setImageIndex(0);
    };
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  useEffect(() => {
    if (images.length < 2 || reducedMotion || !isVisible || !pageVisible || hovering) return;
    const interval = window.setInterval(() => setImageIndex((current) => (current + 1) % images.length), 3000);
    return () => window.clearInterval(interval);
  }, [hovering, images.length, isVisible, pageVisible, reducedMotion]);

  const play = () => {
    hoveringRef.current = true;
    if (!supportedVideo || !window.matchMedia('(hover: hover) and (pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setHovering(true);
    const video = videoRef.current;
    if (!video) {
      setHovering(false);
      return;
    }
    void video.play().then(() => {
      if (hoveringRef.current) setShowVideo(true);
      else video.pause();
    }).catch(() => {
      setHovering(false);
      setShowVideo(false);
    });
  };

  const stop = () => {
    hoveringRef.current = false;
    setHovering(false);
    setShowVideo(false);
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    try { video.currentTime = 0; } catch { /* Metadata may not be available yet. */ }
  };

  const fail = () => {
    if (videoUrl) setFailedVideoSource(videoUrl);
    stop();
  };

  return (
    <div ref={containerRef} className={cn('relative h-full w-full overflow-hidden bg-muted', className)} onPointerEnter={play} onPointerLeave={stop} onPointerCancel={stop}>
      <div className={cn('absolute inset-0 transition-opacity duration-300 motion-reduce:transition-none', showVideo ? 'opacity-0' : 'opacity-100')}>
        {images.length > 0 ? images.map((src, index) => (
          <div key={src} aria-hidden={index !== imageIndex} className={cn('absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none', index === imageIndex ? 'opacity-100' : 'opacity-0')}>
            <CommerceImage src={src} alt={index === imageIndex ? alt : ''} sizes={sizes} priority={priority && index === 0} className={cn('h-full w-full', mediaClassName)} />
          </div>
        )) : <CommerceImage src={null} alt={alt} sizes={sizes} priority={priority} className={cn('h-full w-full', mediaClassName)} />}
      </div>
      {supportedVideo && (
        <video
          ref={videoRef}
          aria-hidden="true"
          muted
          loop
          playsInline
          preload="metadata"
          className={cn('absolute inset-0 hidden h-full w-full opacity-0 transition-opacity duration-300 motion-reduce:hidden [@media(hover:hover)_and_(pointer:fine)]:block', mediaClassName, showVideo && 'opacity-100')}
          onError={fail}
        >
          <source src={videoUrl!} type={videoMimeType || 'video/mp4'} />
        </video>
      )}
    </div>
  );
}

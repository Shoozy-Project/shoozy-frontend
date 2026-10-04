'use client';

import { useRef, useState } from 'react';
import { CommerceImage } from '@/components/commerce/CommerceImage';
import { cn } from '@/lib/utils';

interface HoverMediaProps {
  imageUrl?: string | null;
  videoUrl?: string | null;
  videoMimeType?: string | null;
  alt: string;
  sizes: string;
  className?: string;
  mediaClassName?: string;
  priority?: boolean;
}

export function HoverMedia({ imageUrl, videoUrl, videoMimeType, alt, sizes, className, mediaClassName, priority }: HoverMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hoveringRef = useRef(false);
  const [showVideo, setShowVideo] = useState(false);
  const [failedVideoSource, setFailedVideoSource] = useState<string | null>(null);
  const supportedVideo = Boolean(videoUrl && videoUrl !== failedVideoSource && (!videoMimeType || videoMimeType === 'video/mp4'));

  const play = () => {
    hoveringRef.current = true;
    if (!supportedVideo || !window.matchMedia('(hover: hover) and (pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const video = videoRef.current;
    if (!video) return;
    void video.play().then(() => {
      if (hoveringRef.current) setShowVideo(true);
      else video.pause();
    }).catch(() => setShowVideo(false));
  };

  const stop = () => {
    hoveringRef.current = false;
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
    <div className={cn('relative h-full w-full overflow-hidden bg-muted', className)} onPointerEnter={play} onPointerLeave={stop} onPointerCancel={stop}>
      <div className={cn('absolute inset-0 transition-opacity duration-300', showVideo ? 'opacity-0' : 'opacity-100')}>
        <CommerceImage src={imageUrl} alt={alt} sizes={sizes} priority={priority} className={cn('h-full w-full', mediaClassName)} />
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

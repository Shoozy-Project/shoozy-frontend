'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { canOptimizeImageSource, isRenderableImageSource } from '@/lib/image-hosts';
import { useTranslations } from '@/lib/hooks/use-translations';

interface CommerceImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  sizes: string;
  priority?: boolean;
}

export function CommerceImage({ src, alt, className, sizes, priority }: CommerceImageProps) {
  const { t } = useTranslations();
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const failed = Boolean(src && failedSource === src);

  if (!src || failed || !isRenderableImageSource(src)) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted text-muted-foreground" role="img" aria-label={t('catalog.imageUnavailableFor', { name: alt })}>
        <ImageOff className="size-7" aria-hidden="true" />
        <span className="text-xs">{t('catalog.imageUnavailable')}</span>
      </div>
    );
  }

  const sharedClassName = cn('object-cover', className);

  if (!canOptimizeImageSource(src)) {
    return (
      // Unknown external hosts intentionally bypass the Next.js optimizer allowlist.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className={cn('absolute inset-0 h-full w-full', sharedClassName)}
        onError={() => setFailedSource(src)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      preload={priority}
      className={sharedClassName}
      onError={() => setFailedSource(src)}
    />
  );
}

export const OPTIMIZED_IMAGE_PATTERNS = [
  {
    protocol: 'http' as const,
    hostname: 'localhost',
    port: '5000',
    pathname: '/**',
  },
  {
    protocol: 'https' as const,
    hostname: 'res.cloudinary.com',
    pathname: '/**',
  },
  {
    protocol: 'https' as const,
    hostname: 'lh3.googleusercontent.com',
    pathname: '/**',
  },
  {
    protocol: 'https' as const,
    hostname: 'shoozybackend-production-bede.up.railway.app',
    pathname: '/**',
  },
] as const;

export function isLocalImageSource(src: string) {
  return src.startsWith('/') && !src.startsWith('//');
}

function isBrowserLocalImageSource(src: string) {
  return src.startsWith('blob:') || /^data:image\/(?:avif|gif|jpeg|png|webp);base64,/i.test(src);
}

function parseExternalImageSource(src: string) {
  try {
    const url = new URL(src);
    if ((url.protocol !== 'http:' && url.protocol !== 'https:') || url.username || url.password) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

export function isRenderableImageSource(src: string) {
  return isLocalImageSource(src) || isBrowserLocalImageSource(src) || Boolean(parseExternalImageSource(src));
}

export function canOptimizeImageSource(src: string) {
  if (isLocalImageSource(src)) return true;
  const url = parseExternalImageSource(src);
  if (!url) return false;

  return OPTIMIZED_IMAGE_PATTERNS.some((pattern) => (
    url.protocol === `${pattern.protocol}:`
    && url.hostname === pattern.hostname
    && url.port === ('port' in pattern ? pattern.port : '')
  ));
}

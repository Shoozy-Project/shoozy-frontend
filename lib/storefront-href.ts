export function storefrontHref(value: string | null | undefined): string {
  const href = value?.trim();
  if (!href) return '/products';

  if (href.startsWith('/') && !href.startsWith('//') && !href.startsWith('/\\')) {
    try {
      const parsed = new URL(href, 'https://shoozy.local');
      parsed.pathname = parsed.pathname.replace(/^\/catalog(?:\/products)?(?=\/|$)/, '/products');
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      return '/products';
    }
  }

  try {
    const parsed = new URL(href);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : '/products';
  } catch {
    return '/products';
  }
}

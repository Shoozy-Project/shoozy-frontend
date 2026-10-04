import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from '@/components/commerce/ProductDetailClient';
import { PublicApiError, serverCatalog } from '@/lib/api/server-public';
import { getServerTranslations } from '@/lib/i18n-server';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [{ slug }, { t }] = await Promise.all([params, getServerTranslations()]);
  try {
    const product = await serverCatalog.product(slug);
    const description = product.seoDescription ?? product.shortDescription ?? product.description ?? undefined;
    const image = product.media.find((item) => item.isPrimary) ?? product.media[0];
    return {
      title: product.seoTitle ?? product.name,
      description,
      openGraph: { title: product.seoTitle ?? product.name, description, images: image ? [{ url: image.url, alt: image.altText ?? product.name }] : undefined },
    };
  } catch { return { title: t('meta.productTitle') }; }
}

export default async function ProductPage({ params }: Props) {
  const [{ slug }, { t }] = await Promise.all([params, getServerTranslations()]);
  let loaded: { product: Awaited<ReturnType<typeof serverCatalog.product>>; sizeGuide: Awaited<ReturnType<typeof serverCatalog.sizeGuide>> | null } | null = null;
  try {
    const product = await serverCatalog.product(slug);
    const sizeGuide = product.sizeGuide ? await serverCatalog.sizeGuide(product.sizeGuide.id).catch(() => null) : null;
    loaded = { product, sizeGuide };
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) notFound();
    loaded = null;
  }
  if (!loaded) return <div className="mx-auto max-w-3xl px-4 pb-24 pt-40 text-center"><h1 className="font-serif text-4xl">{t('product.unavailable')}</h1><p className="mt-3 text-muted-foreground">{t('product.unavailableCopy')}</p></div>;
  return <div className="mx-auto max-w-7xl px-4 pb-24 pt-40 sm:px-6 lg:px-8"><ProductDetailClient product={loaded.product} sizeGuide={loaded.sizeGuide} /></div>;
}

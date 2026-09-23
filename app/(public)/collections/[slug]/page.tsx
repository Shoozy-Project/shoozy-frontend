import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CatalogResults } from '@/components/commerce/CatalogResults';
import { PublicApiError, serverCatalog } from '@/lib/api/server-public';
import { getServerTranslations } from '@/lib/i18n-server';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [{ slug }, { t }] = await Promise.all([params, getServerTranslations()]);
  try {
    const collection = await serverCatalog.collection(slug, 1, 1);
    return { title: collection.name, description: collection.description ?? t('meta.collectionDescription', { name: collection.name }) };
  } catch { return { title: t('meta.collectionTitle') }; }
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const [{ slug }, query, { t }] = await Promise.all([params, searchParams, getServerTranslations()]);
  const requested = Number(typeof query.page === 'string' ? query.page : '1');
  const page = Number.isInteger(requested) && requested > 0 ? requested : 1;
  let collection: Awaited<ReturnType<typeof serverCatalog.collection>> | null = null;
  try {
    collection = await serverCatalog.collection(slug, page, 12);
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) notFound();
    collection = null;
  }
  if (!collection) return <div className="mx-auto max-w-3xl px-4 pb-24 pt-40 text-center"><h1 className="font-serif text-4xl">{t('collection.unavailableOne')}</h1><p className="mt-3 text-muted-foreground">{t('common.tryShortly')}</p></div>;
  return <div className="mx-auto max-w-7xl px-4 pb-24 pt-40 sm:px-6 lg:px-8"><p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{t('collection.kicker')}</p><h1 className="mt-3 font-serif text-4xl md:text-5xl">{collection.name}</h1>{collection.description && <p className="mt-3 max-w-2xl text-muted-foreground">{collection.description}</p>}<div className="mt-10"><CatalogResults result={collection.products} brands={[]} categories={[]} collections={[]} searchParams={query} pathname={`/collections/${slug}`} showFilters={false} /></div></div>;
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { HoverMedia } from '@/components/commerce/HoverMedia';
import { Pagination } from '@/components/commerce/Pagination';
import { serverCatalog } from '@/lib/api/server-public';
import { getServerTranslations } from '@/lib/i18n-server';

export async function generateMetadata(): Promise<Metadata> { const { t } = await getServerTranslations(); return { title: t('meta.collectionsTitle'), description: t('meta.collectionsDescription') }; }

export default async function CollectionsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [params, { t }] = await Promise.all([searchParams, getServerTranslations()]);
  const requested = Number(typeof params.page === 'string' ? params.page : '1');
  const page = Number.isInteger(requested) && requested > 0 ? requested : 1;
  let result: Awaited<ReturnType<typeof serverCatalog.collections>> | null = null;
  try {
    result = await serverCatalog.collections(page, 24);
  } catch {
    result = null;
  }
  if (!result) return <div className="mx-auto max-w-3xl px-4 pb-24 pt-40 text-center"><h1 className="font-serif text-4xl">{t('collection.unavailable')}</h1><p className="mt-3 text-muted-foreground">{t('common.tryShortly')}</p></div>;
  return <div className="mx-auto max-w-7xl px-4 pb-24 pt-40 sm:px-6 lg:px-8"><h1 className="font-serif text-4xl md:text-5xl">{t('collection.title')}</h1>{result.items.length ? <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{result.items.map((collection) => <Link key={collection.id} href={`/collections/${collection.slug}`} className="group overflow-hidden rounded-xl border bg-card"><div className="relative aspect-[4/3] overflow-hidden bg-muted"><HoverMedia imageUrl={collection.imageUrl} videoUrl={collection.videoUrl} videoMimeType={collection.videoMimeType} alt={collection.name} sizes="(max-width: 640px) 100vw, 33vw" mediaClassName="object-cover" /></div><div className="p-5"><div className="flex items-start justify-between gap-3"><h2 className="font-serif text-2xl">{collection.name}</h2><span className="shrink-0 text-xs text-muted-foreground">{collection.productCount}</span></div>{collection.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{collection.description}</p>}</div></Link>)}</div> : <p className="mt-12 text-muted-foreground">{t('collection.empty')}</p>}<Pagination pagination={result.pagination} pathname="/collections" searchParams={params} /></div>;
}

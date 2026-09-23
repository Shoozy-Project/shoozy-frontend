import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CatalogResults } from '@/components/commerce/CatalogResults';
import { findPublicCategory, serverCatalog } from '@/lib/api/server-public';
import { getServerTranslations } from '@/lib/i18n-server';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [{ slug }, { t }] = await Promise.all([params, getServerTranslations()]);
  try {
    const category = await findPublicCategory(slug);
    return category ? { title: category.name, description: category.description ?? t('meta.categoryDescription', { name: category.name }) } : { title: t('meta.categoryTitle') };
  } catch { return { title: t('meta.categoryTitle') }; }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, query, { t }] = await Promise.all([params, searchParams, getServerTranslations()]);
  const requested = Number(typeof query.page === 'string' ? query.page : '1');
  const page = Number.isInteger(requested) && requested > 0 ? requested : 1;
  let loaded: { category: Awaited<ReturnType<typeof findPublicCategory>>; result: Awaited<ReturnType<typeof serverCatalog.products>> } | null = null;
  try {
    const [category, result] = await Promise.all([findPublicCategory(slug), serverCatalog.products({ category: slug, page, limit: 12 })]);
    loaded = { category, result };
  } catch {
    loaded = null;
  }
  if (!loaded) return <div className="mx-auto max-w-3xl px-4 pb-24 pt-40 text-center"><h1 className="font-serif text-4xl">{t('category.unavailableOne')}</h1><p className="mt-3 text-muted-foreground">{t('common.tryShortly')}</p></div>;
  if (!loaded.category) notFound();
  return <div className="mx-auto max-w-7xl px-4 pb-24 pt-40 sm:px-6 lg:px-8"><p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{t('category.kicker')}</p><h1 className="mt-3 font-serif text-4xl md:text-5xl">{loaded.category.name}</h1>{loaded.category.description && <p className="mt-3 max-w-2xl text-muted-foreground">{loaded.category.description}</p>}<div className="mt-10"><CatalogResults result={loaded.result} brands={[]} categories={[]} collections={[]} searchParams={query} pathname={`/categories/${slug}`} showFilters={false} /></div></div>;
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CatalogResults } from '@/components/commerce/CatalogResults';
import { findPublicCategory, serverCatalog } from '@/lib/api/server-public';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const category = await findPublicCategory(slug);
    return category ? { title: category.name, description: category.description ?? `Shop ${category.name} at Shoozy.` } : { title: 'Category' };
  } catch { return { title: 'Category' }; }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const requested = Number(typeof query.page === 'string' ? query.page : '1');
  const page = Number.isInteger(requested) && requested > 0 ? requested : 1;
  let loaded: { category: Awaited<ReturnType<typeof findPublicCategory>>; result: Awaited<ReturnType<typeof serverCatalog.products>> } | null = null;
  try {
    const [category, result] = await Promise.all([findPublicCategory(slug), serverCatalog.products({ category: slug, page, limit: 12 })]);
    loaded = { category, result };
  } catch {
    loaded = null;
  }
  if (!loaded) return <div className="mx-auto max-w-3xl px-4 pb-24 pt-40 text-center"><h1 className="font-serif text-4xl">Category unavailable</h1><p className="mt-3 text-muted-foreground">Please try again shortly.</p></div>;
  if (!loaded.category) notFound();
  return <div className="mx-auto max-w-7xl px-4 pb-24 pt-40 sm:px-6 lg:px-8"><p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Category</p><h1 className="mt-3 font-serif text-4xl md:text-5xl">{loaded.category.name}</h1>{loaded.category.description && <p className="mt-3 max-w-2xl text-muted-foreground">{loaded.category.description}</p>}<div className="mt-10"><CatalogResults result={loaded.result} brands={[]} categories={[]} collections={[]} searchParams={query} pathname={`/categories/${slug}`} showFilters={false} /></div></div>;
}

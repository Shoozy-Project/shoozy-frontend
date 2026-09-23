import type { Metadata } from 'next';
import Link from 'next/link';
import { CommerceImage } from '@/components/commerce/CommerceImage';
import { Pagination } from '@/components/commerce/Pagination';
import { serverCatalog } from '@/lib/api/server-public';

export const metadata: Metadata = { title: 'Categories', description: 'Explore Shoozy footwear categories.' };

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const requested = Number(typeof params.page === 'string' ? params.page : '1');
  const page = Number.isInteger(requested) && requested > 0 ? requested : 1;
  let result: Awaited<ReturnType<typeof serverCatalog.categories>> | null = null;
  try {
    result = await serverCatalog.categories(page, 24);
  } catch {
    result = null;
  }
  if (!result) return <div className="mx-auto max-w-3xl px-4 pb-24 pt-40 text-center"><h1 className="font-serif text-4xl">Categories are unavailable</h1><p className="mt-3 text-muted-foreground">Please try again shortly.</p></div>;
  return <div className="mx-auto max-w-7xl px-4 pb-24 pt-40 sm:px-6 lg:px-8"><h1 className="font-serif text-4xl md:text-5xl">Shop by category</h1>{result.items.length ? <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{result.items.map((category) => <Link key={category.id} href={`/categories/${category.slug}`} className="group overflow-hidden rounded-xl border bg-card"><div className="relative aspect-[16/9] overflow-hidden bg-muted"><CommerceImage src={category.imageUrl} alt={category.name} sizes="(max-width: 640px) 100vw, 33vw" className="transition-transform duration-500 group-hover:scale-105" /></div><div className="p-5"><h2 className="font-serif text-2xl">{category.name}</h2>{category.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{category.description}</p>}</div></Link>)}</div> : <p className="mt-12 text-muted-foreground">No categories are currently available.</p>}<Pagination pagination={result.pagination} pathname="/categories" searchParams={params} /></div>;
}

import type { Metadata } from 'next';
import { CatalogResults } from '@/components/commerce/CatalogResults';
import { serverCatalog, serverCatalogEntities } from '@/lib/api/server-public';
import type { CatalogQuery, CatalogSort } from '@/types/commerce';
import { getServerTranslations } from '@/lib/i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return { title: t('meta.productsTitle'), description: t('meta.productsDescription') };
}

const SORTS = new Set<CatalogSort>(['newest', 'nameAsc', 'nameDesc', 'basePriceAsc', 'basePriceDesc']);
const integer = (value: string | undefined) => value && /^(?:0|[1-9]\d*)$/.test(value) ? value : undefined;
const text = (value: string | string[] | undefined) => typeof value === 'string' && value.trim() ? value.trim() : undefined;

function catalogQuery(params: Record<string, string | string[] | undefined>): CatalogQuery {
  const pageValue = Number(text(params.page) ?? '1');
  const sortValue = text(params.sort) as CatalogSort | undefined;
  return {
    page: Number.isSafeInteger(pageValue) && pageValue > 0 ? pageValue : 1,
    limit: 12,
    search: text(params.search),
    brand: text(params.brand),
    category: text(params.category),
    collection: text(params.collection),
    gender: text(params.gender),
    season: text(params.season),
    size: text(params.size),
    color: text(params.color),
    minPriceMinor: integer(text(params.minPriceMinor)),
    maxPriceMinor: integer(text(params.maxPriceMinor)),
    inStock: text(params.inStock) === 'true' ? true : undefined,
    sort: sortValue && SORTS.has(sortValue) ? sortValue : 'newest',
  };
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [params, { t }] = await Promise.all([searchParams, getServerTranslations()]);
  let loaded: Awaited<ReturnType<typeof loadProductsPage>> | null = null;
  try {
    loaded = await loadProductsPage(params);
  } catch {
    loaded = null;
  }
  if (!loaded) return <div className="mx-auto max-w-3xl px-4 pb-24 pt-40 text-center"><h1 className="font-serif text-4xl">{t('catalog.unavailable')}</h1><p className="mt-3 text-muted-foreground">{t('catalog.unavailableCopy')}</p></div>;
  return <div className="mx-auto max-w-7xl px-4 pb-20 pt-40 sm:px-6 lg:px-8"><div className="mb-10 max-w-2xl"><p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{t('catalog.kicker')}</p><h1 className="mt-3 font-serif text-4xl md:text-5xl">{t('catalog.title')}</h1>{typeof params.search === 'string' && <p className="mt-3 text-muted-foreground">{t('catalog.resultsFor', { search: params.search })}</p>}</div><CatalogResults result={loaded.result} brands={loaded.brands} categories={loaded.categories} collections={loaded.collections} colors={loaded.filters.colors} searchParams={params} /></div>;
}

async function loadProductsPage(params: Record<string, string | string[] | undefined>) {
  const [result, filters, brands, categories, collections] = await Promise.all([serverCatalog.products(catalogQuery(params)), serverCatalog.filters(), serverCatalogEntities.brands(), serverCatalogEntities.categories(), serverCatalogEntities.collections()]);
  return { result, filters, brands, categories, collections };
}

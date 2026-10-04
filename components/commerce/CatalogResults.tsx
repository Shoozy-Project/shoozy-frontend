'use client';

import { CatalogFilters, CatalogSortControl } from '@/components/commerce/CatalogFilters';
import { Pagination } from '@/components/commerce/Pagination';
import { ProductCard } from '@/components/commerce/ProductCard';
import type { PaginatedData } from '@/types/api';
import type { CatalogBrandDto, CatalogCategoryDto, CatalogCollectionDto, CatalogProductDto } from '@/types/commerce';
import { useTranslations } from '@/lib/hooks/use-translations';

interface CatalogResultsProps {
  result: PaginatedData<CatalogProductDto>;
  brands: CatalogBrandDto[];
  categories: CatalogCategoryDto[];
  collections: CatalogCollectionDto[];
  searchParams: Record<string, string | string[] | undefined>;
  pathname?: string;
  showFilters?: boolean;
}

export function CatalogResults({ result, brands, categories, collections, searchParams, pathname = '/products', showFilters = true }: CatalogResultsProps) {
  const { t } = useTranslations();
  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b pb-5">
        <p className="text-sm text-muted-foreground">{result.pagination.total === 1 ? t('catalog.productOne') : t('catalog.productCount', { count: result.pagination.total })}</p>
        {pathname === '/products' && <CatalogSortControl />}
      </div>
      <div className={showFilters ? 'grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]' : ''}>
        {showFilters && <CatalogFilters brands={brands} categories={categories} collections={collections} />}
        <div className="min-w-0">
          {result.items.length ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
              {result.items.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed px-6 py-20 text-center">
              <h2 className="font-serif text-2xl">{t('catalog.noProducts')}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t('catalog.noProductsCopy')}</p>
            </div>
          )}
          <Pagination pagination={result.pagination} pathname={pathname} searchParams={searchParams} />
        </div>
      </div>
    </>
  );
}

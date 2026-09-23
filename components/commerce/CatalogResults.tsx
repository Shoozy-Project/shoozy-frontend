import { CatalogFilters, CatalogSortControl } from '@/components/commerce/CatalogFilters';
import { Pagination } from '@/components/commerce/Pagination';
import { ProductCard } from '@/components/commerce/ProductCard';
import type { PaginatedData } from '@/types/api';
import type { CatalogBrandDto, CatalogCategoryDto, CatalogCollectionDto, CatalogProductDto } from '@/types/commerce';

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
  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b pb-5">
        <p className="text-sm text-muted-foreground">{result.pagination.total} {result.pagination.total === 1 ? 'product' : 'products'}</p>
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
              <h2 className="font-serif text-2xl">No products found</h2>
              <p className="mt-2 text-sm text-muted-foreground">Try removing a filter or using a different search.</p>
            </div>
          )}
          <Pagination pagination={result.pagination} pathname={pathname} searchParams={searchParams} />
        </div>
      </div>
    </>
  );
}

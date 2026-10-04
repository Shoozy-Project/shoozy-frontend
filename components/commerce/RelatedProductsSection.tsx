'use client';

import { useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { catalogApi } from '@/lib/api/catalog';
import { ProductCard } from '@/components/commerce/ProductCard';
import { useTranslations } from '@/lib/hooks/use-translations';

export function RelatedProductsSection({ slug }: { slug: string }) {
  const { t } = useTranslations();
  const scrollRef = useRef<HTMLDivElement>(null);
  const related = useQuery({
    queryKey: ['catalog', 'related-products', slug],
    queryFn: () => catalogApi.relatedProducts(slug, 8).then((response) => response.data.data.items),
    staleTime: 60_000,
    retry: 1,
  });

  const scroll = useCallback((direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollBy({ left: (direction === 'left' ? -1 : 1) * container.clientWidth * 0.75, behavior: 'smooth' });
  }, []);

  if (related.isError || (!related.isLoading && !related.data?.length)) return null;

  return (
    <section className="overflow-hidden border-t border-border bg-background py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-serif text-2xl font-light md:text-3xl">{t('product.related')}</h2>
          <div className="hidden items-center gap-3 md:flex">
            <button type="button" onClick={() => scroll('left')} className="flex size-11 items-center justify-center rounded-full border hover:bg-muted" aria-label={t('product.relatedPrevious')}>
              <ChevronLeft className="size-5 rtl:rotate-180" strokeWidth={1.25} />
            </button>
            <button type="button" onClick={() => scroll('right')} className="flex size-11 items-center justify-center rounded-full border hover:bg-muted" aria-label={t('product.relatedNext')}>
              <ChevronRight className="size-5 rtl:rotate-180" strokeWidth={1.25} />
            </button>
          </div>
        </div>
        <div ref={scrollRef} className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
          {related.isLoading
            ? Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="w-[70%] shrink-0 snap-start sm:w-[48%] md:w-[31%] lg:w-[23%]" aria-hidden="true">
                  <div className="aspect-[4/5] animate-pulse bg-muted" />
                  <div className="mt-4 h-4 w-3/4 animate-pulse bg-muted" />
                </div>
              ))
            : related.data?.map((product) => (
                <div key={product.id} className="w-[70%] shrink-0 snap-start sm:w-[48%] md:w-[31%] lg:w-[23%]">
                  <ProductCard product={product} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}

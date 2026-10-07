'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { catalogApi } from '@/lib/api/catalog';
import { ProductCard } from '@/components/commerce/ProductCard';
import { HorizontalAutoRail } from '@/components/storefront/HorizontalAutoRail';
import { useTranslations } from '@/lib/hooks/use-translations';

export default function OurSelectionCarousel() {
  const { t } = useTranslations();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const categories = useQuery({
    queryKey: ['catalog', 'home-categories'],
    queryFn: () => catalogApi.categories({ page: 1, limit: 50 }).then((response) => response.data.data.items),
    staleTime: 5 * 60_000,
  });

  const selectedCategory = activeCategory ?? categories.data?.[0]?.slug ?? null;

  const products = useQuery({
    queryKey: ['catalog', 'home-products', selectedCategory],
    queryFn: () => catalogApi.products({ category: selectedCategory!, page: 1, limit: 8, sort: 'newest' }).then((response) => response.data.data.items),
    enabled: Boolean(selectedCategory),
    staleTime: 60_000,
  });

  return (
    <section id="our-selection" className="scroll-mt-20 overflow-hidden bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{t('home.justIn')}</p><h2 className="mt-2 font-serif text-3xl font-light md:text-5xl">{t('home.selection')}</h2></div>
          <Link href="/products" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]">{t('home.shopAll')} <ArrowRight className="size-4 rtl:rotate-180" /></Link>
        </div>

        <div className="mb-8 flex gap-6 overflow-x-auto border-b [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.isLoading && Array.from({ length: 5 }, (_, index) => <div key={index} className="mb-3 h-5 w-24 shrink-0 animate-pulse bg-muted" />)}
          {categories.data?.map((category) => (
            <button key={category.id} type="button" onClick={() => setActiveCategory(category.slug)} className={`shrink-0 border-b-2 pb-3 text-xs uppercase tracking-[0.16em] ${selectedCategory === category.slug ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              {category.name} <span className="ms-1 opacity-60">{category.productCount}</span>
            </button>
          ))}
        </div>

        {categories.isError || products.isError ? (
          <div className="py-10 text-center text-sm text-muted-foreground"><p>{t('home.selectionError')}</p><button type="button" onClick={() => { void categories.refetch(); void products.refetch(); }} className="mt-3 underline">{t('common.retry')}</button></div>
        ) : (
          <HorizontalAutoRail
            ariaLabel={t('home.selection')}
            className="-mx-4 px-4 pb-4 sm:mx-0 sm:px-0"
            itemClassName="!w-[72%] sm:!w-[47%] md:!w-[31%] lg:!w-[23%]"
          >
            {products.isPending || !selectedCategory || !products.data
              ? Array.from({ length: 6 }, (_, index) => <div key={index} className="h-full"><div className="aspect-[4/5] animate-pulse bg-muted" /></div>)
              : products.data.map((product) => <div key={product.id} className="h-full"><ProductCard product={product} /></div>)}
          </HorizontalAutoRail>
        )}
      </div>
    </section>
  );
}

'use client';

import Link from 'next/link';
import { ProductCard } from '@/components/commerce/ProductCard';
import { usePublicProducts } from '@/lib/hooks/use-promotions';
import { useTranslations } from '@/lib/hooks/use-translations';

export default function OurSelection() {
  const products = usePublicProducts();
  const { t } = useTranslations();

  if (products.isLoading) {
    return (
      <section className="bg-background py-24" aria-busy="true">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 h-9 w-52 animate-pulse bg-muted" />
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="aspect-[4/5] animate-pulse bg-muted" />)}</div>
        </div>
      </section>
    );
  }

  if (products.isError) {
    return <section className="bg-background px-4 py-20 text-center"><h2 className="font-serif text-3xl">{t('home.selection')}</h2><p className="mt-3 text-sm text-muted-foreground">{t('home.selectionError')}</p></section>;
  }

  if (!products.data?.length) return null;

  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{t('home.justIn')}</p><h2 className="mt-2 font-serif text-3xl">{t('home.selection')}</h2></div>
          <Link href="/products" className="text-sm underline underline-offset-4">{t('home.shopAll')}</Link>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">{products.data.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </div>
    </section>
  );
}

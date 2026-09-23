'use client';

import { FormEvent, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatMinorAmount, majorToMinorString } from '@/lib/format-money';
import type { CatalogBrandDto, CatalogCategoryDto, CatalogCollectionDto, CatalogSort } from '@/types/commerce';
import { useTranslations } from '@/lib/hooks/use-translations';

interface CatalogFiltersProps {
  brands: CatalogBrandDto[];
  categories: CatalogCategoryDto[];
  collections: CatalogCollectionDto[];
}

const SORTS: Array<{ value: CatalogSort; labelKey: string }> = [
  { value: 'newest', labelKey: 'catalog.newest' },
  { value: 'nameAsc', labelKey: 'catalog.nameAsc' },
  { value: 'nameDesc', labelKey: 'catalog.nameDesc' },
  { value: 'basePriceAsc', labelKey: 'catalog.priceAsc' },
  { value: 'basePriceDesc', labelKey: 'catalog.priceDesc' },
];

function displayMinor(value: string | null) {
  return value && /^(?:0|[1-9]\d*)$/.test(value) ? formatMinorAmount(value, 3) : '';
}

function FilterFields({ brands, categories, collections, idPrefix }: CatalogFiltersProps & { idPrefix: string }) {
  const searchParams = useSearchParams();
  const { t } = useTranslations();
  const min = searchParams.get('minPriceMinor');
  const max = searchParams.get('maxPriceMinor');
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-catalog-search`}>{t('common.search')}</Label>
        <Input id={`${idPrefix}-catalog-search`} name="search" defaultValue={searchParams.get('search') ?? ''} placeholder={t('catalog.searchShoes')} />
      </div>
      {[
        ['category', 'catalog.category', categories],
        ['brand', 'catalog.brand', brands],
        ['collection', 'catalog.collection', collections],
      ].map(([name, label, options]) => (
        <div className="space-y-2" key={name as string}>
          <Label htmlFor={`${idPrefix}-filter-${name}`}>{t(label as string)}</Label>
          <select id={`${idPrefix}-filter-${name}`} name={name as string} defaultValue={searchParams.get(name as string) ?? ''} className="h-9 w-full rounded-lg border bg-background px-3 text-sm">
            <option value="">{t('catalog.all')}</option>
            {(options as Array<{ slug: string; name: string }>).map((option) => <option key={option.slug} value={option.slug}>{option.name}</option>)}
          </select>
        </div>
      ))}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-min-price`}>{t('catalog.minPrice')}</Label>
          <Input id={`${idPrefix}-min-price`} name="minPrice" inputMode="decimal" pattern="[0-9]+([.][0-9]{1,3})?" title={t('catalog.amountHint')} defaultValue={displayMinor(min)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-max-price`}>{t('catalog.maxPrice')}</Label>
          <Input id={`${idPrefix}-max-price`} name="maxPrice" inputMode="decimal" pattern="[0-9]+([.][0-9]{1,3})?" title={t('catalog.amountHint')} defaultValue={displayMinor(max)} />
        </div>
      </div>
      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" name="inStock" value="true" defaultChecked={searchParams.get('inStock') === 'true'} className="size-4" />
        {t('catalog.inStockOnly')}
      </label>
      <Button type="submit" className="h-10 w-full">{t('catalog.applyFilters')}</Button>
    </div>
  );
}

export function CatalogFilters(props: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslations();
  const active = useMemo(() => ['search', 'category', 'brand', 'collection', 'gender', 'season', 'size', 'color', 'minPriceMinor', 'maxPriceMinor', 'inStock'].filter((key) => searchParams.has(key)), [searchParams]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next = new URLSearchParams(searchParams);
    ['search', 'category', 'brand', 'collection', 'inStock', 'minPriceMinor', 'maxPriceMinor', 'page'].forEach((key) => next.delete(key));
    ['search', 'category', 'brand', 'collection', 'inStock'].forEach((key) => {
      const value = String(form.get(key) ?? '').trim();
      if (value) next.set(key, value);
    });
    const min = String(form.get('minPrice') ?? '').trim();
    const max = String(form.get('maxPrice') ?? '').trim();
    const minMinor = min ? majorToMinorString(min, 3) : undefined;
    const maxMinor = max ? majorToMinorString(max, 3) : undefined;
    const maxInput = event.currentTarget.elements.namedItem('maxPrice') as HTMLInputElement | null;
    if (minMinor && maxMinor && BigInt(minMinor) > BigInt(maxMinor)) {
      maxInput?.setCustomValidity(t('catalog.priceRangeError'));
      maxInput?.reportValidity();
      return;
    }
    maxInput?.setCustomValidity('');
    if (minMinor) next.set('minPriceMinor', minMinor);
    if (maxMinor) next.set('maxPriceMinor', maxMinor);
    router.push(`${pathname}${next.size ? `?${next}` : ''}`);
    setMobileOpen(false);
  };

  const clear = () => {
    const next = new URLSearchParams();
    const sort = searchParams.get('sort');
    if (sort && sort !== 'newest') next.set('sort', sort);
    router.push(`${pathname}${next.size ? `?${next}` : ''}`);
  };

  const remove = (key: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    next.delete('page');
    router.push(`${pathname}${next.size ? `?${next}` : ''}`);
  };
  const form = (idPrefix: string) => <form key={`${idPrefix}-${searchParams}`} onSubmit={submit}><FilterFields {...props} idPrefix={idPrefix} /></form>;
  const pills = active.length > 0 && <div className="mb-5 flex flex-wrap gap-2">{active.map((key) => {
    const raw = searchParams.get(key) ?? '';
    const value = key === 'minPriceMinor' || key === 'maxPriceMinor' ? `${displayMinor(raw) || raw} TND` : key === 'inStock' ? t('catalog.inStock') : raw;
    const label = key === 'minPriceMinor' ? t('catalog.min') : key === 'maxPriceMinor' ? t('catalog.max') : t(`catalog.${key}`);
    return <button type="button" key={key} onClick={() => remove(key)} className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs capitalize" aria-label={t('catalog.removeFilter', { name: label })}><span>{label}: {value}</span><X className="size-3" /></button>;
  })}</div>;
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 lg:hidden">
        <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
          <DialogTrigger asChild><Button variant="outline" className="h-10"><SlidersHorizontal /> {t('catalog.filters')} {active.length ? `(${active.length})` : ''}</Button></DialogTrigger>
          <DialogContent className="start-auto end-0 top-0 h-dvh max-h-dvh w-[min(90vw,420px)] max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-none p-6">
            <DialogHeader><DialogTitle>{t('catalog.filterProducts')}</DialogTitle><DialogDescription>{t('catalog.filterCopy')}</DialogDescription></DialogHeader>
            {pills}
            {form('mobile')}
          </DialogContent>
        </Dialog>
        {active.length > 0 && <Button variant="ghost" onClick={clear}><X /> {t('catalog.clearAll')}</Button>}
      </div>
      <aside className="hidden lg:block">
        <div className="mb-5 flex items-center justify-between"><h2 className="font-serif text-xl">{t('catalog.filters')}</h2>{active.length > 0 && <button type="button" onClick={clear} className="text-xs underline">{t('catalog.clearAll')}</button>}</div>
        {pills}
        {form('desktop')}
      </aside>
    </>
  );
}

export function CatalogSortControl() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = (searchParams.get('sort') ?? 'newest') as CatalogSort;
  const { t } = useTranslations();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span>{t('catalog.sort')}</span>
      <select
        value={value}
        onChange={(event) => {
          const next = new URLSearchParams(searchParams);
          if (event.target.value === 'newest') next.delete('sort'); else next.set('sort', event.target.value);
          next.delete('page');
          router.push(`${pathname}${next.size ? `?${next}` : ''}`);
        }}
        className="h-9 rounded-lg border bg-background px-3"
      >
        {SORTS.map((sort) => <option value={sort.value} key={sort.value}>{t(sort.labelKey)}</option>)}
      </select>
    </label>
  );
}

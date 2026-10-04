'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { Check, ChevronLeft, ChevronRight, Loader2, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { productsApi } from '@/lib/api/products';
import { categoriesApi } from '@/lib/api/categories';
import { collectionsApi } from '@/lib/api/collections';
import type { CouponDto, DiscountScope, DiscountTargetInput } from '@/lib/api/promotions';
import { useTranslations } from '@/lib/hooks/use-translations';

type Choice = { id: string; label: string; detail?: string };

function targetId(target: DiscountTargetInput) {
  if ('productId' in target) return target.productId;
  if ('variantId' in target) return target.variantId;
  if ('categoryId' in target) return target.categoryId;
  return target.collectionId;
}

function initialLabels(coupon: CouponDto | null | undefined) {
  return Object.fromEntries((coupon?.targets ?? []).map((target) => {
    if (target.productId && target.product) return [target.productId, target.product.name];
    if (target.variantId && target.variant) return [target.variantId, `${target.variant.product.name} · ${target.variant.sku}`];
    if (target.categoryId && target.category) return [target.categoryId, target.category.name];
    if (target.collectionId && target.collection) return [target.collectionId, target.collection.name];
    return ['', ''];
  }).filter(([id]) => id));
}

export function PromotionTargetSelector({
  scope,
  value,
  onChange,
  coupon,
}: {
  scope: DiscountScope;
  value: DiscountTargetInput[];
  onChange: (value: DiscountTargetInput[]) => void;
  coupon?: CouponDto | null;
}) {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [variantProductId, setVariantProductId] = useState<string | null>(null);
  const [labels, setLabels] = useState<Record<string, string>>(() => initialLabels(coupon));
  const { t } = useTranslations();
  const scopeLabel = t(({ PRODUCT: 'promotion.products', VARIANT: 'promotion.variants', CATEGORY: 'promotion.categories', COLLECTION: 'promotion.collections', ORDER: 'promotion.order', CATALOG: 'promotion.catalog' } as const)[scope]);
  const selectedIds = useMemo(() => new Set(value.map(targetId)), [value]);
  const requiresTargets = !['ORDER', 'CATALOG'].includes(scope);

  const products = useQuery({
    queryKey: ['promotion-target-products', scope, page, debouncedSearch],
    queryFn: () => productsApi.list({ page, limit: 10, search: debouncedSearch.trim() || undefined, status: 'ACTIVE' }).then((response) => response.data.data),
    enabled: scope === 'PRODUCT' || scope === 'VARIANT',
    placeholderData: (previous) => previous,
  });
  const categories = useQuery({
    queryKey: ['promotion-target-categories', page, debouncedSearch],
    queryFn: () => categoriesApi.list({ page, limit: 10, search: debouncedSearch.trim() || undefined, isActive: true }).then((response) => response.data.data),
    enabled: scope === 'CATEGORY',
    placeholderData: (previous) => previous,
  });
  const collections = useQuery({
    queryKey: ['promotion-target-collections', page, debouncedSearch],
    queryFn: () => collectionsApi.list({ page, limit: 10, search: debouncedSearch.trim() || undefined, isActive: true }).then((response) => response.data.data),
    enabled: scope === 'COLLECTION',
    placeholderData: (previous) => previous,
  });
  const variantProduct = useQuery({
    queryKey: ['promotion-target-product-variants', variantProductId],
    queryFn: () => productsApi.get(variantProductId!).then((response) => response.data.data),
    enabled: scope === 'VARIANT' && !!variantProductId,
  });

  if (!requiresTargets) {
    return <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">{scope === 'CATALOG' ? t('promotion.catalogApplies') : t('promotion.orderTargets')}</p>;
  }

  const result = scope === 'CATEGORY' ? categories.data : scope === 'COLLECTION' ? collections.data : products.data;
  const loading = scope === 'CATEGORY' ? categories.isPending : scope === 'COLLECTION' ? collections.isPending : products.isPending;
  const error = scope === 'CATEGORY' ? categories.isError : scope === 'COLLECTION' ? collections.isError : products.isError;
  const choices: Choice[] = scope === 'CATEGORY'
    ? (categories.data?.items ?? []).map((item) => ({ id: item.id, label: item.name, detail: item.slug }))
    : scope === 'COLLECTION'
      ? (collections.data?.items ?? []).map((item) => ({ id: item.id, label: item.name, detail: item.slug }))
      : (products.data?.items ?? []).map((item) => ({ id: item.id, label: item.name, detail: item.skuPrefix ?? item.slug }));

  const makeTarget = (id: string): DiscountTargetInput => {
    if (scope === 'PRODUCT') return { productId: id };
    if (scope === 'CATEGORY') return { categoryId: id };
    if (scope === 'COLLECTION') return { collectionId: id };
    return { variantId: id };
  };
  const toggle = (choice: Choice) => {
    setLabels((current) => ({ ...current, [choice.id]: choice.label }));
    onChange(selectedIds.has(choice.id) ? value.filter((item) => targetId(item) !== choice.id) : [...value, makeTarget(choice.id)]);
  };

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-lg border bg-orange-50/40 p-3 dark:bg-orange-950/20">
          {value.map((target) => {
            const id = targetId(target);
            return <span key={id} className="inline-flex max-w-full items-center gap-1 rounded-full border bg-background px-2 py-1 text-xs"><span className="truncate">{labels[id] ?? id}</span><button type="button" onClick={() => onChange(value.filter((item) => targetId(item) !== id))} aria-label={t('promotion.removeTarget')}><X className="size-3" /></button></span>;
          })}
        </div>
      )}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} className="ps-9" placeholder={t('promotion.searchTargets', { scope: scopeLabel })} />
      </div>
      {loading && <div className="flex justify-center p-8"><Loader2 className="size-5 animate-spin text-[#FF8C00]" /></div>}
      {error && <p className="p-5 text-center text-sm text-destructive">{t('promotion.targetsError')}</p>}
      {!loading && !error && scope !== 'VARIANT' && (
        <div className="max-h-56 divide-y overflow-y-auto rounded-lg border">
          {choices.length === 0 && <p className="p-8 text-center text-xs text-muted-foreground">{t('promotion.noTargets')}</p>}
          {choices.map((choice) => <button key={choice.id} type="button" onClick={() => toggle(choice)} className="flex w-full items-center justify-between gap-3 p-3 text-start text-sm hover:bg-muted"><span><span className="block font-medium">{choice.label}</span>{choice.detail && <span className="block text-xs text-muted-foreground">{choice.detail}</span>}</span>{selectedIds.has(choice.id) && <Check className="size-4 text-[#FF8C00]" />}</button>)}
        </div>
      )}
      {!loading && !error && scope === 'VARIANT' && !variantProductId && (
        <div className="max-h-56 divide-y overflow-y-auto rounded-lg border">
          {choices.map((choice) => <button key={choice.id} type="button" onClick={() => { setVariantProductId(choice.id); setLabels((current) => ({ ...current, [choice.id]: choice.label })); }} className="flex w-full items-center justify-between p-3 text-start text-sm hover:bg-muted"><span><span className="block font-medium">{choice.label}</span><span className="text-xs text-muted-foreground">{choice.detail}</span></span><ChevronRight className="size-4" /></button>)}
        </div>
      )}
      {scope === 'VARIANT' && variantProductId && (
        <div className="rounded-lg border">
          <button type="button" onClick={() => setVariantProductId(null)} className="flex items-center gap-1 border-b p-3 text-xs font-medium"><ChevronLeft className="size-4 rtl:rotate-180" />{t('promotion.backProducts')}</button>
          {variantProduct.isPending && <div className="flex justify-center p-8"><Loader2 className="size-5 animate-spin" /></div>}
          <div className="max-h-56 divide-y overflow-y-auto">
            {variantProduct.data?.variants.map((variant) => {
              const label = `${variantProduct.data.name} · ${variant.sku}`;
              return <button key={variant.id} type="button" onClick={() => toggle({ id: variant.id, label, detail: t('promotion.stock', { title: variant.title, count: variant.stockQuantity }) })} className="flex w-full items-center justify-between gap-3 p-3 text-start text-sm hover:bg-muted"><span><span className="font-mono font-medium">{variant.sku}</span><span className="block text-xs text-muted-foreground">{t('promotion.stock', { title: variant.title, count: variant.stockQuantity })}</span></span>{selectedIds.has(variant.id) && <Check className="size-4 text-[#FF8C00]" />}</button>;
            })}
          </div>
        </div>
      )}
      {result?.pagination && result.pagination.totalPages > 1 && !variantProductId && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{t('account.pageOf', { page: result.pagination.page, total: result.pagination.totalPages })}</span>
          <div className="flex gap-1"><Button type="button" size="icon" variant="outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft className="size-4" /></Button><Button type="button" size="icon" variant="outline" disabled={page >= result.pagination.totalPages} onClick={() => setPage((value) => value + 1)}><ChevronRight className="size-4" /></Button></div>
        </div>
      )}
    </div>
  );
}

'use client';

import { FormEvent } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { CommerceImage } from '@/components/commerce/CommerceImage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { commerceErrorMessage } from '@/lib/api/errors';
import { formatMinorMoney } from '@/lib/format-money';
import { useCartMutation, useCurrentCart } from '@/lib/hooks/use-commerce';
import { selectIsAuthenticated, useAuthStore } from '@/stores/auth-store';
import { useTranslations } from '@/lib/hooks/use-translations';

export function CartPageClient() {
  const authenticated = useAuthStore(selectIsAuthenticated);
  const cart = useCurrentCart();
  const update = useCartMutation('update');
  const remove = useCartMutation('remove');
  const coupon = useCartMutation('coupon');
  const removeCoupon = useCartMutation('removeCoupon');
  const { locale, t } = useTranslations();
  const intlLocale = locale === 'ar' ? 'ar-TN' : 'en-TN';
  const mutating = update.isPending || remove.isPending || coupon.isPending || removeCoupon.isPending;

  const showError = (error: unknown, fallback: string) => toast.error(commerceErrorMessage(error, fallback));
  const applyCoupon = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get('code') ?? '').trim();
    if (!code) return;
    coupon.mutate({ code }, { onSuccess: () => toast.success(t('cart.couponApplied')), onError: (error) => showError(error, t('cart.couponApplyError')) });
  };

  if (cart.isLoading) return <div className="py-20 text-center text-muted-foreground">{t('cart.loading')}</div>;
  if (cart.isError || !cart.data) return <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center"><h2 className="font-serif text-2xl">{t('cart.loadError')}</h2><Button variant="outline" className="mt-5" onClick={() => cart.refetch()}>{t('common.retry')}</Button></div>;

  if (cart.data.items.length === 0) {
    return <div className="rounded-xl border border-dashed px-6 py-20 text-center"><h2 className="font-serif text-3xl">{t('cart.empty')}</h2><p className="mt-3 text-muted-foreground">{t('cart.emptyCopy')}</p><Button asChild className="mt-7 h-11 px-6"><Link href="/products">{t('cart.shop')}</Link></Button></div>;
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section aria-label={t('cart.items')} className="space-y-5">
        {!authenticated && <p className="rounded-lg bg-muted px-4 py-3 text-sm">{t('cart.guest')}</p>}
        {cart.data.items.map((item) => (
          <article key={item.id} className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 border-b pb-5 sm:grid-cols-[128px_minmax(0,1fr)_auto]">
            <Link href={`/products/${item.product.slug}`} className="relative aspect-square overflow-hidden bg-muted"><CommerceImage src={item.media?.url} alt={item.media?.altText || item.product.name} sizes="128px" className="object-contain p-2" /></Link>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{item.product.brand.name}</p>
              <Link href={`/products/${item.product.slug}`} className="mt-1 block font-serif text-xl hover:underline">{item.product.name}</Link>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">{item.variant.options.map((option) => <span key={option.value.id}>{option.option.name}: {option.value.displayValue || option.value.value}</span>)}</div>
              {!item.available && <p className="mt-2 text-sm font-medium text-destructive">{t('cart.attention')}</p>}
              <div className="mt-4 flex items-center gap-4 sm:hidden">
                <Quantity itemId={item.id} quantity={item.quantity} stock={item.variant.stockQuantity} disabled={mutating} onChange={(quantity) => update.mutate({ itemId: item.id, quantity }, { onError: (error) => showError(error, t('cart.quantityError')) })} />
                <button type="button" onClick={() => remove.mutate({ itemId: item.id }, { onError: (error) => showError(error, t('cart.removeError')) })} className="text-muted-foreground" aria-label={t('cart.removeItem', { name: item.product.name })}><Trash2 className="size-4" /></button>
              </div>
            </div>
            <div className="col-span-2 flex items-center justify-between sm:col-span-1 sm:flex-col sm:items-end">
              <p className="font-medium">{formatMinorMoney(item.lineTotalMinor, cart.data.currency, 3, intlLocale)}</p>
              <div className="hidden items-center gap-3 sm:flex">
                <Quantity itemId={item.id} quantity={item.quantity} stock={item.variant.stockQuantity} disabled={mutating} onChange={(quantity) => update.mutate({ itemId: item.id, quantity }, { onError: (error) => showError(error, t('cart.quantityError')) })} />
                <button type="button" onClick={() => remove.mutate({ itemId: item.id }, { onError: (error) => showError(error, t('cart.removeError')) })} className="text-muted-foreground hover:text-destructive" aria-label={t('cart.removeItem', { name: item.product.name })}><Trash2 className="size-4" /></button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <aside className="h-fit rounded-xl border p-5 lg:sticky lg:top-40">
        <h2 className="font-serif text-2xl">{t('cart.summary')}</h2>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between gap-4"><dt>{t('cart.subtotal')}</dt><dd>{formatMinorMoney(cart.data.totals.subtotalMinor, cart.data.currency, 3, intlLocale)}</dd></div>
          {BigInt(cart.data.totals.merchandiseDiscountMinor) > BigInt(0) && <div className="flex justify-between gap-4 text-green-700 dark:text-green-400"><dt>{t('cart.discount')}</dt><dd>−{formatMinorMoney(cart.data.totals.merchandiseDiscountMinor, cart.data.currency, 3, intlLocale)}</dd></div>}
          <div className="flex justify-between gap-4 border-t pt-3 font-semibold"><dt>{t('cart.estimated')}</dt><dd>{formatMinorMoney(cart.data.totals.estimatedTotalMinor, cart.data.currency, 3, intlLocale)}</dd></div>
        </dl>
        {cart.data.discountCode ? (
          <div className="mt-5 flex items-center justify-between rounded-lg bg-muted p-3 text-sm"><span>{t('cart.couponLabel', { code: cart.data.discountCode })}</span><button type="button" className="underline" onClick={() => removeCoupon.mutate({}, { onError: (error) => showError(error, t('cart.couponRemoveError')) })}>{t('common.remove')}</button></div>
        ) : (
          <form onSubmit={applyCoupon} className="mt-5 flex gap-2"><Input name="code" maxLength={80} placeholder={t('cart.coupon')} aria-label={t('cart.coupon')} className="h-10" /><Button type="submit" variant="outline" className="h-10" disabled={coupon.isPending}>{t('common.apply')}</Button></form>
        )}
        {cart.data.issues.length > 0 && cart.data.issues.some((issue) => issue !== 'CART_EMPTY') && <p className="mt-4 text-sm text-destructive">{t('cart.resolve')}</p>}
        {cart.data.checkoutEligible ? <Button asChild className="mt-5 h-12 w-full"><Link href="/checkout">{t('cart.checkout')}</Link></Button> : <Button className="mt-5 h-12 w-full" disabled>{t('cart.unavailable')}</Button>}
        {cart.data.priceNotice && <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{cart.data.priceNotice}</p>}
      </aside>
    </div>
  );
}

function Quantity({ quantity, stock, disabled, onChange }: { itemId: string; quantity: number; stock: number; disabled: boolean; onChange: (quantity: number) => void }) {
  const { t } = useTranslations();
  return (
    <div className="flex items-center rounded-lg border">
      <button type="button" className="p-2" aria-label={t('product.decrease')} disabled={disabled || quantity <= 1} onClick={() => onChange(quantity - 1)}><Minus className="size-3.5" /></button>
      <span className="min-w-7 text-center text-sm">{quantity}</span>
      <button type="button" className="p-2" aria-label={t('product.increase')} disabled={disabled || quantity >= stock} onClick={() => onChange(quantity + 1)}><Plus className="size-3.5" /></button>
    </div>
  );
}

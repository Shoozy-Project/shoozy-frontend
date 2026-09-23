'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { accountApi } from '@/lib/api/account';
import { checkoutApi, listAllShippingMethods } from '@/lib/api/checkout';
import { commerceErrorMessage } from '@/lib/api/errors';
import { formatMinorMoney } from '@/lib/format-money';
import { commerceKeys, useCartMutation, useCurrentCart } from '@/lib/hooks/use-commerce';
import { selectIsAuthenticated, useAuthStore } from '@/stores/auth-store';
import type { CheckoutPreviewDto, GuestCheckoutInput, PlaceOrderResultDto } from '@/types/commerce';
import { useTranslations } from '@/lib/hooks/use-translations';

const emptyGuest: GuestCheckoutInput = {
  firstName: '', lastName: '', phone: '', email: '', addressLine1: '', addressLine2: '',
  city: '', state: '', area: '', postalCode: '', countryCode: 'TN', shippingMethodId: '',
};

function nullable(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function CheckoutPageClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const authenticated = useAuthStore(selectIsAuthenticated);
  const authReady = useAuthStore((state) => state.isInitialized);
  const cart = useCurrentCart();
  const addresses = useQuery({ queryKey: commerceKeys.addresses, queryFn: accountApi.addresses, enabled: authReady && authenticated });
  const shipping = useQuery({ queryKey: ['commerce', 'shipping-methods'], queryFn: listAllShippingMethods, staleTime: 5 * 60_000 });
  const [addressId, setAddressId] = useState('');
  const [shippingMethodId, setShippingMethodId] = useState('');
  const [guest, setGuest] = useState(emptyGuest);
  const [debouncedGuest] = useDebounce(guest, 600);
  const guestPreviewSettled = authenticated || JSON.stringify(guest) === JSON.stringify(debouncedGuest);
  const [notes, setNotes] = useState('');
  const coupon = useCartMutation('coupon');
  const removeCoupon = useCartMutation('removeCoupon');
  const { locale, t } = useTranslations();
  const intlLocale = locale === 'ar' ? 'ar-TN' : 'en-TN';
  const selectedAddressId = addressId || addresses.data?.find((address) => address.isDefault)?.id || addresses.data?.[0]?.id || '';
  const selectedShippingMethodId = shippingMethodId || shipping.data?.[0]?.id || '';
  const guestWithShipping = { ...guest, shippingMethodId: selectedShippingMethodId };
  const debouncedGuestWithShipping = { ...debouncedGuest, shippingMethodId: selectedShippingMethodId };

  const guestReady = Boolean(
    debouncedGuest.firstName.trim() && debouncedGuest.lastName.trim() && debouncedGuest.phone.trim()
    && debouncedGuest.addressLine1.trim() && debouncedGuest.city.trim() && debouncedGuest.state.trim()
    && selectedShippingMethodId,
  );

  const preview = useQuery({
    queryKey: ['commerce', 'checkout-preview', authenticated ? 'account' : 'guest', selectedAddressId, selectedShippingMethodId, debouncedGuest, cart.data?.discountCode],
    queryFn: () => authenticated
      ? checkoutApi.previewAuthenticated(selectedAddressId, selectedShippingMethodId)
      : checkoutApi.previewGuest({ ...debouncedGuestWithShipping, email: nullable(debouncedGuest.email), addressLine2: nullable(debouncedGuest.addressLine2), area: nullable(debouncedGuest.area), postalCode: nullable(debouncedGuest.postalCode) }),
    enabled: Boolean(cart.data?.checkoutEligible && selectedShippingMethodId && (authenticated ? selectedAddressId : guestReady)),
    staleTime: 10_000,
    retry: false,
  });

  const placeOrder = useMutation({
    mutationFn: async () => {
      const storageKey = `shoozy:checkout-idempotency:${cart.data?.id ?? 'guest'}`;
      let idempotencyKey = window.sessionStorage.getItem(storageKey);
      if (!idempotencyKey) {
        idempotencyKey = crypto.randomUUID();
        window.sessionStorage.setItem(storageKey, idempotencyKey);
      }
      const result = authenticated
        ? await checkoutApi.placeAuthenticated({ addressId: selectedAddressId, shippingMethodId: selectedShippingMethodId, notes: nullable(notes) }, idempotencyKey)
        : await checkoutApi.placeGuest({ ...guestWithShipping, email: nullable(guest.email), addressLine2: nullable(guest.addressLine2), area: nullable(guest.area), postalCode: nullable(guest.postalCode), notes: nullable(notes) }, idempotencyKey);
      return { result, storageKey };
    },
    onSuccess: async ({ result, storageKey }: { result: PlaceOrderResultDto; storageKey: string }) => {
      const orderNumber = result.order.orderNumber;
      window.sessionStorage.setItem(`shoozy:order-success:${orderNumber}`, JSON.stringify({ order: result.order, whatsappConfirmation: result.whatsappConfirmation }));
      if (result.guestAccessToken) window.sessionStorage.setItem(`shoozy:guest-order-token:${orderNumber}`, result.guestAccessToken);
      window.sessionStorage.removeItem(storageKey);
      await queryClient.invalidateQueries({ queryKey: commerceKeys.cart });
      router.replace(`/order-success/${encodeURIComponent(orderNumber)}`);
    },
    onError: (error) => toast.error(commerceErrorMessage(error, t('checkout.placeError'))),
  });

  const applyCoupon = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get('code') ?? '').trim();
    if (code) coupon.mutate({ code }, { onSuccess: () => toast.success(t('cart.couponApplied')), onError: (error) => toast.error(commerceErrorMessage(error, t('cart.couponApplyError'))) });
  };

  const updateGuest = (key: keyof GuestCheckoutInput, value: string) => setGuest((current) => ({ ...current, [key]: value }));

  if (!authReady || cart.isLoading || shipping.isLoading) return <p className="py-20 text-center text-muted-foreground">{t('checkout.preparing')}</p>;
  if (cart.isError || shipping.isError) return <CheckoutError retry={() => { cart.refetch(); shipping.refetch(); }} />;
  if (!cart.data?.items.length) return <div className="rounded-xl border border-dashed px-6 py-20 text-center"><h2 className="font-serif text-3xl">{t('checkout.empty')}</h2><Button asChild className="mt-6"><Link href="/products">{t('cart.shop')}</Link></Button></div>;
  if (!cart.data.checkoutEligible) return <div className="rounded-xl border border-destructive/30 p-8 text-center"><h2 className="font-serif text-3xl">{t('checkout.unavailable')}</h2><p className="mt-3 text-muted-foreground">{t('checkout.review')}</p><Button asChild className="mt-6"><Link href="/cart">{t('checkout.returnBag')}</Link></Button></div>;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-8">
        <section className="rounded-xl border p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4"><h2 className="font-serif text-2xl">{t('checkout.delivery')}</h2><span className="text-xs uppercase tracking-wider text-muted-foreground">{authenticated ? t('checkout.account') : t('checkout.guest')}</span></div>
          {authenticated ? (
            addresses.isLoading ? <p className="mt-5 text-sm text-muted-foreground">{t('checkout.loadingAddresses')}</p> : addresses.isError ? <p className="mt-5 rounded-lg bg-destructive/5 p-4 text-sm text-destructive">{t('checkout.addressesError')}</p> : addresses.data?.length ? (
              <div className="mt-5 space-y-3">{addresses.data.map((address) => <label key={address.id} className={`flex cursor-pointer gap-3 rounded-lg border p-4 ${selectedAddressId === address.id ? 'border-foreground ring-1 ring-foreground' : ''}`}><input type="radio" name="address" value={address.id} checked={selectedAddressId === address.id} onChange={() => setAddressId(address.id)} /><span className="text-sm"><strong>{address.label || address.recipientName}</strong><br /><span className="text-muted-foreground">{address.line1}{address.line2 ? `, ${address.line2}` : ''}, {address.area ? `${address.area}, ` : ''}{address.city}{address.state ? `, ${address.state}` : ''}</span></span></label>)}</div>
            ) : <div className="mt-5 rounded-lg bg-muted p-4 text-sm">{t('checkout.addressRequired')} <Link href="/account/addresses" className="font-medium underline">{t('checkout.manageAddresses')}</Link></div>
          ) : <GuestAddressFields value={guest} onChange={updateGuest} />}
        </section>

        <section className="rounded-xl border p-5 sm:p-6">
          <h2 className="font-serif text-2xl">{t('checkout.shipping')}</h2>
          {shipping.data?.length ? <div className="mt-5 space-y-3">{shipping.data.map((method) => <label key={method.id} className={`flex cursor-pointer items-start justify-between gap-4 rounded-lg border p-4 ${selectedShippingMethodId === method.id ? 'border-foreground ring-1 ring-foreground' : ''}`}><span className="flex gap-3"><input type="radio" name="shipping" checked={selectedShippingMethodId === method.id} onChange={() => setShippingMethodId(method.id)} /><span className="text-sm"><strong>{method.name}</strong>{method.estimatedMinDays !== null && <><br /><span className="text-muted-foreground">{t('checkout.businessDays', { min: method.estimatedMinDays, max: method.estimatedMaxDays ?? method.estimatedMinDays })}</span></>}</span></span><span className="text-sm font-medium">{t('checkout.from', { price: formatMinorMoney(method.basePriceMinor, method.currency, 3, intlLocale) })}</span></label>)}</div> : <p className="mt-5 rounded-lg bg-muted p-4 text-sm text-muted-foreground">{t('checkout.noShipping')}</p>}
        </section>

        <section className="rounded-xl border p-5 sm:p-6">
          <h2 className="font-serif text-2xl">{t('checkout.payment')}</h2>
          <div className="mt-5 rounded-lg bg-muted p-4"><p className="font-medium">{t('checkout.cod')}</p><p className="mt-1 text-sm text-muted-foreground">{t('checkout.codCopy')}</p></div>
          <div className="mt-5 space-y-2"><Label htmlFor="order-notes">{t('checkout.notes')}</Label><textarea id="order-notes" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={2000} rows={3} className="w-full rounded-lg border bg-background p-3 text-sm" /></div>
        </section>
      </div>

      <aside className="h-fit rounded-xl border p-5 lg:sticky lg:top-40">
        <h2 className="font-serif text-2xl">{t('checkout.summary')}</h2>
        <div className="mt-5 space-y-3 text-sm">{cart.data.items.map((item) => <div key={item.id} className="flex justify-between gap-4"><span className="min-w-0 truncate">{item.product.name} × {item.quantity}</span><span>{formatMinorMoney(item.lineTotalMinor, cart.data.currency, 3, intlLocale)}</span></div>)}</div>
        {cart.data.discountCode ? <div className="mt-5 flex items-center justify-between rounded-lg bg-muted p-3 text-sm"><span>{t('cart.couponLabel', { code: cart.data.discountCode })}</span><button type="button" className="underline" onClick={() => removeCoupon.mutate({}, { onError: (error) => toast.error(commerceErrorMessage(error, t('cart.couponRemoveError'))) })}>{t('common.remove')}</button></div> : <form onSubmit={applyCoupon} className="mt-5 flex gap-2"><Input name="code" maxLength={80} placeholder={t('cart.coupon')} aria-label={t('cart.coupon')} className="h-10" /><Button variant="outline" type="submit" className="h-10" disabled={coupon.isPending}>{t('common.apply')}</Button></form>}

        {preview.isLoading && <p className="mt-6 text-sm text-muted-foreground">{t('checkout.calculating')}</p>}
        {preview.isError && <div className="mt-6 rounded-lg bg-destructive/5 p-3 text-sm text-destructive">{commerceErrorMessage(preview.error, t('checkout.previewError'))}</div>}
        {preview.data && <PreviewTotals preview={preview.data} />}
        <Button className="mt-6 h-12 w-full" disabled={!preview.data || !guestPreviewSettled || preview.isFetching || placeOrder.isPending} onClick={() => placeOrder.mutate()}>{placeOrder.isPending ? t('checkout.placing') : t('checkout.place')}</Button>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{t('checkout.authority')}</p>
      </aside>
    </div>
  );
}

function GuestAddressFields({ value, onChange }: { value: GuestCheckoutInput; onChange: (key: keyof GuestCheckoutInput, value: string) => void }) {
  const { t } = useTranslations();
  const fields: Array<{ key: keyof GuestCheckoutInput; labelKey: string; required?: boolean; type?: string; max: number }> = [
    { key: 'firstName', labelKey: 'checkout.firstName', required: true, max: 100 }, { key: 'lastName', labelKey: 'checkout.lastName', required: true, max: 100 },
    { key: 'phone', labelKey: 'checkout.phone', required: true, type: 'tel', max: 12 }, { key: 'email', labelKey: 'checkout.email', type: 'email', max: 320 },
    { key: 'addressLine1', labelKey: 'checkout.address1', required: true, max: 255 }, { key: 'addressLine2', labelKey: 'checkout.address2', max: 255 },
    { key: 'city', labelKey: 'checkout.city', required: true, max: 120 }, { key: 'state', labelKey: 'checkout.state', required: true, max: 120 },
    { key: 'area', labelKey: 'checkout.area', max: 120 }, { key: 'postalCode', labelKey: 'checkout.postalCode', max: 32 },
  ];
  return <div className="mt-5 grid gap-4 sm:grid-cols-2">{fields.map((field) => <div key={field.key} className={`space-y-2 ${field.key.startsWith('addressLine') ? 'sm:col-span-2' : ''}`}><Label htmlFor={`guest-${field.key}`}>{t(field.labelKey)}</Label><Input id={`guest-${field.key}`} type={field.type} required={field.required} maxLength={field.max} value={String(value[field.key] ?? '')} onChange={(event) => onChange(field.key, event.target.value)} className="h-10" dir={field.type === 'tel' || field.type === 'email' ? 'ltr' : undefined} /></div>)}</div>;
}

function PreviewTotals({ preview }: { preview: CheckoutPreviewDto }) {
  const { locale, t } = useTranslations();
  const intlLocale = locale === 'ar' ? 'ar-TN' : 'en-TN';
  return (
    <dl className="mt-6 space-y-3 border-t pt-5 text-sm">
      <div className="flex justify-between"><dt>{t('checkout.items')}</dt><dd>{formatMinorMoney(preview.totals.itemsSubtotalMinor, preview.currency, 3, intlLocale)}</dd></div>
      {BigInt(preview.totals.totalDiscountMinor) > BigInt(0) && <div className="flex justify-between text-green-700 dark:text-green-400"><dt>{t('cart.discount')}</dt><dd>−{formatMinorMoney(preview.totals.totalDiscountMinor, preview.currency, 3, intlLocale)}</dd></div>}
      <div className="flex justify-between"><dt>{t('checkout.shippingTotal')}{preview.shippingZone ? ` · ${preview.shippingZone.name}` : ''}</dt><dd>{formatMinorMoney(preview.totals.shippingMinor, preview.currency, 3, intlLocale)}</dd></div>
      <div className="flex justify-between border-t pt-3 text-base font-semibold"><dt>{t('checkout.totalDelivery')}</dt><dd>{formatMinorMoney(preview.totals.grandTotalMinor, preview.currency, 3, intlLocale)}</dd></div>
    </dl>
  );
}

function CheckoutError({ retry }: { retry: () => void }) {
  const { t } = useTranslations();
  return <div className="rounded-xl border p-10 text-center"><h2 className="font-serif text-3xl">{t('checkout.prepareError')}</h2><p className="mt-3 text-muted-foreground">{t('checkout.prepareErrorCopy')}</p><Button variant="outline" className="mt-6" onClick={retry}>{t('common.retry')}</Button></div>;
}

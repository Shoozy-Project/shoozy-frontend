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
    onError: (error) => toast.error(commerceErrorMessage(error, 'Your order could not be placed. Your bag has not been lost.')),
  });

  const applyCoupon = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get('code') ?? '').trim();
    if (code) coupon.mutate({ code }, { onSuccess: () => toast.success('Coupon applied.'), onError: (error) => toast.error(commerceErrorMessage(error, 'Coupon could not be applied.')) });
  };

  const updateGuest = (key: keyof GuestCheckoutInput, value: string) => setGuest((current) => ({ ...current, [key]: value }));

  if (!authReady || cart.isLoading || shipping.isLoading) return <p className="py-20 text-center text-muted-foreground">Preparing checkout…</p>;
  if (cart.isError || shipping.isError) return <CheckoutError retry={() => { cart.refetch(); shipping.refetch(); }} />;
  if (!cart.data?.items.length) return <div className="rounded-xl border border-dashed px-6 py-20 text-center"><h2 className="font-serif text-3xl">Your bag is empty</h2><Button asChild className="mt-6"><Link href="/products">Shop products</Link></Button></div>;
  if (!cart.data.checkoutEligible) return <div className="rounded-xl border border-destructive/30 p-8 text-center"><h2 className="font-serif text-3xl">Checkout is unavailable</h2><p className="mt-3 text-muted-foreground">Review unavailable or out-of-stock items in your bag.</p><Button asChild className="mt-6"><Link href="/cart">Return to bag</Link></Button></div>;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-8">
        <section className="rounded-xl border p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4"><h2 className="font-serif text-2xl">Delivery details</h2><span className="text-xs uppercase tracking-wider text-muted-foreground">{authenticated ? 'Account checkout' : 'Guest checkout'}</span></div>
          {authenticated ? (
            addresses.isLoading ? <p className="mt-5 text-sm text-muted-foreground">Loading addresses…</p> : addresses.isError ? <p className="mt-5 rounded-lg bg-destructive/5 p-4 text-sm text-destructive">Your saved addresses could not be loaded.</p> : addresses.data?.length ? (
              <div className="mt-5 space-y-3">{addresses.data.map((address) => <label key={address.id} className={`flex cursor-pointer gap-3 rounded-lg border p-4 ${selectedAddressId === address.id ? 'border-foreground ring-1 ring-foreground' : ''}`}><input type="radio" name="address" value={address.id} checked={selectedAddressId === address.id} onChange={() => setAddressId(address.id)} /><span className="text-sm"><strong>{address.label || address.recipientName}</strong><br /><span className="text-muted-foreground">{address.line1}{address.line2 ? `, ${address.line2}` : ''}, {address.area ? `${address.area}, ` : ''}{address.city}{address.state ? `, ${address.state}` : ''}</span></span></label>)}</div>
            ) : <div className="mt-5 rounded-lg bg-muted p-4 text-sm">Add a delivery address before continuing. <Link href="/account/addresses" className="font-medium underline">Manage addresses</Link></div>
          ) : <GuestAddressFields value={guest} onChange={updateGuest} />}
        </section>

        <section className="rounded-xl border p-5 sm:p-6">
          <h2 className="font-serif text-2xl">Shipping method</h2>
          {shipping.data?.length ? <div className="mt-5 space-y-3">{shipping.data.map((method) => <label key={method.id} className={`flex cursor-pointer items-start justify-between gap-4 rounded-lg border p-4 ${selectedShippingMethodId === method.id ? 'border-foreground ring-1 ring-foreground' : ''}`}><span className="flex gap-3"><input type="radio" name="shipping" checked={selectedShippingMethodId === method.id} onChange={() => setShippingMethodId(method.id)} /><span className="text-sm"><strong>{method.name}</strong>{method.estimatedMinDays !== null && <><br /><span className="text-muted-foreground">{method.estimatedMinDays}–{method.estimatedMaxDays ?? method.estimatedMinDays} business days</span></>}</span></span><span className="text-sm font-medium">From {formatMinorMoney(method.basePriceMinor, method.currency, 3)}</span></label>)}</div> : <p className="mt-5 rounded-lg bg-muted p-4 text-sm text-muted-foreground">No shipping method is currently available.</p>}
        </section>

        <section className="rounded-xl border p-5 sm:p-6">
          <h2 className="font-serif text-2xl">Payment</h2>
          <div className="mt-5 rounded-lg bg-muted p-4"><p className="font-medium">Cash on Delivery</p><p className="mt-1 text-sm text-muted-foreground">Pay the final order total when your order arrives. No card or online payment is collected.</p></div>
          <div className="mt-5 space-y-2"><Label htmlFor="order-notes">Order notes (optional)</Label><textarea id="order-notes" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={2000} rows={3} className="w-full rounded-lg border bg-background p-3 text-sm" /></div>
        </section>
      </div>

      <aside className="h-fit rounded-xl border p-5 lg:sticky lg:top-40">
        <h2 className="font-serif text-2xl">Order summary</h2>
        <div className="mt-5 space-y-3 text-sm">{cart.data.items.map((item) => <div key={item.id} className="flex justify-between gap-4"><span className="min-w-0 truncate">{item.product.name} × {item.quantity}</span><span>{formatMinorMoney(item.lineTotalMinor, cart.data.currency, 3)}</span></div>)}</div>
        {cart.data.discountCode ? <div className="mt-5 flex items-center justify-between rounded-lg bg-muted p-3 text-sm"><span>Coupon: <strong>{cart.data.discountCode}</strong></span><button type="button" className="underline" onClick={() => removeCoupon.mutate({}, { onError: (error) => toast.error(commerceErrorMessage(error, 'Coupon could not be removed.')) })}>Remove</button></div> : <form onSubmit={applyCoupon} className="mt-5 flex gap-2"><Input name="code" maxLength={80} placeholder="Coupon code" aria-label="Coupon code" className="h-10" /><Button variant="outline" type="submit" className="h-10" disabled={coupon.isPending}>Apply</Button></form>}

        {preview.isLoading && <p className="mt-6 text-sm text-muted-foreground">Calculating live totals…</p>}
        {preview.isError && <div className="mt-6 rounded-lg bg-destructive/5 p-3 text-sm text-destructive">{commerceErrorMessage(preview.error, 'A checkout preview is not available for these details.')}</div>}
        {preview.data && <PreviewTotals preview={preview.data} />}
        <Button className="mt-6 h-12 w-full" disabled={!preview.data || !guestPreviewSettled || preview.isFetching || placeOrder.isPending} onClick={() => placeOrder.mutate()}>{placeOrder.isPending ? 'Placing order…' : 'Place Cash on Delivery order'}</Button>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">The backend rechecks stock, prices, discounts, and shipping when you place the order.</p>
      </aside>
    </div>
  );
}

function GuestAddressFields({ value, onChange }: { value: GuestCheckoutInput; onChange: (key: keyof GuestCheckoutInput, value: string) => void }) {
  const fields: Array<{ key: keyof GuestCheckoutInput; label: string; required?: boolean; type?: string; max: number }> = [
    { key: 'firstName', label: 'First name', required: true, max: 100 }, { key: 'lastName', label: 'Last name', required: true, max: 100 },
    { key: 'phone', label: 'Tunisian phone', required: true, type: 'tel', max: 12 }, { key: 'email', label: 'Email (optional)', type: 'email', max: 320 },
    { key: 'addressLine1', label: 'Address line 1', required: true, max: 255 }, { key: 'addressLine2', label: 'Address line 2 (optional)', max: 255 },
    { key: 'city', label: 'City', required: true, max: 120 }, { key: 'state', label: 'State / governorate', required: true, max: 120 },
    { key: 'area', label: 'Area (optional)', max: 120 }, { key: 'postalCode', label: 'Postal code (optional)', max: 32 },
  ];
  return <div className="mt-5 grid gap-4 sm:grid-cols-2">{fields.map((field) => <div key={field.key} className={`space-y-2 ${field.key.startsWith('addressLine') ? 'sm:col-span-2' : ''}`}><Label htmlFor={`guest-${field.key}`}>{field.label}</Label><Input id={`guest-${field.key}`} type={field.type} required={field.required} maxLength={field.max} value={String(value[field.key] ?? '')} onChange={(event) => onChange(field.key, event.target.value)} className="h-10" /></div>)}</div>;
}

function PreviewTotals({ preview }: { preview: CheckoutPreviewDto }) {
  return (
    <dl className="mt-6 space-y-3 border-t pt-5 text-sm">
      <div className="flex justify-between"><dt>Items</dt><dd>{formatMinorMoney(preview.totals.itemsSubtotalMinor, preview.currency, 3)}</dd></div>
      {BigInt(preview.totals.totalDiscountMinor) > BigInt(0) && <div className="flex justify-between text-green-700 dark:text-green-400"><dt>Discount</dt><dd>−{formatMinorMoney(preview.totals.totalDiscountMinor, preview.currency, 3)}</dd></div>}
      <div className="flex justify-between"><dt>Shipping{preview.shippingZone ? ` · ${preview.shippingZone.name}` : ''}</dt><dd>{formatMinorMoney(preview.totals.shippingMinor, preview.currency, 3)}</dd></div>
      <div className="flex justify-between border-t pt-3 text-base font-semibold"><dt>Total on delivery</dt><dd>{formatMinorMoney(preview.totals.grandTotalMinor, preview.currency, 3)}</dd></div>
    </dl>
  );
}

function CheckoutError({ retry }: { retry: () => void }) {
  return <div className="rounded-xl border p-10 text-center"><h2 className="font-serif text-3xl">Checkout could not be prepared</h2><p className="mt-3 text-muted-foreground">Please try loading your bag and shipping methods again.</p><Button variant="outline" className="mt-6" onClick={retry}>Try again</Button></div>;
}

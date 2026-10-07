'use client';

import { FormEvent, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AddressDialog } from '@/components/account/AddressesManager';
import { accountApi } from '@/lib/api/account';
import { checkoutApi, listAllShippingMethods } from '@/lib/api/checkout';
import { commerceErrorMessage } from '@/lib/api/errors';
import { formatMinorMoney } from '@/lib/format-money';
import { commerceKeys, useCartMutation, useCurrentCart } from '@/lib/hooks/use-commerce';
import { selectIsAuthenticated, useAuthStore } from '@/stores/auth-store';
import type { AddressDto, CheckoutPreviewDto, GuestCheckoutInput, PlaceOrderResultDto } from '@/types/commerce';
import { useTranslations } from '@/lib/hooks/use-translations';
import { TunisianPhoneInput } from '@/components/forms/TunisianPhoneInput';
import { AddressLocationPicker } from '@/components/commerce/AddressLocationPicker';
import { isValidTunisianLocalPhone, toTunisianCanonicalPhone } from '@/lib/tunisian-phone';
import { hasValidCoordinatePair, isTunisianGovernorate, TUNISIA_COUNTRY_CODE, TUNISIA_GOVERNORATES } from '@/lib/tunisia-address';

const emptyGuest: GuestCheckoutInput = {
  firstName: '', lastName: '', phone: '', email: '', addressLine1: '', addressLine2: '',
  city: '', state: '', area: '', postalCode: '', countryCode: 'TN', shippingMethodId: '',
};

function nullable(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function guestPayload(value: GuestCheckoutInput, shippingMethodId: string): GuestCheckoutInput | null {
  const phone = toTunisianCanonicalPhone(value.phone);
  if (!phone || !hasValidCoordinatePair(value.latitude, value.longitude)) return null;
  return {
    ...value,
    phone,
    email: nullable(value.email),
    addressLine2: nullable(value.addressLine2),
    area: nullable(value.area),
    postalCode: nullable(value.postalCode),
    countryCode: TUNISIA_COUNTRY_CODE,
    shippingMethodId,
  };
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
  const [shippingSelectionRequired, setShippingSelectionRequired] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressDto | null>(null);
  const [guest, setGuest] = useState(emptyGuest);
  const [guestCoordinates, setGuestCoordinates] = useState<{ latitude?: string; longitude?: string }>({});
  const guestAddressRef = useRef<HTMLDivElement>(null);
  const [debouncedGuest] = useDebounce(guest, 600);
  const guestPreviewSettled = authenticated || JSON.stringify(guest) === JSON.stringify(debouncedGuest);
  const [notes, setNotes] = useState('');
  const coupon = useCartMutation('coupon');
  const removeCoupon = useCartMutation('removeCoupon');
  const { locale, t } = useTranslations();
  const intlLocale = locale === 'ar' ? 'ar-TN' : 'en-TN';
  const selectedAddressId = addressId || addresses.data?.find((address) => address.isDefault)?.id || addresses.data?.[0]?.id || '';
  const selectedAddress = addresses.data?.find((address) => address.id === selectedAddressId);
  const explicitShippingMethodAvailable = Boolean(shippingMethodId && shipping.data?.some((method) => method.id === shippingMethodId));
  const selectedShippingMethodId = shippingMethodId
    ? (explicitShippingMethodAvailable ? shippingMethodId : '')
    : (shippingSelectionRequired ? '' : shipping.data?.[0]?.id ?? '');
  const preparedGuest = guestPayload({ ...guest, ...guestCoordinates }, selectedShippingMethodId);
  const preparedDebouncedGuest = guestPayload(debouncedGuest, selectedShippingMethodId);

  const authenticatedAddressReady = Boolean(
    selectedAddress
    && selectedAddress.countryCode.toUpperCase() === TUNISIA_COUNTRY_CODE
    && selectedAddress.recipientName.trim()
    && toTunisianCanonicalPhone(selectedAddress.phone)
    && isTunisianGovernorate(selectedAddress.state)
    && selectedAddress.city.trim()
    && selectedAddress.line1.trim(),
  );

  const guestReady = Boolean(
    debouncedGuest.firstName.trim() && debouncedGuest.lastName.trim() && isValidTunisianLocalPhone(debouncedGuest.phone)
    && debouncedGuest.addressLine1.trim() && debouncedGuest.city.trim() && isTunisianGovernorate(debouncedGuest.state)
    && selectedShippingMethodId && preparedDebouncedGuest,
  );

  const preview = useQuery({
    queryKey: ['commerce', 'checkout-preview', authenticated ? 'account' : 'guest', selectedAddressId, selectedAddress?.updatedAt, selectedShippingMethodId, debouncedGuest, cart.data?.discountCode],
    queryFn: () => authenticated
      ? checkoutApi.previewAuthenticated(selectedAddressId, selectedShippingMethodId)
      : checkoutApi.previewGuest(preparedDebouncedGuest!),
    enabled: Boolean(cart.data?.checkoutEligible && selectedShippingMethodId && (authenticated ? authenticatedAddressReady : guestReady && guestPreviewSettled)),
    staleTime: 10_000,
    retry: false,
  });

  const resetShippingForAddressChange = () => {
    setShippingMethodId('');
    setShippingSelectionRequired(true);
    void Promise.all([
      queryClient.invalidateQueries({ queryKey: ['commerce', 'checkout-preview'] }),
      queryClient.invalidateQueries({ queryKey: ['commerce', 'shipping-methods'] }),
    ]);
  };

  const placeOrder = useMutation({
    mutationFn: async () => {
      if (!selectedShippingMethodId) throw new Error('Invalid shipping method');
      if (authenticated && !authenticatedAddressReady) throw new Error('Invalid saved address');
      if (!authenticated && (!guestReady || !preparedGuest)) throw new Error('Invalid guest checkout details');
      const storageKey = `shoozy:checkout-idempotency:${cart.data?.id ?? 'guest'}`;
      let idempotencyKey = window.sessionStorage.getItem(storageKey);
      if (!idempotencyKey) {
        idempotencyKey = crypto.randomUUID();
        window.sessionStorage.setItem(storageKey, idempotencyKey);
      }
      const result = authenticated
        ? await checkoutApi.placeAuthenticated({ addressId: selectedAddressId, shippingMethodId: selectedShippingMethodId, notes: nullable(notes) }, idempotencyKey)
        : await checkoutApi.placeGuest({ ...preparedGuest!, notes: nullable(notes) }, idempotencyKey);
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

  const updateGuest = (key: keyof GuestCheckoutInput, value: string) => {
    const changesShippingZone = key === 'state' || key === 'city' || key === 'area';
    if (changesShippingZone && value !== guest[key]) {
      setShippingMethodId('');
      setShippingSelectionRequired(true);
    }
    setGuest((current) => ({ ...current, [key]: value }));
  };

  const selectAddress = (nextAddressId: string) => {
    if (nextAddressId !== selectedAddressId) resetShippingForAddressChange();
    setAddressId(nextAddressId);
  };

  const handleAddressSaved = (savedAddress: AddressDto) => {
    queryClient.setQueryData<AddressDto[]>(commerceKeys.addresses, (current) => current?.map((address) => address.id === savedAddress.id ? savedAddress : address));
    setAddressId(savedAddress.id);
    setEditingAddress(null);
    resetShippingForAddressChange();
    void queryClient.invalidateQueries({ queryKey: commerceKeys.addresses });
  };

  const editGuestAddress = () => {
    guestAddressRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    guestAddressRef.current?.querySelector<HTMLElement>('input, select')?.focus({ preventScroll: true });
  };

  const submitOrder = () => {
    if (!selectedShippingMethodId) {
      toast.error(t('checkout.shippingRequired'));
      return;
    }
    if (authenticated ? !authenticatedAddressReady : !guestReady || !preparedGuest) {
      toast.error(t('checkout.addressInvalid'));
      return;
    }
    placeOrder.mutate();
  };

  if (!authReady || cart.isLoading || shipping.isLoading) return <p className="py-20 text-center text-muted-foreground">{t('checkout.preparing')}</p>;
  if (cart.isError || shipping.isError) return <CheckoutError retry={() => { cart.refetch(); shipping.refetch(); }} />;
  if (!cart.data?.items.length) return <div className="rounded-xl border border-dashed px-6 py-20 text-center"><h2 className="font-serif text-3xl">{t('checkout.empty')}</h2><Button asChild className="mt-6"><Link href="/products">{t('cart.shop')}</Link></Button></div>;
  if (!cart.data.checkoutEligible) return <div className="rounded-xl border border-destructive/30 p-8 text-center"><h2 className="font-serif text-3xl">{t('checkout.unavailable')}</h2><p className="mt-3 text-muted-foreground">{t('checkout.review')}</p><Button asChild className="mt-6"><Link href="/cart">{t('checkout.returnBag')}</Link></Button></div>;

  return (
    <>
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-8">
        <section className="rounded-xl border p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-serif text-2xl">{t('checkout.delivery')}</h2><div className="flex items-center gap-2">{authenticated ? selectedAddress && <Button type="button" variant="ghost" size="sm" onClick={() => setEditingAddress(selectedAddress)}>{t('common.edit')}</Button> : <Button type="button" variant="ghost" size="sm" onClick={editGuestAddress}>{t('common.edit')}</Button>}<span className="text-xs uppercase tracking-wider text-muted-foreground">{authenticated ? t('checkout.account') : t('checkout.guest')}</span></div></div>
          {authenticated ? (
            addresses.isLoading ? <p className="mt-5 text-sm text-muted-foreground">{t('checkout.loadingAddresses')}</p> : addresses.isError ? <p className="mt-5 rounded-lg bg-destructive/5 p-4 text-sm text-destructive">{t('checkout.addressesError')}</p> : addresses.data?.length ? (
              <div className="mt-5 space-y-3">{addresses.data.map((address) => <label key={address.id} className={`flex cursor-pointer gap-3 rounded-lg border p-4 ${selectedAddressId === address.id ? 'border-foreground ring-1 ring-foreground' : ''}`}><input type="radio" name="address" value={address.id} checked={selectedAddressId === address.id} onChange={() => selectAddress(address.id)} /><span className="min-w-0 text-sm"><strong>{address.recipientName}</strong>{address.label && address.label !== address.recipientName ? <span className="text-muted-foreground"> · {address.label}</span> : null}<span className="mt-1 block text-muted-foreground">{[address.line1, address.line2].filter(Boolean).join(', ')}<br />{[address.city, address.state].filter(Boolean).join(', ')}{address.area || address.postalCode ? <><br />{[address.area, address.postalCode].filter(Boolean).join(', ')}</> : null}<br /><bdi dir="ltr">{address.phone}</bdi></span></span></label>)}{selectedAddress && !authenticatedAddressReady ? <p role="alert" className="text-sm text-destructive">{!isTunisianGovernorate(selectedAddress.state) ? t('validation.governorateRequired') : t('checkout.addressInvalid')}</p> : null}</div>
            ) : <div className="mt-5 rounded-lg bg-muted p-4 text-sm">{t('checkout.addressRequired')} <Link href="/account/addresses" className="font-medium underline">{t('checkout.manageAddresses')}</Link></div>
          ) : <div ref={guestAddressRef}><GuestAddressFields value={guest} coordinates={guestCoordinates} onChange={updateGuest} onCoordinatesChange={setGuestCoordinates} /></div>}
        </section>

        <section className="rounded-xl border p-5 sm:p-6">
          <h2 className="font-serif text-2xl">{t('checkout.shipping')}</h2>
          {shipping.data?.length ? <div className="mt-5 space-y-3">{shipping.data.map((method) => <label key={method.id} className={`flex cursor-pointer items-start justify-between gap-4 rounded-lg border p-4 ${selectedShippingMethodId === method.id ? 'border-foreground ring-1 ring-foreground' : ''}`}><span className="flex gap-3"><input type="radio" name="shipping" checked={selectedShippingMethodId === method.id} onChange={() => { setShippingMethodId(method.id); setShippingSelectionRequired(false); }} /><span className="text-sm"><strong>{method.name}</strong>{method.estimatedMinDays !== null && <><br /><span className="text-muted-foreground">{t('checkout.businessDays', { min: method.estimatedMinDays, max: method.estimatedMaxDays ?? method.estimatedMinDays })}</span></>}</span></span><span className="text-sm font-medium">{t('checkout.from', { price: formatMinorMoney(method.basePriceMinor, method.currency, 3, intlLocale) })}</span></label>)}{!selectedShippingMethodId ? <p role="alert" className="text-sm text-destructive">{t('checkout.shippingRequired')}</p> : null}</div> : <p className="mt-5 rounded-lg bg-muted p-4 text-sm text-muted-foreground">{t('checkout.noShipping')}</p>}
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
        <Button className="mt-6 h-12 w-full" disabled={!preview.data || !guestPreviewSettled || preview.isFetching || placeOrder.isPending} onClick={submitOrder}>{placeOrder.isPending ? t('checkout.placing') : t('checkout.place')}</Button>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{t('checkout.authority')}</p>
      </aside>
    </div>
    {editingAddress ? <AddressDialog key={editingAddress.id} address={editingAddress} onClose={() => setEditingAddress(null)} onSaved={handleAddressSaved} /> : null}
    </>
  );
}

function GuestAddressFields({ value, coordinates, onChange, onCoordinatesChange }: {
  value: GuestCheckoutInput;
  coordinates: { latitude?: string; longitude?: string };
  onChange: (key: keyof GuestCheckoutInput, value: string) => void;
  onCoordinatesChange: (coordinates: { latitude: string; longitude: string }) => void;
}) {
  const { t } = useTranslations();
  const [governorateTouched, setGovernorateTouched] = useState(false);
  const fields: Array<{ key: keyof GuestCheckoutInput; labelKey: string; required?: boolean; type?: string; max: number }> = [
    { key: 'firstName', labelKey: 'checkout.firstName', required: true, max: 100 }, { key: 'lastName', labelKey: 'checkout.lastName', required: true, max: 100 },
    { key: 'email', labelKey: 'checkout.email', type: 'email', max: 320 },
    { key: 'addressLine1', labelKey: 'checkout.address1', required: true, max: 255 }, { key: 'addressLine2', labelKey: 'checkout.address2', max: 255 },
    { key: 'city', labelKey: 'checkout.city', required: true, max: 120 },
    { key: 'area', labelKey: 'checkout.area', max: 120 }, { key: 'postalCode', labelKey: 'checkout.postalCode', max: 32 },
  ];
  const phoneError = value.phone && !isValidTunisianLocalPhone(value.phone) ? t('validation.tunisianPhone') : undefined;
  const governorateError = !isTunisianGovernorate(value.state) && (governorateTouched || Boolean(value.firstName || value.lastName || value.phone || value.addressLine1 || value.city))
    ? t('validation.governorateRequired')
    : undefined;
  return <div className="mt-5 grid gap-4 sm:grid-cols-2">
    {fields.slice(0, 2).map((field) => <GuestField key={field.key} field={field} value={value} onChange={onChange} />)}
    <TunisianPhoneInput id="guest-phone" label={t('checkout.phone')} value={value.phone} required helperText={t('phone.helper')} error={phoneError} onChange={(phone) => onChange('phone', phone)} />
    <GuestField field={fields[2]} value={value} onChange={onChange} />
    <div className="space-y-2"><Label htmlFor="guest-state">{t('checkout.state')}</Label><select id="guest-state" required value={value.state} aria-invalid={Boolean(governorateError)} aria-describedby={governorateError ? 'guest-state-error' : undefined} onBlur={() => setGovernorateTouched(true)} onChange={(event) => { setGovernorateTouched(true); onChange('state', event.target.value); }} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"><option value="">{t('address.selectGovernorate')}</option>{TUNISIA_GOVERNORATES.map((governorate) => <option key={governorate} value={governorate}>{governorate}</option>)}</select>{governorateError ? <p id="guest-state-error" role="alert" className="text-xs text-destructive">{governorateError}</p> : null}</div>
    {fields.slice(5).map((field) => <GuestField key={field.key} field={field} value={value} onChange={onChange} />)}
    {fields.slice(3, 5).map((field) => <GuestField key={field.key} field={field} value={value} onChange={onChange} />)}
    <div className="space-y-2"><Label>{t('address.country')}</Label><div className="flex h-10 items-center rounded-lg border bg-muted/40 px-3 text-sm">{t('address.tunisia')}</div></div>
    <AddressLocationPicker latitude={coordinates.latitude} longitude={coordinates.longitude} onChange={onCoordinatesChange} />
  </div>;
}

function GuestField({ field, value, onChange }: {
  field: { key: keyof GuestCheckoutInput; labelKey: string; required?: boolean; type?: string; max: number };
  value: GuestCheckoutInput;
  onChange: (key: keyof GuestCheckoutInput, value: string) => void;
}) {
  const { t } = useTranslations();
  return <div className={`space-y-2 ${field.key.startsWith('addressLine') ? 'sm:col-span-2' : ''}`}><Label htmlFor={`guest-${field.key}`}>{t(field.labelKey)}</Label><Input id={`guest-${field.key}`} type={field.type} required={field.required} maxLength={field.max} value={String(value[field.key] ?? '')} onChange={(event) => onChange(field.key, event.target.value)} className="h-10" dir={field.type === 'email' || field.key === 'postalCode' ? 'ltr' : undefined} /></div>;
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

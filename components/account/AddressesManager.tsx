'use client';

import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { accountApi } from '@/lib/api/account';
import { commerceErrorMessage } from '@/lib/api/errors';
import { commerceKeys } from '@/lib/hooks/use-commerce';
import type { AddressDto, AddressInput } from '@/types/commerce';
import { useTranslations } from '@/lib/hooks/use-translations';
import { TunisianPhoneInput } from '@/components/forms/TunisianPhoneInput';
import { AddressLocationPicker } from '@/components/commerce/AddressLocationPicker';
import { extractTunisianLocalPhone, isValidTunisianLocalPhone, toTunisianCanonicalPhone } from '@/lib/tunisian-phone';
import { hasValidCoordinatePair, isTunisianGovernorate, TUNISIA_COUNTRY_CODE, TUNISIA_GOVERNORATES } from '@/lib/tunisia-address';

const emptyAddress: AddressInput = { label: '', recipientName: '', phone: '', countryCode: 'TN', state: null, city: '', area: null, postalCode: null, line1: '', line2: null, latitude: null, longitude: null, isDefault: false };

export function AddressesManager() {
  const client = useQueryClient();
  const addresses = useQuery({ queryKey: commerceKeys.addresses, queryFn: accountApi.addresses });
  const [editing, setEditing] = useState<AddressDto | 'new' | null>(null);
  const { t } = useTranslations();
  const invalidate = () => client.invalidateQueries({ queryKey: commerceKeys.addresses });
  const remove = useMutation({ mutationFn: accountApi.deleteAddress, onSuccess: () => { invalidate(); toast.success(t('address.deleted')); }, onError: (error) => toast.error(commerceErrorMessage(error, t('address.deleteError'))) });
  const setDefault = useMutation({ mutationFn: accountApi.setDefaultAddress, onSuccess: () => { invalidate(); toast.success(t('address.defaultUpdated')); }, onError: (error) => toast.error(commerceErrorMessage(error, t('address.defaultError'))) });

  if (addresses.isLoading) return <p className="py-16 text-center text-muted-foreground">{t('address.loading')}</p>;
  if (addresses.isError) return <div className="rounded-xl border p-8 text-center"><p>{t('address.loadError')}</p><Button variant="outline" className="mt-4" onClick={() => addresses.refetch()}>{t('common.retry')}</Button></div>;
  return (
    <div>
      <div className="flex items-end justify-between gap-4"><div><h2 className="font-serif text-3xl">{t('account.addresses')}</h2><p className="mt-2 text-sm text-muted-foreground">{t('address.copy')}</p></div><Button onClick={() => setEditing('new')}><Plus /> {t('address.add')}</Button></div>
      {addresses.data?.length ? <div className="mt-8 grid gap-4 sm:grid-cols-2">{addresses.data.map((address) => <article key={address.id} className="rounded-xl border p-5"><div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-medium">{address.label || address.recipientName}</h3>{address.isDefault && <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700 dark:bg-green-950/40 dark:text-green-400">{t('address.default')}</span>}</div><p className="mt-3 text-sm text-muted-foreground">{address.recipientName}<br />{address.line1}{address.line2 ? `, ${address.line2}` : ''}<br />{[address.area, address.city, address.state, address.postalCode].filter(Boolean).join(', ')}<br />{address.countryCode} · <bdi>{address.phone}</bdi></p></div></div><div className="mt-5 flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => setEditing(address)}><Pencil /> {t('common.edit')}</Button>{!address.isDefault && <Button variant="outline" size="sm" onClick={() => setDefault.mutate(address.id)} disabled={setDefault.isPending}><Check /> {t('address.makeDefault')}</Button>}<Button variant="destructive" size="sm" onClick={() => { if (window.confirm(t('address.deleteConfirm'))) remove.mutate(address.id); }} disabled={remove.isPending}><Trash2 /> {t('common.delete')}</Button></div></article>)}</div> : <div className="mt-8 rounded-xl border border-dashed px-6 py-16 text-center"><p className="text-muted-foreground">{t('address.empty')}</p></div>}
      <AddressDialog key={editing === 'new' ? 'new' : editing?.id ?? 'closed'} address={editing} onClose={() => setEditing(null)} onSaved={() => { invalidate(); setEditing(null); }} />
    </div>
  );
}

export function AddressDialog({ address, onClose, onSaved }: { address: AddressDto | 'new' | null; onClose: () => void; onSaved: (savedAddress: AddressDto) => void }) {
  const { t } = useTranslations();
  const initial: AddressInput = address && address !== 'new' ? {
    label: address.label ?? '', recipientName: address.recipientName, phone: extractTunisianLocalPhone(address.phone), countryCode: TUNISIA_COUNTRY_CODE,
    state: address.state ?? '', city: address.city, area: address.area ?? '', postalCode: address.postalCode ?? '', line1: address.line1,
    line2: address.line2 ?? '', latitude: address.latitude, longitude: address.longitude, isDefault: address.isDefault,
  } : emptyAddress;
  const [form, setForm] = useState<AddressInput>(initial);
  const [phoneError, setPhoneError] = useState('');
  const [stateError, setStateError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [saveError, setSaveError] = useState('');
  const save = useMutation({
    mutationFn: (input: AddressInput) => address && address !== 'new' ? accountApi.updateAddress(address.id, input) : accountApi.createAddress(input),
    onSuccess: (savedAddress) => {
      toast.success(address === 'new' ? t('address.added') : t('address.updated'));
      onSaved(savedAddress);
    },
    onError: (error) => {
      const message = commerceErrorMessage(error, t('address.saveError'));
      setSaveError(message);
      toast.error(message);
    },
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSaveError('');
    if (!isTunisianGovernorate(form.state)) {
      setStateError(t('validation.governorateRequired'));
      return;
    }
    if (!isValidTunisianLocalPhone(form.phone)) {
      setPhoneError(t('validation.tunisianPhone'));
      return;
    }
    if (!hasValidCoordinatePair(form.latitude, form.longitude)) {
      setLocationError(t('map.invalidCoordinates'));
      return;
    }
    setPhoneError('');
    setStateError('');
    setLocationError('');
    save.mutate({
      ...form,
      phone: toTunisianCanonicalPhone(form.phone)!,
      label: clean(form.label), state: clean(form.state), area: clean(form.area), postalCode: clean(form.postalCode), line2: clean(form.line2),
      latitude: clean(form.latitude), longitude: clean(form.longitude),
      countryCode: TUNISIA_COUNTRY_CODE,
    });
  };
  const update = (key: keyof AddressInput, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const fields: Array<{ key: keyof AddressInput; labelKey: string; max: number; required?: boolean }> = [
    { key: 'label', labelKey: 'address.label', max: 100 }, { key: 'recipientName', labelKey: 'address.recipient', max: 200, required: true },
    { key: 'city', labelKey: 'address.city', max: 120, required: true }, { key: 'area', labelKey: 'address.area', max: 120 },
    { key: 'postalCode', labelKey: 'address.postal', max: 32 }, { key: 'line1', labelKey: 'address.line1', max: 255, required: true },
    { key: 'line2', labelKey: 'address.line2', max: 255 },
  ];
  return <Dialog open={Boolean(address)} onOpenChange={(open) => !open && onClose()}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{address === 'new' ? t('address.add') : t('address.edit')}</DialogTitle><DialogDescription>{t('address.dialogCopy')}</DialogDescription></DialogHeader><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
    <TunisianPhoneInput id="address-phone" label={t('address.phone')} value={form.phone} required helperText={t('phone.helper')} error={phoneError} onChange={(value) => { update('phone', value); setPhoneError(''); }} />
    <div className="space-y-2"><Label>{t('address.country')}</Label><div className="flex h-10 items-center rounded-lg border bg-muted/40 px-3 text-sm">{t('address.tunisia')}</div></div>
    <div className="space-y-2"><Label htmlFor="address-state">{t('address.state')}</Label><select id="address-state" required value={form.state ?? ''} aria-invalid={Boolean(stateError)} aria-describedby={stateError ? 'address-state-error' : undefined} onInvalid={(event) => { event.preventDefault(); setStateError(t('validation.governorateRequired')); }} onChange={(event) => { update('state', event.target.value); setStateError(''); }} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"><option value="">{t('address.selectGovernorate')}</option>{TUNISIA_GOVERNORATES.map((governorate) => <option key={governorate} value={governorate}>{governorate}</option>)}</select>{stateError ? <p id="address-state-error" role="alert" className="text-xs text-destructive">{stateError}</p> : null}</div>
    {fields.map((field) => <div key={field.key} className={`space-y-2 ${field.key === 'line1' || field.key === 'line2' ? 'sm:col-span-2' : ''}`}><Label htmlFor={`address-${field.key}`}>{t(field.labelKey)}</Label><Input id={`address-${field.key}`} value={String(form[field.key] ?? '')} maxLength={field.max} required={field.required} onChange={(event) => update(field.key, event.target.value)} className="h-10" dir={field.key === 'postalCode' ? 'ltr' : undefined} /></div>)}
    <AddressLocationPicker latitude={form.latitude} longitude={form.longitude} onChange={(coordinates) => { setForm((current) => ({ ...current, ...coordinates })); setLocationError(''); }} />
    {locationError ? <p role="alert" className="text-xs text-destructive sm:col-span-2">{locationError}</p> : null}
    {saveError ? <p role="alert" className="text-sm text-destructive sm:col-span-2">{saveError}</p> : null}
    <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={form.isDefault} onChange={(event) => update('isDefault', event.target.checked)} />{t('address.setDefault')}</label><div className="flex justify-end gap-3 sm:col-span-2"><Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button><Button type="submit" disabled={save.isPending}>{save.isPending ? t('account.saving') : t('address.save')}</Button></div></form></DialogContent></Dialog>;
}

function clean(value: string | null | undefined) { const trimmed = value?.trim(); return trimmed ? trimmed : null; }

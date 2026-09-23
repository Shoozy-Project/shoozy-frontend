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

const emptyAddress: AddressInput = { label: '', recipientName: '', phone: '', countryCode: 'TN', state: null, city: '', area: null, postalCode: null, line1: '', line2: null, isDefault: false };

export function AddressesManager() {
  const client = useQueryClient();
  const addresses = useQuery({ queryKey: commerceKeys.addresses, queryFn: accountApi.addresses });
  const [editing, setEditing] = useState<AddressDto | 'new' | null>(null);
  const invalidate = () => client.invalidateQueries({ queryKey: commerceKeys.addresses });
  const remove = useMutation({ mutationFn: accountApi.deleteAddress, onSuccess: () => { invalidate(); toast.success('Address deleted.'); }, onError: (error) => toast.error(commerceErrorMessage(error, 'Address could not be deleted.')) });
  const setDefault = useMutation({ mutationFn: accountApi.setDefaultAddress, onSuccess: () => { invalidate(); toast.success('Default address updated.'); }, onError: (error) => toast.error(commerceErrorMessage(error, 'Default address could not be updated.')) });

  if (addresses.isLoading) return <p className="py-16 text-center text-muted-foreground">Loading addresses…</p>;
  if (addresses.isError) return <div className="rounded-xl border p-8 text-center"><p>Addresses could not be loaded.</p><Button variant="outline" className="mt-4" onClick={() => addresses.refetch()}>Try again</Button></div>;
  return (
    <div>
      <div className="flex items-end justify-between gap-4"><div><h2 className="font-serif text-3xl">Addresses</h2><p className="mt-2 text-sm text-muted-foreground">Manage real delivery addresses used during checkout.</p></div><Button onClick={() => setEditing('new')}><Plus /> Add address</Button></div>
      {addresses.data?.length ? <div className="mt-8 grid gap-4 sm:grid-cols-2">{addresses.data.map((address) => <article key={address.id} className="rounded-xl border p-5"><div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-medium">{address.label || address.recipientName}</h3>{address.isDefault && <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700 dark:bg-green-950/40 dark:text-green-400">Default</span>}</div><p className="mt-3 text-sm text-muted-foreground">{address.recipientName}<br />{address.line1}{address.line2 ? `, ${address.line2}` : ''}<br />{[address.area, address.city, address.state, address.postalCode].filter(Boolean).join(', ')}<br />{address.countryCode} · {address.phone}</p></div></div><div className="mt-5 flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => setEditing(address)}><Pencil /> Edit</Button>{!address.isDefault && <Button variant="outline" size="sm" onClick={() => setDefault.mutate(address.id)} disabled={setDefault.isPending}><Check /> Make default</Button>}<Button variant="destructive" size="sm" onClick={() => { if (window.confirm('Delete this address?')) remove.mutate(address.id); }} disabled={remove.isPending}><Trash2 /> Delete</Button></div></article>)}</div> : <div className="mt-8 rounded-xl border border-dashed px-6 py-16 text-center"><p className="text-muted-foreground">No delivery addresses yet.</p></div>}
      <AddressDialog key={editing === 'new' ? 'new' : editing?.id ?? 'closed'} address={editing} onClose={() => setEditing(null)} onSaved={() => { invalidate(); setEditing(null); }} />
    </div>
  );
}

function AddressDialog({ address, onClose, onSaved }: { address: AddressDto | 'new' | null; onClose: () => void; onSaved: () => void }) {
  const initial = address && address !== 'new' ? { label: address.label ?? '', recipientName: address.recipientName, phone: address.phone, countryCode: address.countryCode, state: address.state ?? '', city: address.city, area: address.area ?? '', postalCode: address.postalCode ?? '', line1: address.line1, line2: address.line2 ?? '', isDefault: address.isDefault } : emptyAddress;
  const [form, setForm] = useState<AddressInput>(initial);
  const save = useMutation({ mutationFn: (input: AddressInput) => address && address !== 'new' ? accountApi.updateAddress(address.id, input) : accountApi.createAddress(input), onSuccess: () => { toast.success(address === 'new' ? 'Address added.' : 'Address updated.'); onSaved(); }, onError: (error) => toast.error(commerceErrorMessage(error, 'Address could not be saved.')) });
  const submit = (event: FormEvent) => { event.preventDefault(); save.mutate({ ...form, label: clean(form.label), state: clean(form.state), area: clean(form.area), postalCode: clean(form.postalCode), line2: clean(form.line2), countryCode: form.countryCode.toUpperCase() }); };
  const update = (key: keyof AddressInput, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const fields: Array<{ key: keyof AddressInput; label: string; max: number; required?: boolean }> = [
    { key: 'label', label: 'Label (optional)', max: 100 }, { key: 'recipientName', label: 'Recipient name', max: 200, required: true },
    { key: 'phone', label: 'Phone', max: 32, required: true }, { key: 'countryCode', label: 'Country code', max: 2, required: true },
    { key: 'state', label: 'State / governorate (optional)', max: 120 }, { key: 'city', label: 'City', max: 120, required: true },
    { key: 'area', label: 'Area (optional)', max: 120 }, { key: 'postalCode', label: 'Postal code (optional)', max: 32 },
    { key: 'line1', label: 'Address line 1', max: 255, required: true }, { key: 'line2', label: 'Address line 2 (optional)', max: 255 },
  ];
  return <Dialog open={Boolean(address)} onOpenChange={(open) => !open && onClose()}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{address === 'new' ? 'Add address' : 'Edit address'}</DialogTitle><DialogDescription>Use the delivery fields supported by Shoozy.</DialogDescription></DialogHeader><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">{fields.map((field) => <div key={field.key} className={`space-y-2 ${field.key === 'line1' || field.key === 'line2' ? 'sm:col-span-2' : ''}`}><Label htmlFor={`address-${field.key}`}>{field.label}</Label><Input id={`address-${field.key}`} value={String(form[field.key] ?? '')} maxLength={field.max} required={field.required} onChange={(event) => update(field.key, event.target.value)} className="h-10" /></div>)}<label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={form.isDefault} onChange={(event) => update('isDefault', event.target.checked)} />Set as default address</label><div className="flex justify-end gap-3 sm:col-span-2"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" disabled={save.isPending}>{save.isPending ? 'Saving…' : 'Save address'}</Button></div></form></DialogContent></Dialog>;
}

function clean(value: string | null | undefined) { const trimmed = value?.trim(); return trimmed ? trimmed : null; }

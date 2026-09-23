'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { accountApi } from '@/lib/api/account';
import { commerceErrorMessage } from '@/lib/api/errors';
import { formatMinorMoney } from '@/lib/format-money';
import { commerceKeys } from '@/lib/hooks/use-commerce';
import type { OrderDetailDto } from '@/types/commerce';
import { useTranslations } from '@/lib/hooks/use-translations';

export function OrderDetailClient({ orderId }: { orderId: string }) {
  const { locale, t } = useTranslations();
  const intlLocale = locale === 'ar' ? 'ar-TN' : 'en-TN';
  const client = useQueryClient();
  const order = useQuery({ queryKey: [...commerceKeys.orders, 'detail', orderId], queryFn: () => accountApi.order(orderId) });
  const settings = useQuery({ queryKey: ['commerce', 'store-settings'], queryFn: accountApi.storeSettings, staleTime: 5 * 60_000 });
  const [returnOpen, setReturnOpen] = useState(false);
  const cancel = useMutation({
    mutationFn: () => accountApi.cancelOrder(orderId),
    onSuccess: (value) => { client.setQueryData([...commerceKeys.orders, 'detail', orderId], value.order); client.invalidateQueries({ queryKey: commerceKeys.orders }); toast.success(t('account.cancelled')); },
    onError: (error) => toast.error(commerceErrorMessage(error, t('account.cancelError'))),
  });
  if (order.isLoading) return <p className="py-16 text-center text-muted-foreground">{t('account.orderLoading')}</p>;
  if (order.isError || !order.data) return <div className="rounded-xl border p-8 text-center"><p>{t('account.orderLoadError')}</p><Button variant="outline" className="mt-4" onClick={() => order.refetch()}>{t('common.retry')}</Button></div>;
  const value = order.data;
  return (
    <div>
      <Link href="/account/orders" className="text-sm text-muted-foreground hover:text-foreground">← {t('account.backOrders')}</Link>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-4"><div><h2 className="font-serif text-3xl" dir="ltr">{value.orderNumber}</h2><p className="mt-2 text-sm text-muted-foreground">{t('account.placedAt', { date: new Intl.DateTimeFormat(intlLocale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value.placedAt)) })}</p></div><span className="rounded-full bg-muted px-4 py-2 text-sm font-medium">{t(`status.${value.status}`)}</span></div>
      <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <section className="rounded-xl border p-5"><h3 className="font-serif text-xl">{t('account.items')}</h3><div className="mt-4 divide-y">{value.items.map((item) => <div key={item.id} className="flex justify-between gap-4 py-4 first:pt-0 last:pb-0"><div><p className="font-medium">{item.productName}</p><p className="mt-1 text-sm text-muted-foreground">{t('account.skuQuantity', { variant: item.variantName, sku: item.sku ? ` · SKU ${item.sku}` : '', quantity: item.quantity })}</p></div><p className="shrink-0 font-medium">{formatMinorMoney(item.lineTotalMinor, value.totals.currency, 3, intlLocale)}</p></div>)}</div></section>
          {value.address && <section className="rounded-xl border p-5"><h3 className="font-serif text-xl">{t('account.delivery')}</h3><p className="mt-3 text-sm text-muted-foreground">{value.address.recipientName}<br />{value.address.line1}{value.address.line2 ? `, ${value.address.line2}` : ''}<br />{[value.address.area, value.address.city, value.address.state, value.address.postalCode].filter(Boolean).join(', ')}<br /><bdi>{value.address.phone}</bdi></p>{value.shippingMethod && <p className="mt-3 text-sm"><strong>{value.shippingMethod.name}</strong>{value.shippingZone ? ` · ${value.shippingZone.name}` : ''}</p>}{value.trackingNumber && <p className="mt-2 text-sm" dir="ltr">{t('account.tracking', { number: value.trackingNumber })}</p>}</section>}
          <section className="rounded-xl border p-5"><h3 className="font-serif text-xl">{t('account.statusHistory')}</h3><ol className="mt-4 space-y-3">{value.statusHistory.map((status) => <li key={status.id} className="flex justify-between gap-4 text-sm"><span>{t(`status.${status.toStatus}`)}</span><time className="text-muted-foreground">{new Intl.DateTimeFormat(intlLocale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(status.createdAt))}</time></li>)}</ol></section>
        </div>
        <aside className="h-fit rounded-xl border p-5"><h3 className="font-serif text-xl">{t('account.totals')}</h3><OrderTotals order={value} /><div className="mt-6 space-y-3 border-t pt-5">{(value.status === 'PENDING' || value.status === 'CONFIRMED') && <Button variant="destructive" className="w-full" disabled={cancel.isPending} onClick={() => { if (window.confirm(t('account.cancelConfirm'))) cancel.mutate(); }}>{cancel.isPending ? t('account.cancelling') : t('account.cancelOrder')}</Button>}{value.status === 'DELIVERED' && <Button variant="outline" className="w-full" onClick={() => setReturnOpen(true)}>{t('account.requestReturn')}</Button>}{value.status === 'DELIVERED' && <Button asChild variant="outline" className="w-full"><Link href="/account/exchanges">{t('account.requestExchange')}</Link></Button>}</div>{value.status === 'DELIVERED' && <p className="mt-4 text-xs text-muted-foreground">{t('account.policyWindows', { returns: settings.data?.returnWindowDays ?? t('account.backendDefined'), exchanges: settings.data?.exchangeWindowDays ?? t('account.backendDefined') })}</p>}</aside>
      </div>
      <ReturnDialog order={value} open={returnOpen} onClose={() => setReturnOpen(false)} />
    </div>
  );
}

function OrderTotals({ order }: { order: OrderDetailDto }) { const { locale, t } = useTranslations(); const intlLocale = locale === 'ar' ? 'ar-TN' : 'en-TN'; return <dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><dt>{t('cart.subtotal')}</dt><dd>{formatMinorMoney(order.totals.subtotalMinor, order.totals.currency, 3, intlLocale)}</dd></div>{BigInt(order.totals.discountMinor) > BigInt(0) && <div className="flex justify-between text-green-700 dark:text-green-400"><dt>{t('cart.discount')}</dt><dd>−{formatMinorMoney(order.totals.discountMinor, order.totals.currency, 3, intlLocale)}</dd></div>}<div className="flex justify-between"><dt>{t('checkout.shippingTotal')}</dt><dd>{formatMinorMoney(order.totals.shippingMinor, order.totals.currency, 3, intlLocale)}</dd></div><div className="flex justify-between border-t pt-3 text-base font-semibold"><dt>{t('account.total')}</dt><dd>{formatMinorMoney(order.totals.totalMinor, order.totals.currency, 3, intlLocale)}</dd></div><div className="rounded-lg bg-muted p-3"><dt>{t('account.payment')}</dt><dd className="mt-1 font-medium">{t('checkout.cod')} · {t(`status.${order.paymentStatus}`)}</dd></div></dl>; }

function ReturnDialog({ order, open, onClose }: { order: OrderDetailDto; open: boolean; onClose: () => void }) {
  const client = useQueryClient();
  const { t } = useTranslations();
  const [reasonCode, setReasonCode] = useState('');
  const [details, setDetails] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const create = useMutation({
    mutationFn: () => accountApi.createReturn(order.id, { reasonCode, reasonDetails: details.trim() || null, items: Object.entries(quantities).filter(([, quantity]) => quantity > 0).map(([orderItemId, quantity]) => ({ orderItemId, quantity })) }),
    onSuccess: () => { client.invalidateQueries({ queryKey: commerceKeys.returns }); toast.success(t('account.returnSubmitted')); onClose(); },
    onError: (error) => toast.error(commerceErrorMessage(error, t('account.returnSubmitError'))),
  });
  const selected = Object.values(quantities).some((quantity) => quantity > 0);
  const submit = (event: FormEvent) => { event.preventDefault(); if (selected) create.mutate(); };
  return <Dialog open={open} onOpenChange={(value) => !value && onClose()}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{t('account.requestReturn')}</DialogTitle><DialogDescription>{t('account.returnDialogCopy')}</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-5"><div className="space-y-2"><Label htmlFor="return-reason">{t('account.reasonCode')}</Label><Input id="return-reason" value={reasonCode} onChange={(event) => setReasonCode(event.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))} minLength={1} maxLength={80} required placeholder={t('account.reasonPlaceholder')} dir="ltr" /><p className="text-xs text-muted-foreground">{t('account.reasonHelp')}</p></div><div className="space-y-3"><Label>{t('account.itemsQuantities')}</Label>{order.items.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 rounded-lg border p-3"><span className="text-sm">{item.productName}<br /><span className="text-muted-foreground">{item.variantName} · {t('account.purchased', { quantity: item.quantity })}</span></span><Input type="number" min={0} max={item.quantity} value={quantities[item.id] ?? 0} onChange={(event) => setQuantities((current) => ({ ...current, [item.id]: Math.max(0, Math.min(item.quantity, Number(event.target.value))) }))} className="w-20" aria-label={t('account.returnQuantity', { name: item.productName })} /></div>)}</div><div className="space-y-2"><Label htmlFor="return-details">{t('account.detailsOptional')}</Label><textarea id="return-details" value={details} onChange={(event) => setDetails(event.target.value)} maxLength={10000} rows={4} className="w-full rounded-lg border bg-background p-3 text-sm" /></div><div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button><Button type="submit" disabled={!selected || !reasonCode || create.isPending}>{create.isPending ? t('account.submitting') : t('account.submitReturn')}</Button></div></form></DialogContent></Dialog>;
}

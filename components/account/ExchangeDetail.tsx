'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { accountApi } from '@/lib/api/account';
import { formatMinorMoney } from '@/lib/format-money';
import { commerceKeys } from '@/lib/hooks/use-commerce';

export function ExchangeDetail({ exchangeId }: { exchangeId: string }) {
  const query = useQuery({ queryKey: [...commerceKeys.exchanges, 'detail', exchangeId], queryFn: () => accountApi.exchangeDetail(exchangeId) });
  if (query.isLoading) return <p className="py-16 text-center text-muted-foreground">Loading exchange…</p>;
  if (query.isError || !query.data) return <div className="rounded-xl border p-8 text-center"><p>Exchange could not be loaded.</p><Button variant="outline" className="mt-4" onClick={() => query.refetch()}>Try again</Button></div>;
  const value = query.data;
  return <div><Link href="/account/exchanges" className="text-sm text-muted-foreground">← Back to exchanges</Link><div className="mt-5 flex flex-wrap items-end justify-between gap-4"><div><h2 className="font-serif text-3xl">{value.exchangeNumber}</h2><p className="mt-2 text-sm text-muted-foreground">Order {value.order.orderNumber} · requested {new Date(value.requestedAt).toLocaleString()}</p></div><span className="rounded-full bg-muted px-4 py-2 text-sm font-medium">{value.status}</span></div>{value.item && <div className="mt-8 grid gap-5 md:grid-cols-2"><section className="rounded-xl border p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Original item</p><h3 className="mt-3 font-serif text-xl">{value.item.original.productName}</h3><p className="mt-2 text-sm text-muted-foreground">{value.item.original.variantName}{value.item.original.sku ? ` · SKU ${value.item.original.sku}` : ''}<br />Quantity {value.item.quantity}<br />{formatMinorMoney(value.item.original.unitPriceMinor, value.order.currency, 3)}</p></section><section className="rounded-xl border p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Requested replacement</p><h3 className="mt-3 font-serif text-xl">{value.item.replacement.title}</h3><p className="mt-2 text-sm text-muted-foreground">{value.item.replacement.sku ? `SKU ${value.item.replacement.sku} · ` : ''}{formatMinorMoney(value.item.replacement.priceMinor, value.order.currency, 3)}</p></section></div>}{value.reason && <section className="mt-5 rounded-xl border p-5"><h3 className="font-medium">Reason</h3><p className="mt-2 text-sm text-muted-foreground">{value.reason}</p></section>}</div>;
}

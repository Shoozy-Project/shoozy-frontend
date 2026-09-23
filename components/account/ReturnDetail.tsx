'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { accountApi } from '@/lib/api/account';
import { formatMinorMoney } from '@/lib/format-money';
import { commerceKeys } from '@/lib/hooks/use-commerce';

export function ReturnDetail({ returnId }: { returnId: string }) {
  const query = useQuery({ queryKey: [...commerceKeys.returns, 'detail', returnId], queryFn: () => accountApi.returnDetail(returnId) });
  if (query.isLoading) return <p className="py-16 text-center text-muted-foreground">Loading return…</p>;
  if (query.isError || !query.data) return <div className="rounded-xl border p-8 text-center"><p>Return could not be loaded.</p><Button variant="outline" className="mt-4" onClick={() => query.refetch()}>Try again</Button></div>;
  const value = query.data;
  return <div><Link href="/account/returns" className="text-sm text-muted-foreground">← Back to returns</Link><div className="mt-5 flex flex-wrap items-end justify-between gap-4"><div><h2 className="font-serif text-3xl">{value.returnNumber}</h2><p className="mt-2 text-sm text-muted-foreground">Order {value.order.orderNumber} · requested {new Date(value.requestedAt).toLocaleString()}</p></div><span className="rounded-full bg-muted px-4 py-2 text-sm font-medium">{value.status}</span></div><div className="mt-8 grid gap-5 md:grid-cols-2"><section className="rounded-xl border p-5"><h3 className="font-serif text-xl">Returned items</h3><div className="mt-4 divide-y">{value.items.map((item) => <div key={item.id} className="py-4 first:pt-0 last:pb-0"><p className="font-medium">{item.orderItem.productName}</p><p className="mt-1 text-sm text-muted-foreground">{item.orderItem.variantName} · Qty {item.quantity}{item.orderItem.sku ? ` · SKU ${item.orderItem.sku}` : ''}</p></div>)}</div></section><section className="rounded-xl border p-5"><h3 className="font-serif text-xl">Request</h3><dl className="mt-4 space-y-3 text-sm"><div><dt className="text-muted-foreground">Reason</dt><dd className="font-medium">{value.reasonCode}</dd></div>{value.reasonDetails && <div><dt className="text-muted-foreground">Details</dt><dd className="whitespace-pre-line">{value.reasonDetails}</dd></div>}<div><dt className="text-muted-foreground">Recorded refund</dt><dd className="font-medium">{formatMinorMoney(value.refundAmountMinor, value.order.currency, 3)}</dd></div>{value.refundMethod && <div><dt className="text-muted-foreground">Refund method</dt><dd>{value.refundMethod}</dd></div>}</dl>{value.refundNotice && <p className="mt-5 rounded-lg bg-muted p-3 text-xs text-muted-foreground">{value.refundNotice}</p>}</section></div></div>;
}

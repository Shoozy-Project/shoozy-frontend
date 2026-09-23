'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { accountApi } from '@/lib/api/account';
import { formatMinorMoney } from '@/lib/format-money';
import { commerceKeys } from '@/lib/hooks/use-commerce';

export function OrdersList() {
  const [page, setPage] = useState(1);
  const orders = useQuery({ queryKey: [...commerceKeys.orders, page], queryFn: () => accountApi.orders(page, 10) });
  return <div><h2 className="font-serif text-3xl">Orders</h2><p className="mt-2 text-sm text-muted-foreground">Your customer orders, newest first.</p>{orders.isLoading ? <p className="py-16 text-center text-muted-foreground">Loading orders…</p> : orders.isError ? <div className="mt-8 rounded-xl border p-8 text-center"><p>Orders could not be loaded.</p><Button variant="outline" className="mt-4" onClick={() => orders.refetch()}>Try again</Button></div> : orders.data?.items.length ? <><div className="mt-8 divide-y rounded-xl border">{orders.data.items.map((order) => <Link href={`/account/orders/${order.id}`} key={order.id} className="grid gap-3 p-5 hover:bg-muted sm:grid-cols-[1fr_auto_auto] sm:items-center"><div><p className="font-medium">{order.orderNumber}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()} · {order.itemCount} items</p></div><span className="w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium">{order.status}</span><span className="font-semibold">{formatMinorMoney(order.totals.totalMinor, order.totals.currency, 3)}</span></Link>)}</div><div className="mt-6 flex justify-center gap-3"><Button variant="outline" disabled={page <= 1 || orders.isFetching} onClick={() => setPage((value) => value - 1)}>Previous</Button><span className="self-center text-sm">Page {page} of {orders.data.pagination.totalPages}</span><Button variant="outline" disabled={page >= orders.data.pagination.totalPages || orders.isFetching} onClick={() => setPage((value) => value + 1)}>Next</Button></div></> : <div className="mt-8 rounded-xl border border-dashed py-16 text-center"><p className="text-muted-foreground">No orders yet.</p><Button asChild className="mt-6"><Link href="/products">Shop products</Link></Button></div>}</div>;
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { accountApi } from '@/lib/api/account';
import { commerceKeys } from '@/lib/hooks/use-commerce';

export function ExchangesList() {
  const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: [...commerceKeys.exchanges, page], queryFn: () => accountApi.exchanges(page, 10) });
  return <div><h2 className="font-serif text-3xl">Size exchanges</h2><p className="mt-2 text-sm text-muted-foreground">Track replacement requests validated by Shoozy.</p><p className="mt-5 rounded-lg bg-muted p-4 text-sm text-muted-foreground">New exchange requests need a backend-provided list of eligible replacement variants. The current customer API does not expose that list, so this page safely shows existing requests without asking you for internal variant IDs.</p>{query.isLoading ? <p className="py-16 text-center text-muted-foreground">Loading exchanges…</p> : query.isError ? <div className="mt-8 rounded-xl border p-8 text-center"><p>Exchanges could not be loaded.</p><Button variant="outline" className="mt-4" onClick={() => query.refetch()}>Try again</Button></div> : query.data?.items.length ? <><div className="mt-8 divide-y rounded-xl border">{query.data.items.map((item) => <Link key={item.id} href={`/account/exchanges/${item.id}`} className="grid gap-3 p-5 hover:bg-muted sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="font-medium">{item.exchangeNumber}</p><p className="mt-1 text-xs text-muted-foreground">Order {item.order.orderNumber} · {new Date(item.requestedAt).toLocaleDateString()}</p></div><span className="w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium">{item.status}</span></Link>)}</div><div className="mt-6 flex justify-center gap-3"><Button variant="outline" disabled={page <= 1 || query.isFetching} onClick={() => setPage(page - 1)}>Previous</Button><span className="self-center text-sm">Page {page} of {query.data.pagination.totalPages}</span><Button variant="outline" disabled={page >= query.data.pagination.totalPages || query.isFetching} onClick={() => setPage(page + 1)}>Next</Button></div></> : <div className="mt-8 rounded-xl border border-dashed py-16 text-center"><p className="text-muted-foreground">No exchange requests yet.</p><Button asChild className="mt-6"><Link href="/account/orders">View delivered orders</Link></Button></div>}</div>;
}

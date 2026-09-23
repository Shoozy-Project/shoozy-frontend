'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { accountApi } from '@/lib/api/account';
import { formatMinorMoney } from '@/lib/format-money';
import { commerceKeys } from '@/lib/hooks/use-commerce';

export function ReturnsList() {
  const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: [...commerceKeys.returns, page], queryFn: () => accountApi.returns(page, 10) });
  return <div><h2 className="font-serif text-3xl">Returns</h2><p className="mt-2 text-sm text-muted-foreground">Track return requests submitted from delivered orders.</p>{query.isLoading ? <p className="py-16 text-center text-muted-foreground">Loading returns…</p> : query.isError ? <ErrorState retry={() => query.refetch()} /> : query.data?.items.length ? <><div className="mt-8 divide-y rounded-xl border">{query.data.items.map((item) => <Link key={item.id} href={`/account/returns/${item.id}`} className="grid gap-3 p-5 hover:bg-muted sm:grid-cols-[1fr_auto_auto] sm:items-center"><div><p className="font-medium">{item.returnNumber}</p><p className="mt-1 text-xs text-muted-foreground">Order {item.order.orderNumber} · {new Date(item.requestedAt).toLocaleDateString()}</p></div><span className="w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium">{item.status}</span><span className="font-medium">{formatMinorMoney(item.refundAmountMinor, item.order.currency, 3)}</span></Link>)}</div><Pager page={page} total={query.data.pagination.totalPages} busy={query.isFetching} setPage={setPage} /></> : <Empty text="No return requests yet." />}</div>;
}

function Pager({ page, total, busy, setPage }: { page: number; total: number; busy: boolean; setPage: (page: number) => void }) { return <div className="mt-6 flex justify-center gap-3"><Button variant="outline" disabled={page <= 1 || busy} onClick={() => setPage(page - 1)}>Previous</Button><span className="self-center text-sm">Page {page} of {total}</span><Button variant="outline" disabled={page >= total || busy} onClick={() => setPage(page + 1)}>Next</Button></div>; }
function ErrorState({ retry }: { retry: () => void }) { return <div className="mt-8 rounded-xl border p-8 text-center"><p>Returns could not be loaded.</p><Button variant="outline" className="mt-4" onClick={retry}>Try again</Button></div>; }
function Empty({ text }: { text: string }) { return <div className="mt-8 rounded-xl border border-dashed py-16 text-center"><p className="text-muted-foreground">{text}</p><Button asChild className="mt-6"><Link href="/account/orders">View orders</Link></Button></div>; }

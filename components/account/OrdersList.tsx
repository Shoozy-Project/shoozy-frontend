'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { accountApi } from '@/lib/api/account';
import { formatMinorMoney } from '@/lib/format-money';
import { commerceKeys } from '@/lib/hooks/use-commerce';
import { useTranslations } from '@/lib/hooks/use-translations';

export function OrdersList() {
  const [page, setPage] = useState(1);
  const orders = useQuery({ queryKey: [...commerceKeys.orders, page], queryFn: () => accountApi.orders(page, 10) });
  const { locale, t } = useTranslations();
  const intlLocale = locale === 'ar' ? 'ar-TN' : 'en-TN';
  return <div><h2 className="font-serif text-3xl">{t('account.orders')}</h2><p className="mt-2 text-sm text-muted-foreground">{t('account.ordersCopy')}</p>{orders.isLoading ? <p className="py-16 text-center text-muted-foreground">{t('account.loadingOrders')}</p> : orders.isError ? <div className="mt-8 rounded-xl border p-8 text-center"><p>{t('account.ordersLoadError')}</p><Button variant="outline" className="mt-4" onClick={() => orders.refetch()}>{t('common.retry')}</Button></div> : orders.data?.items.length ? <><div className="mt-8 divide-y rounded-xl border">{orders.data.items.map((order) => <Link href={`/account/orders/${order.id}`} key={order.id} className="grid gap-3 p-5 hover:bg-muted sm:grid-cols-[1fr_auto_auto] sm:items-center"><div><p className="font-medium" dir="ltr">{order.orderNumber}</p><p className="mt-1 text-xs text-muted-foreground">{new Intl.DateTimeFormat(intlLocale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(order.createdAt))} · {t('account.itemsCount', { count: order.itemCount })}</p></div><span className="w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium">{t(`status.${order.status}`)}</span><span className="font-semibold">{formatMinorMoney(order.totals.totalMinor, order.totals.currency, 3, intlLocale)}</span></Link>)}</div><div className="mt-6 flex justify-center gap-3"><Button variant="outline" disabled={page <= 1 || orders.isFetching} onClick={() => setPage((value) => value - 1)}>{t('common.previous')}</Button><span className="self-center text-sm">{t('account.pageOf', { page, total: orders.data.pagination.totalPages })}</span><Button variant="outline" disabled={page >= orders.data.pagination.totalPages || orders.isFetching} onClick={() => setPage((value) => value + 1)}>{t('common.next')}</Button></div></> : <div className="mt-8 rounded-xl border border-dashed py-16 text-center"><p className="text-muted-foreground">{t('account.noOrders')}</p><Button asChild className="mt-6"><Link href="/products">{t('cart.shop')}</Link></Button></div>}</div>;
}

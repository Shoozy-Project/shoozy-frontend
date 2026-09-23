'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { accountApi } from '@/lib/api/account';
import { commerceKeys } from '@/lib/hooks/use-commerce';
import { useTranslations } from '@/lib/hooks/use-translations';

export function ExchangesList() {
  const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: [...commerceKeys.exchanges, page], queryFn: () => accountApi.exchanges(page, 10) });
  const { locale, t } = useTranslations();
  const intlLocale = locale === 'ar' ? 'ar-TN' : 'en-TN';
  return <div><h2 className="font-serif text-3xl">{t('account.exchangesTitle')}</h2><p className="mt-2 text-sm text-muted-foreground">{t('account.exchangesCopy')}</p><p className="mt-5 rounded-lg bg-muted p-4 text-sm text-muted-foreground">{t('account.exchangesLimitation')}</p>{query.isLoading ? <p className="py-16 text-center text-muted-foreground">{t('account.loadingExchanges')}</p> : query.isError ? <div className="mt-8 rounded-xl border p-8 text-center"><p>{t('account.exchangesLoadError')}</p><Button variant="outline" className="mt-4" onClick={() => query.refetch()}>{t('common.retry')}</Button></div> : query.data?.items.length ? <><div className="mt-8 divide-y rounded-xl border">{query.data.items.map((item) => <Link key={item.id} href={`/account/exchanges/${item.id}`} className="grid gap-3 p-5 hover:bg-muted sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="font-medium" dir="ltr">{item.exchangeNumber}</p><p className="mt-1 text-xs text-muted-foreground">{t('account.orderRequested', { number: item.order.orderNumber, date: new Intl.DateTimeFormat(intlLocale).format(new Date(item.requestedAt)) })}</p></div><span className="w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium">{t(`status.${item.status}`)}</span></Link>)}</div><div className="mt-6 flex justify-center gap-3"><Button variant="outline" disabled={page <= 1 || query.isFetching} onClick={() => setPage(page - 1)}>{t('common.previous')}</Button><span className="self-center text-sm">{t('account.pageOf', { page, total: query.data.pagination.totalPages })}</span><Button variant="outline" disabled={page >= query.data.pagination.totalPages || query.isFetching} onClick={() => setPage(page + 1)}>{t('common.next')}</Button></div></> : <div className="mt-8 rounded-xl border border-dashed py-16 text-center"><p className="text-muted-foreground">{t('account.noExchanges')}</p><Button asChild className="mt-6"><Link href="/account/orders">{t('account.viewDelivered')}</Link></Button></div>}</div>;
}

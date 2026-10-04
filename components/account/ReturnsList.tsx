'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { accountApi } from '@/lib/api/account';
import { formatMinorMoney } from '@/lib/format-money';
import { commerceKeys } from '@/lib/hooks/use-commerce';
import { useTranslations } from '@/lib/hooks/use-translations';

export function ReturnsList() {
  const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: [...commerceKeys.returns, page], queryFn: () => accountApi.returns(page, 10) });
  const { locale, t } = useTranslations();
  const intlLocale = locale === 'ar' ? 'ar-TN' : 'en-TN';
  return <div><h2 className="font-serif text-3xl">{t('account.returns')}</h2><p className="mt-2 text-sm text-muted-foreground">{t('account.returnsCopy')}</p>{query.isLoading ? <p className="py-16 text-center text-muted-foreground">{t('account.loadingReturns')}</p> : query.isError ? <ErrorState retry={() => query.refetch()} /> : query.data?.items.length ? <><div className="mt-8 divide-y rounded-xl border">{query.data.items.map((item) => <Link key={item.id} href={`/account/returns/${item.id}`} className="grid gap-3 p-5 hover:bg-muted sm:grid-cols-[1fr_auto_auto] sm:items-center"><div><p className="font-medium" dir="ltr">{item.returnNumber}</p><p className="mt-1 text-xs text-muted-foreground">{t('account.orderRequested', { number: item.order.orderNumber, date: new Intl.DateTimeFormat(intlLocale).format(new Date(item.requestedAt)) })}</p></div><span className="w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium">{t(`status.${item.status}`)}</span><span className="font-medium">{formatMinorMoney(item.refundAmountMinor, item.order.currency, 3, intlLocale)}</span></Link>)}</div><Pager page={page} total={query.data.pagination.totalPages} busy={query.isFetching} setPage={setPage} /></> : <Empty />}</div>;
}

function Pager({ page, total, busy, setPage }: { page: number; total: number; busy: boolean; setPage: (page: number) => void }) { const { t } = useTranslations(); return <div className="mt-6 flex justify-center gap-3"><Button variant="outline" disabled={page <= 1 || busy} onClick={() => setPage(page - 1)}>{t('common.previous')}</Button><span className="self-center text-sm">{t('account.pageOf', { page, total })}</span><Button variant="outline" disabled={page >= total || busy} onClick={() => setPage(page + 1)}>{t('common.next')}</Button></div>; }
function ErrorState({ retry }: { retry: () => void }) { const { t } = useTranslations(); return <div className="mt-8 rounded-xl border p-8 text-center"><p>{t('account.returnsLoadError')}</p><Button variant="outline" className="mt-4" onClick={retry}>{t('common.retry')}</Button></div>; }
function Empty() { const { t } = useTranslations(); return <div className="mt-8 rounded-xl border border-dashed py-16 text-center"><p className="text-muted-foreground">{t('account.noReturns')}</p><Button asChild className="mt-6"><Link href="/account/orders">{t('account.viewOrders')}</Link></Button></div>; }

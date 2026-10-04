'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { accountApi } from '@/lib/api/account';
import { formatMinorMoney } from '@/lib/format-money';
import { commerceKeys } from '@/lib/hooks/use-commerce';
import { useTranslations } from '@/lib/hooks/use-translations';

export function ReturnDetail({ returnId }: { returnId: string }) {
  const { locale, t } = useTranslations();
  const intlLocale = locale === 'ar' ? 'ar-TN' : 'en-TN';
  const query = useQuery({ queryKey: [...commerceKeys.returns, 'detail', returnId], queryFn: () => accountApi.returnDetail(returnId) });
  if (query.isLoading) return <p className="py-16 text-center text-muted-foreground">{t('account.returnLoading')}</p>;
  if (query.isError || !query.data) return <div className="rounded-xl border p-8 text-center"><p>{t('account.returnLoadError')}</p><Button variant="outline" className="mt-4" onClick={() => query.refetch()}>{t('common.retry')}</Button></div>;
  const value = query.data;
  return <div><Link href="/account/returns" className="text-sm text-muted-foreground">← {t('account.backReturns')}</Link><div className="mt-5 flex flex-wrap items-end justify-between gap-4"><div><h2 className="font-serif text-3xl" dir="ltr">{value.returnNumber}</h2><p className="mt-2 text-sm text-muted-foreground">{t('account.orderRequested', { number: value.order.orderNumber, date: new Intl.DateTimeFormat(intlLocale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value.requestedAt)) })}</p></div><span className="rounded-full bg-muted px-4 py-2 text-sm font-medium">{t(`status.${value.status}`)}</span></div><div className="mt-8 grid gap-5 md:grid-cols-2"><section className="rounded-xl border p-5"><h3 className="font-serif text-xl">{t('account.returnedItems')}</h3><div className="mt-4 divide-y">{value.items.map((item) => <div key={item.id} className="py-4 first:pt-0 last:pb-0"><p className="font-medium">{item.orderItem.productName}</p><p className="mt-1 text-sm text-muted-foreground">{t('account.skuQuantity', { variant: item.orderItem.variantName, sku: item.orderItem.sku ? ` · SKU ${item.orderItem.sku}` : '', quantity: item.quantity })}</p></div>)}</div></section><section className="rounded-xl border p-5"><h3 className="font-serif text-xl">{t('account.request')}</h3><dl className="mt-4 space-y-3 text-sm"><div><dt className="text-muted-foreground">{t('account.reason')}</dt><dd className="font-medium">{value.reasonCode}</dd></div>{value.reasonDetails && <div><dt className="text-muted-foreground">{t('account.details')}</dt><dd className="whitespace-pre-line">{value.reasonDetails}</dd></div>}<div><dt className="text-muted-foreground">{t('account.recordedRefund')}</dt><dd className="font-medium">{formatMinorMoney(value.refundAmountMinor, value.order.currency, 3, intlLocale)}</dd></div>{value.refundMethod && <div><dt className="text-muted-foreground">{t('account.refundMethod')}</dt><dd>{value.refundMethod}</dd></div>}</dl>{value.refundNotice && <p className="mt-5 rounded-lg bg-muted p-3 text-xs text-muted-foreground">{value.refundNotice}</p>}</section></div></div>;
}

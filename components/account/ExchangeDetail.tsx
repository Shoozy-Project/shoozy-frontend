'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { accountApi } from '@/lib/api/account';
import { formatMinorMoney } from '@/lib/format-money';
import { commerceKeys } from '@/lib/hooks/use-commerce';
import { useTranslations } from '@/lib/hooks/use-translations';

export function ExchangeDetail({ exchangeId }: { exchangeId: string }) {
  const { locale, t } = useTranslations();
  const intlLocale = locale === 'ar' ? 'ar-TN' : 'en-TN';
  const query = useQuery({ queryKey: [...commerceKeys.exchanges, 'detail', exchangeId], queryFn: () => accountApi.exchangeDetail(exchangeId) });
  if (query.isLoading) return <p className="py-16 text-center text-muted-foreground">{t('account.exchangeLoading')}</p>;
  if (query.isError || !query.data) return <div className="rounded-xl border p-8 text-center"><p>{t('account.exchangeLoadError')}</p><Button variant="outline" className="mt-4" onClick={() => query.refetch()}>{t('common.retry')}</Button></div>;
  const value = query.data;
  return <div><Link href="/account/exchanges" className="text-sm text-muted-foreground">← {t('account.backExchanges')}</Link><div className="mt-5 flex flex-wrap items-end justify-between gap-4"><div><h2 className="font-serif text-3xl" dir="ltr">{value.exchangeNumber}</h2><p className="mt-2 text-sm text-muted-foreground">{t('account.orderRequested', { number: value.order.orderNumber, date: new Intl.DateTimeFormat(intlLocale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value.requestedAt)) })}</p></div><span className="rounded-full bg-muted px-4 py-2 text-sm font-medium">{t(`status.${value.status}`)}</span></div>{value.item && <div className="mt-8 grid gap-5 md:grid-cols-2"><section className="rounded-xl border p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">{t('account.originalItem')}</p><h3 className="mt-3 font-serif text-xl">{value.item.original.productName}</h3><p className="mt-2 text-sm text-muted-foreground">{value.item.original.variantName}{value.item.original.sku ? ` · SKU ${value.item.original.sku}` : ''}<br />{t('account.quantity', { quantity: value.item.quantity })}<br />{formatMinorMoney(value.item.original.unitPriceMinor, value.order.currency, 3, intlLocale)}</p></section><section className="rounded-xl border p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">{t('account.replacement')}</p><h3 className="mt-3 font-serif text-xl">{value.item.replacement.title}</h3><p className="mt-2 text-sm text-muted-foreground">{value.item.replacement.sku ? `SKU ${value.item.replacement.sku} · ` : ''}{formatMinorMoney(value.item.replacement.priceMinor, value.order.currency, 3, intlLocale)}</p></section></div>}{value.reason && <section className="mt-5 rounded-xl border p-5"><h3 className="font-medium">{t('account.reason')}</h3><p className="mt-2 text-sm text-muted-foreground">{value.reason}</p></section>}</div>;
}

'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Package, UserRound } from 'lucide-react';
import { accountApi } from '@/lib/api/account';
import { commerceKeys } from '@/lib/hooks/use-commerce';
import { useTranslations } from '@/lib/hooks/use-translations';

export function AccountOverview() {
  const profile = useQuery({ queryKey: commerceKeys.profile, queryFn: accountApi.profile });
  const orders = useQuery({ queryKey: [...commerceKeys.orders, 1], queryFn: () => accountApi.orders(1, 3) });
  const { locale, t } = useTranslations();
  const intlLocale = locale === 'ar' ? 'ar-TN' : 'en-TN';

  if (profile.isLoading) return <p className="py-16 text-center text-muted-foreground">{t('account.loading')}</p>;
  if (profile.isError || !profile.data) return <div className="rounded-xl border p-8 text-center"><p>{t('account.loadError')}</p><button onClick={() => profile.refetch()} className="mt-4 text-sm underline">{t('common.retry')}</button></div>;

  return (
    <div>
      <h2 className="font-serif text-3xl">{t('account.welcome', { name: profile.data.firstName })}</h2>
      <p className="mt-2 text-muted-foreground">{t('account.overviewCopy')}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[{ href: '/account/profile', label: t('account.profile'), text: profile.data.email, icon: UserRound }, { href: '/account/addresses', label: t('account.addresses'), text: t('account.deliveryDetails'), icon: MapPin }, { href: '/account/orders', label: t('account.orders'), text: t('account.orderCount', { count: orders.data?.pagination.total ?? 0 }), icon: Package }].map((item) => <Link key={item.href} href={item.href} className="rounded-xl border p-5 transition-colors hover:bg-muted"><item.icon className="size-5" /><h3 className="mt-4 font-medium">{item.label}</h3><p className="mt-1 truncate text-sm text-muted-foreground">{item.text}</p></Link>)}
      </div>
      <div className="mt-10"><div className="flex items-end justify-between gap-4"><h2 className="font-serif text-2xl">{t('account.recentOrders')}</h2><Link href="/account/orders" className="text-sm underline">{t('account.viewAll')}</Link></div>{orders.isLoading ? <p className="mt-5 text-sm text-muted-foreground">{t('account.loadingOrders')}</p> : orders.data?.items.length ? <div className="mt-5 divide-y rounded-xl border">{orders.data.items.map((order) => <Link href={`/account/orders/${order.id}`} key={order.id} className="flex flex-wrap items-center justify-between gap-4 p-4 hover:bg-muted"><div><p className="font-medium" dir="ltr">{order.orderNumber}</p><p className="text-xs text-muted-foreground">{new Intl.DateTimeFormat(intlLocale).format(new Date(order.createdAt))}</p></div><span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{t(`status.${order.status}`)}</span></Link>)}</div> : <p className="mt-5 text-sm text-muted-foreground">{t('account.noOrdersYet')}</p>}</div>
    </div>
  );
}

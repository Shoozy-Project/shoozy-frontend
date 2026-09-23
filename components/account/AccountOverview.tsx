'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Package, UserRound } from 'lucide-react';
import { accountApi } from '@/lib/api/account';
import { commerceKeys } from '@/lib/hooks/use-commerce';

export function AccountOverview() {
  const profile = useQuery({ queryKey: commerceKeys.profile, queryFn: accountApi.profile });
  const orders = useQuery({ queryKey: [...commerceKeys.orders, 1], queryFn: () => accountApi.orders(1, 3) });

  if (profile.isLoading) return <p className="py-16 text-center text-muted-foreground">Loading your account…</p>;
  if (profile.isError || !profile.data) return <div className="rounded-xl border p-8 text-center"><p>Your account could not be loaded.</p><button onClick={() => profile.refetch()} className="mt-4 text-sm underline">Try again</button></div>;

  return (
    <div>
      <h2 className="font-serif text-3xl">Welcome, {profile.data.firstName}</h2>
      <p className="mt-2 text-muted-foreground">Manage your details and follow every Shoozy order from here.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[{ href: '/account/profile', label: 'Profile', text: profile.data.email, icon: UserRound }, { href: '/account/addresses', label: 'Addresses', text: 'Delivery details', icon: MapPin }, { href: '/account/orders', label: 'Orders', text: `${orders.data?.pagination.total ?? 0} orders`, icon: Package }].map((item) => <Link key={item.href} href={item.href} className="rounded-xl border p-5 transition-colors hover:bg-muted"><item.icon className="size-5" /><h3 className="mt-4 font-medium">{item.label}</h3><p className="mt-1 truncate text-sm text-muted-foreground">{item.text}</p></Link>)}
      </div>
      <div className="mt-10"><div className="flex items-end justify-between gap-4"><h2 className="font-serif text-2xl">Recent orders</h2><Link href="/account/orders" className="text-sm underline">View all</Link></div>{orders.isLoading ? <p className="mt-5 text-sm text-muted-foreground">Loading orders…</p> : orders.data?.items.length ? <div className="mt-5 divide-y rounded-xl border">{orders.data.items.map((order) => <Link href={`/account/orders/${order.id}`} key={order.id} className="flex flex-wrap items-center justify-between gap-4 p-4 hover:bg-muted"><div><p className="font-medium">{order.orderNumber}</p><p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p></div><span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{order.status}</span></Link>)}</div> : <p className="mt-5 text-sm text-muted-foreground">You have not placed an order yet.</p>}</div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Banknote, Headphones, RefreshCcw } from 'lucide-react';
import { accountApi } from '@/lib/api/account';

export default function Advantages() {
  const settings = useQuery({ queryKey: ['commerce', 'store-settings'], queryFn: accountApi.storeSettings, staleTime: 5 * 60_000 });
  const contact = settings.data?.supportPhone || settings.data?.supportEmail;
  const contactHref = settings.data?.supportPhone ? `tel:${settings.data.supportPhone}` : settings.data?.supportEmail ? `mailto:${settings.data.supportEmail}` : '/account';
  const advantages = [
    { icon: Banknote, title: 'Cash on Delivery', description: 'Pay the final backend-confirmed total when your order arrives.', href: '/products', link: 'Start shopping' },
    { icon: RefreshCcw, title: 'Returns & exchanges', description: settings.data ? `Return window: ${settings.data.returnWindowDays} days. Exchange window: ${settings.data.exchangeWindowDays} days. Eligibility is confirmed by Shoozy.` : 'Eligibility and status are confirmed by Shoozy.', href: '/account/orders', link: 'View orders' },
    { icon: Headphones, title: 'Customer support', description: contact || (settings.isLoading ? 'Loading support details…' : 'Support details are available in your account.'), href: contactHref, link: contact ? 'Contact support' : 'My account' },
  ];
  return (
    <section className="w-full border-t border-border/30 bg-background px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl"><h3 className="mb-16 text-center font-serif text-2xl">Shopping with Shoozy</h3><div className="grid grid-cols-1 gap-12 text-center md:grid-cols-3 md:gap-8">{advantages.map((item) => <div key={item.title} className="flex flex-col items-center"><item.icon className="mb-6 size-10" strokeWidth={1} /><h4 className="font-semibold uppercase tracking-wider">{item.title}</h4><p className="mb-6 mt-2 max-w-xs text-sm text-muted-foreground">{item.description}</p><Link href={item.href} className="border-b border-foreground/30 pb-1 text-xs uppercase tracking-widest hover:border-foreground">{item.link}</Link></div>)}</div></div>
    </section>
  );
}

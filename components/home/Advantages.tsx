'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Banknote, Headphones, RefreshCcw } from 'lucide-react';
import { accountApi } from '@/lib/api/account';
import { useTranslations } from '@/lib/hooks/use-translations';

export default function Advantages() {
  const { t } = useTranslations();
  const settings = useQuery({ queryKey: ['commerce', 'store-settings'], queryFn: accountApi.storeSettings, staleTime: 5 * 60_000 });
  const contact = settings.data?.supportPhone || settings.data?.supportEmail;
  const contactHref = settings.data?.supportPhone ? `tel:${settings.data.supportPhone}` : settings.data?.supportEmail ? `mailto:${settings.data.supportEmail}` : '/account';
  const advantages = [
    { icon: Banknote, title: t('home.cashTitle'), description: t('home.cashCopy'), href: '/products', link: t('home.startShopping') },
    { icon: RefreshCcw, title: t('home.returnsTitle'), description: settings.data ? t('home.returnsWindows', { returns: settings.data.returnWindowDays, exchanges: settings.data.exchangeWindowDays }) : t('home.eligibility'), href: '/account/orders', link: t('home.viewOrders') },
    { icon: Headphones, title: t('home.supportTitle'), description: contact || (settings.isLoading ? t('home.supportLoading') : t('home.supportAccount')), href: contactHref, link: contact ? t('home.contactSupport') : t('header.account') },
  ];
  return (
    <section className="w-full bg-[#fbfbf9] dark:bg-[#111112] border-y border-neutral-200/60 dark:border-neutral-800/60 px-4 sm:px-6 py-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        <h3 className="mb-16 text-center font-serif text-2xl">{t('home.shoppingWith')}</h3>
        <div className="grid grid-cols-1 gap-12 text-center md:grid-cols-3 md:gap-8">
          {advantages.map((item) => (
            <div key={item.title} className="flex flex-col items-center">
              <item.icon className="mb-6 size-10" strokeWidth={1} />
              <h4 className="font-semibold uppercase tracking-wider">{item.title}</h4>
              <p className="mb-6 mt-2 max-w-xs text-sm text-muted-foreground">
                {item.description}
              </p>
              <Link href={item.href} className="border-b border-foreground/30 pb-1 text-xs uppercase tracking-widest hover:border-foreground">
                {item.link}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

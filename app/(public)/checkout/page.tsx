import type { Metadata } from 'next';
import { CheckoutPageClient } from '@/components/commerce/CheckoutPageClient';
import { getServerTranslations } from '@/lib/i18n-server';

export async function generateMetadata(): Promise<Metadata> { const { t } = await getServerTranslations(); return { title: t('meta.checkoutTitle'), robots: { index: false, follow: false } }; }

export default async function CheckoutPage() {
  const { t } = await getServerTranslations();
  return <div className="mx-auto max-w-7xl px-4 pb-24 pt-40 sm:px-6 lg:px-8"><h1 className="mb-10 font-serif text-4xl md:text-5xl">{t('checkout.heading')}</h1><CheckoutPageClient /></div>;
}

import type { Metadata } from 'next';
import { OrderSuccessClient } from '@/components/commerce/OrderSuccessClient';
import { getServerTranslations } from '@/lib/i18n-server';

export async function generateMetadata(): Promise<Metadata> { const { t } = await getServerTranslations(); return { title: t('meta.orderConfirmedTitle'), robots: { index: false, follow: false } }; }

export default async function OrderSuccessPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  return <div className="px-4 pb-24 pt-40 sm:px-6"><OrderSuccessClient orderNumber={orderNumber} /></div>;
}

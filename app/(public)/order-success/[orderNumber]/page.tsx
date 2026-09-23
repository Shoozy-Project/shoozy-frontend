import type { Metadata } from 'next';
import { OrderSuccessClient } from '@/components/commerce/OrderSuccessClient';

export const metadata: Metadata = { title: 'Order Confirmed', robots: { index: false, follow: false } };

export default async function OrderSuccessPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  return <div className="px-4 pb-24 pt-40 sm:px-6"><OrderSuccessClient orderNumber={orderNumber} /></div>;
}

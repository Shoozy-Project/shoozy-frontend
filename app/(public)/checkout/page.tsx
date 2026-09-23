import type { Metadata } from 'next';
import { CheckoutPageClient } from '@/components/commerce/CheckoutPageClient';

export const metadata: Metadata = { title: 'Checkout', robots: { index: false, follow: false } };

export default function CheckoutPage() {
  return <div className="mx-auto max-w-7xl px-4 pb-24 pt-40 sm:px-6 lg:px-8"><h1 className="mb-10 font-serif text-4xl md:text-5xl">Checkout</h1><CheckoutPageClient /></div>;
}

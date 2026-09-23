import type { Metadata } from 'next';
import { CartPageClient } from '@/components/commerce/CartPageClient';

export const metadata: Metadata = { title: 'Shopping Bag', robots: { index: false, follow: false } };

export default function CartPage() {
  return <div className="mx-auto max-w-7xl px-4 pb-24 pt-40 sm:px-6 lg:px-8"><h1 className="mb-10 font-serif text-4xl md:text-5xl">Your bag</h1><CartPageClient /></div>;
}

import type { Metadata } from 'next';
import { WishlistPageClient } from '@/components/commerce/WishlistPageClient';

export const metadata: Metadata = { title: 'Wishlist', robots: { index: false, follow: false } };

export default function WishlistPage() {
  return <div className="mx-auto max-w-7xl px-4 pb-24 pt-40 sm:px-6 lg:px-8"><h1 className="mb-10 font-serif text-4xl md:text-5xl">Your wishlist</h1><WishlistPageClient /></div>;
}

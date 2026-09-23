import type { Metadata } from 'next';
import { WishlistPageClient } from '@/components/commerce/WishlistPageClient';
import { getServerTranslations } from '@/lib/i18n-server';

export async function generateMetadata(): Promise<Metadata> { const { t } = await getServerTranslations(); return { title: t('meta.wishlistTitle'), robots: { index: false, follow: false } }; }

export default async function WishlistPage() {
  const { t } = await getServerTranslations();
  return <div className="mx-auto max-w-7xl px-4 pb-24 pt-40 sm:px-6 lg:px-8"><h1 className="mb-10 font-serif text-4xl md:text-5xl">{t('wishlist.heading')}</h1><WishlistPageClient /></div>;
}

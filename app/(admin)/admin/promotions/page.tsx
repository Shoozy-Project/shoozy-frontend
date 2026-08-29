import type { Metadata } from 'next';
import PromotionsClient from '@/components/admin/promotions/PromotionsClient';

export const metadata: Metadata = {
  title: 'Promotions Engine | Shoezy Admin',
  description: 'Manage Shoezy promotional discounts, coupons, hero banners, and announcement tickers.',
};

export default function AdminPromotionsPage() {
  return <PromotionsClient />;
}

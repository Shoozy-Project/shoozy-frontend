import type { Metadata } from 'next';
import PromotionsClient from '@/components/admin/promotions/PromotionsClient';

export const metadata: Metadata = {
  title: 'Discounts & Coupons | Shoezy Admin',
  description: 'Manage checkout discounts and coupon codes.',
};

export default function DiscountsPage() {
  return <PromotionsClient />;
}

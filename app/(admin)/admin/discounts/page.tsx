import PromotionsClient from '@/components/admin/promotions/PromotionsClient';
import { adminMetadata } from '@/lib/admin-metadata';

export const generateMetadata = () => adminMetadata('promotion.title', 'meta.adminDiscountsDescription');

export default function DiscountsPage() {
  return <PromotionsClient />;
}

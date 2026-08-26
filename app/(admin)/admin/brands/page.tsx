import type { Metadata } from 'next';
import BrandsClient from '@/components/admin/brands/BrandsClient';

export const metadata: Metadata = {
  title: 'Brands | Shoezy Admin',
  description: 'Manage Shoezy partner manufacturers, logos, websites, and catalog items.',
};

export default function AdminBrandsPage() {
  return <BrandsClient />;
}

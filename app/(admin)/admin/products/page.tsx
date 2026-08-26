import type { Metadata } from 'next';
import ProductsClient from '@/components/admin/products/ProductsClient';

export const metadata: Metadata = {
  title: 'Products Directory | Shoezy Admin',
  description: 'Manage Shoezy footwear product catalog, inventory stats, and variants.',
};

export default function AdminProductsPage() {
  return <ProductsClient />;
}

import ProductsClient from '@/components/admin/products/ProductsClient';
import { adminMetadata } from '@/lib/admin-metadata';

export const generateMetadata = () => adminMetadata('admin.productsCatalog', 'meta.adminProductsDescription');

export default function AdminProductsPage() {
  return <ProductsClient />;
}

import CategoriesClient from '@/components/admin/categories/CategoriesClient';
import { adminMetadata } from '@/lib/admin-metadata';

export const generateMetadata = () => adminMetadata('admin.productCategories', 'meta.adminCategoriesDescription');

export default function AdminCategoriesPage() {
  return <CategoriesClient />;
}

import type { Metadata } from 'next';
import CategoriesClient from '@/components/admin/categories/CategoriesClient';

export const metadata: Metadata = {
  title: 'Categories | Shoezy Admin',
  description: 'Manage Shoezy product categories — add, edit, reorder, and organize your shoe catalog.',
};

export default function AdminCategoriesPage() {
  return <CategoriesClient />;
}

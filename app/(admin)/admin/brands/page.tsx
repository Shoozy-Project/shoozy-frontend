import BrandsClient from '@/components/admin/brands/BrandsClient';
import { adminMetadata } from '@/lib/admin-metadata';

export const generateMetadata = () => adminMetadata('admin.brandsDirectory', 'meta.adminBrandsDescription');

export default function AdminBrandsPage() {
  return <BrandsClient />;
}

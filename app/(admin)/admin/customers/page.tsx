import UsersClient from '@/components/admin/users/UsersClient';
import { adminMetadata } from '@/lib/admin-metadata';

export const generateMetadata = () => adminMetadata('admin.customersTitle', 'meta.adminCustomersDescription');

export default function AdminCustomersPage() {
  return <UsersClient />;
}

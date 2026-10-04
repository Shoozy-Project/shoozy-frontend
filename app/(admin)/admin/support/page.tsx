import { AdminSupportInbox } from '@/components/admin/support/AdminSupportInbox';
import { adminMetadata } from '@/lib/admin-metadata';

export const generateMetadata = () => adminMetadata('admin.support', 'meta.supportDescription');

export default function AdminSupportPage() {
  return <AdminSupportInbox />;
}

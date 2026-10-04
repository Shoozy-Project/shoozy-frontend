import StoreSettingsClient from '@/components/admin/StoreSettingsClient';
import { adminMetadata } from '@/lib/admin-metadata';

export const generateMetadata = () => adminMetadata('admin.storeSettings', 'meta.adminSettingsDescription');

export default function AdminSettingsPage() {
  return <StoreSettingsClient />;
}

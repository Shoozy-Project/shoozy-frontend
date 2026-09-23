import type { Metadata } from 'next';
import StoreSettingsClient from '@/components/admin/StoreSettingsClient';

export const metadata: Metadata = {
  title: 'Settings | Shoezy Admin',
  description: 'Manage Shoezy store configuration settings.',
};

export default function AdminSettingsPage() {
  return <StoreSettingsClient />;
}

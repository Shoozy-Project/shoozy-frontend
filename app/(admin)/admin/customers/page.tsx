import type { Metadata } from 'next';
import UsersClient from '@/components/admin/users/UsersClient';

export const metadata: Metadata = {
  title: 'Customers | Shoezy Admin',
  description: 'Browse customer profiles and manage account status.',
};

export default function AdminCustomersPage() {
  return <UsersClient />;
}

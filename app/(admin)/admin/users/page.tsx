import type { Metadata } from 'next';
import UsersClient from '@/components/admin/users/UsersClient';

export const metadata: Metadata = {
  title: 'Users & Customers | Shoezy Admin',
  description: 'Browse registered customer profiles, view regions, change access roles, and deactivate accounts.',
};

export default function AdminUsersPage() {
  return <UsersClient />;
}

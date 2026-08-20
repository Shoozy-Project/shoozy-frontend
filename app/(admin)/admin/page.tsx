import type { Metadata } from 'next';
import AdminDashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Shoezy Admin Dashboard — manage your store.',
};

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}

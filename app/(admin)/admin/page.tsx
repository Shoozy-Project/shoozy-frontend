import AdminDashboardClient from './DashboardClient';
import { adminMetadata } from '@/lib/admin-metadata';

export const generateMetadata = () => adminMetadata('admin.dashboardTitle', 'meta.adminDashboardDescription');

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}

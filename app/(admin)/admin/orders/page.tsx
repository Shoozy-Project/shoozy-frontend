import OrdersClient from '@/components/admin/orders/OrdersClient';
import { adminMetadata } from '@/lib/admin-metadata';

export const generateMetadata = () => adminMetadata('admin.codOrders', 'meta.adminOrdersDescription');

export default function AdminOrdersPage() {
  return <OrdersClient />;
}

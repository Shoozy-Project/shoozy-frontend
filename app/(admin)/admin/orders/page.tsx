import type { Metadata } from 'next';
import OrdersClient from '@/components/admin/orders/OrdersClient';

export const metadata: Metadata = {
  title: 'Orders Management | Shoezy Admin',
  description: 'Manage Cash on Delivery (COD) orders, phone verification, and shipment lifecycle.',
};

export default function AdminOrdersPage() {
  return <OrdersClient />;
}

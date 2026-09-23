'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, DollarSign, Package, ShoppingCart, Users } from 'lucide-react';
import DashboardStats from '@/components/admin/DashboardStats';
import { useAuthStore } from '@/stores/auth-store';
import { useAdminCapability } from '@/lib/hooks/use-admin-capability';
import { OrderStatusBadge } from '@/components/admin/orders/OrderStatusBadge';
import { formatMinorMoney } from '@/lib/format-money';

export default function AdminDashboardClient() {
  const user = useAuthStore((state) => state.user);
  const summary = useAdminCapability(true, user?.id);
  if (summary.isPending) return <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-36 bg-gray-100 rounded-lg animate-pulse" />)}</div>;
  if (summary.isError) return <div className="p-8 bg-white border rounded-lg text-sm text-red-600">Dashboard data could not be loaded.</div>;

  const data = summary.data;
  const overview = data.overview;
  const stats = [
    { icon: <DollarSign className="w-5 h-5" />, label: 'Placed order value', value: formatMinorMoney(overview.orders.placedOrderValue.amountMinor, 'TND') },
    { icon: <ShoppingCart className="w-5 h-5" />, label: 'Orders', value: overview.orders.placedOrderValue.count.toLocaleString() },
    { icon: <Users className="w-5 h-5" />, label: 'Customers', value: overview.customers.total.toLocaleString() },
    { icon: <Package className="w-5 h-5" />, label: 'Active products', value: overview.products.active.toLocaleString() },
  ];

  return <div className="space-y-8 max-w-7xl mx-auto">
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}><h1 className="text-2xl font-bold text-black tracking-tight">Welcome back, {user?.firstName}</h1><p className="text-sm text-gray-500 mt-1">Live operational data from the Shoezy backend.</p></motion.div>
    <DashboardStats stats={stats} />
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border rounded-lg overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b"><h2 className="text-sm font-semibold">Recent Orders</h2><Link href="/admin/orders" className="flex items-center gap-1 text-xs text-[#FF8C00] hover:underline">View all <ArrowUpRight className="w-3.5 h-3.5" /></Link></div>
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b">{['Order', 'Items', 'Amount', 'Payment', 'Status', 'Placed'].map((heading) => <th key={heading} className="px-6 py-3 text-left text-[10px] font-semibold tracking-widest uppercase text-gray-500">{heading}</th>)}</tr></thead><tbody>
        {data.orders.items.length === 0 && <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">No recent orders.</td></tr>}
        {data.orders.items.map((order) => <tr key={order.id} className="border-b"><td className="px-6 py-4 font-mono text-xs text-[#FF8C00]">{order.orderNumber}</td><td className="px-6 py-4">{order.itemCount}</td><td className="px-6 py-4 font-semibold">{formatMinorMoney(order.totals.totalMinor, order.totals.currency)}</td><td className="px-6 py-4 text-xs">{order.paymentStatus}</td><td className="px-6 py-4"><OrderStatusBadge status={order.status} /></td><td className="px-6 py-4 text-xs text-gray-500">{new Date(order.placedAt).toLocaleString()}</td></tr>)}
      </tbody></table></div>
    </motion.div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{[
      { label: 'Add Product', desc: 'Create a complete product draft', href: '/admin/products/new' },
      { label: 'View Orders', desc: 'Manage supported order transitions', href: '/admin/orders' },
      { label: 'Customers', desc: 'Browse your customer base', href: '/admin/customers' },
    ].map((card) => <Link key={card.label} href={card.href} className="group block bg-white border rounded-lg p-5 hover:border-[#FF8C00]/40 transition-all"><p className="text-sm font-semibold group-hover:text-[#FF8C00]">{card.label}</p><p className="text-xs text-gray-500 mt-1">{card.desc}</p><ArrowUpRight className="w-4 h-4 text-gray-500 mt-3" /></Link>)}</div>
  </div>;
}

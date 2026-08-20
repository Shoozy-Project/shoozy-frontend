'use client';

import { motion } from 'framer-motion';
import {
  ShoppingCart,
  DollarSign,
  Users,
  Package,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
} from 'lucide-react';
import DashboardStats from '@/components/admin/DashboardStats';
import { useAuthStore } from '@/stores/auth-store';

// ── Mock Data ──────────────────────────────────────────────────
const stats = [
  {
    icon: <DollarSign className="w-5 h-5" />,
    label: 'Total Revenue',
    value: '$24,580',
    change: '+12.5%',
    positive: true,
  },
  {
    icon: <ShoppingCart className="w-5 h-5" />,
    label: 'Total Orders',
    value: '1,248',
    change: '+8.2%',
    positive: true,
  },
  {
    icon: <Users className="w-5 h-5" />,
    label: 'Customers',
    value: '3,842',
    change: '+5.1%',
    positive: true,
  },
  {
    icon: <Package className="w-5 h-5" />,
    label: 'Products',
    value: '364',
    change: '-2.4%',
    positive: false,
  },
];

const recentOrders = [
  { id: '#SHZ-1042', customer: 'Amira Ben Ali', product: 'Air Monarch IV', amount: '$189', status: 'delivered', date: '2 hours ago' },
  { id: '#SHZ-1041', customer: 'Yassine Mrad', product: 'Urban Leather Boot', amount: '$245', status: 'processing', date: '5 hours ago' },
  { id: '#SHZ-1040', customer: 'Sana Karoui', product: 'Slim Runner Pro', amount: '$129', status: 'shipped', date: '8 hours ago' },
  { id: '#SHZ-1039', customer: 'Mohamed Khalil', product: 'Classic Oxford', amount: '$310', status: 'delivered', date: '1 day ago' },
  { id: '#SHZ-1038', customer: 'Ines Trabelsi', product: 'Street Flex 2.0', amount: '$98', status: 'cancelled', date: '1 day ago' },
];

const statusConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  delivered:   { label: 'Delivered',   icon: <CheckCircle2 className="w-3.5 h-3.5" />, className: 'bg-green-50 text-green-700 border-green-200' },
  processing:  { label: 'Processing',  icon: <Clock className="w-3.5 h-3.5" />,         className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  shipped:     { label: 'Shipped',     icon: <Truck className="w-3.5 h-3.5" />,          className: 'bg-blue-50 text-blue-700 border-blue-200' },
  cancelled:   { label: 'Cancelled',   icon: <XCircle className="w-3.5 h-3.5" />,        className: 'bg-red-50 text-red-700 border-red-200' },
};

export default function AdminDashboardClient() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-black tracking-tight">
          Welcome back, {user?.firstName} 👋
        </h1>
        <p className="text-sm text-[#6b7280] mt-1">
          Here's what's happening with your store today.
        </p>
      </motion.div>

      {/* Stat Cards */}
      <DashboardStats stats={stats} />

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="bg-white border border-[#e5e5e5] rounded-lg overflow-hidden shadow-sm"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e5e5]">
          <h2 className="text-sm font-semibold text-black tracking-wide">Recent Orders</h2>
          <a
            href="/admin/orders"
            className="flex items-center gap-1 text-xs text-[#FF8C00] hover:underline font-medium"
          >
            View all <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e5e5]">
                {['Order ID', 'Customer', 'Product', 'Amount', 'Status', 'Date'].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-[10px] font-semibold tracking-widest uppercase text-[#6b7280]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, i) => {
                const s = statusConfig[order.status];
                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.06 }}
                    className="border-b border-[#f7f7f7] hover:bg-[#f9f9f9] transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-[#FF8C00]">{order.id}</td>
                    <td className="px-6 py-4 text-black font-medium">{order.customer}</td>
                    <td className="px-6 py-4 text-[#6b7280]">{order.product}</td>
                    <td className="px-6 py-4 text-black font-semibold">{order.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${s.className}`}>
                        {s.icon}
                        {s.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#6b7280]">{order.date}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Quick action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Add Product', desc: 'List a new shoe to the catalog', href: '/admin/products/new', color: 'hover:bg-[#fff3e0]' },
          { label: 'View Orders', desc: 'Manage and fulfill pending orders', href: '/admin/orders', color: 'hover:bg-blue-50/50' },
          { label: 'Customers', desc: 'Browse your customer base', href: '/admin/customers', color: 'hover:bg-green-50/50' },
        ].map((card, i) => (
          <motion.a
            key={card.label}
            href={card.href}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.08 }}
            className={`group block bg-white border border-[#e5e5e5] rounded-lg p-5 ${card.color} hover:border-[#FF8C00]/40 transition-all duration-200 shadow-sm`}
          >
            <p className="text-sm font-semibold text-black group-hover:text-[#FF8C00] transition-colors">{card.label}</p>
            <p className="text-xs text-[#6b7280] mt-1 leading-relaxed">{card.desc}</p>
            <ArrowUpRight className="w-4 h-4 text-[#6b7280] group-hover:text-[#FF8C00] mt-3 transition-colors" />
          </motion.a>
        ))}
      </div>
    </div>
  );
}

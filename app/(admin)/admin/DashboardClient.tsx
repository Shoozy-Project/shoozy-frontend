'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, DollarSign, Package, ShoppingCart, Users } from 'lucide-react';
import DashboardStats from '@/components/admin/DashboardStats';
import { useAuthStore } from '@/stores/auth-store';
import { useAdminCapability } from '@/lib/hooks/use-admin-capability';
import { OrderStatusBadge } from '@/components/admin/orders/OrderStatusBadge';
import { formatMinorMoney } from '@/lib/format-money';
import { useTranslations } from '@/lib/hooks/use-translations';

export default function AdminDashboardClient() {
  const { locale, t } = useTranslations();
  const user = useAuthStore((state) => state.user);
  const summary = useAdminCapability(true, user?.id);
  if (summary.isPending) return <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-36 bg-gray-100 rounded-lg animate-pulse" />)}</div>;
  if (summary.isError) return <div className="p-8 bg-white border rounded-lg text-sm text-red-600">{t('admin.dashboardLoadError')}</div>;

  const data = summary.data;
  const overview = data.overview;
  const stats = [
    { icon: <DollarSign className="w-5 h-5" />, label: t('admin.placedOrderValue'), value: formatMinorMoney(overview.orders.placedOrderValue.amountMinor, 'TND', undefined, locale) },
    { icon: <ShoppingCart className="w-5 h-5" />, label: t('admin.orderCountLabel'), value: overview.orders.placedOrderValue.count.toLocaleString(locale) },
    { icon: <Users className="w-5 h-5" />, label: t('admin.customerCountLabel'), value: overview.customers.total.toLocaleString(locale) },
    { icon: <Package className="w-5 h-5" />, label: t('admin.activeProducts'), value: overview.products.active.toLocaleString(locale) },
  ];

  const headings = ['admin.tableOrder', 'admin.tableItems', 'admin.tableAmount', 'admin.tablePayment', 'admin.tableStatus', 'admin.tablePlaced'];

  return <div className="space-y-8 max-w-7xl mx-auto">
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}><h1 className="text-2xl font-bold text-black tracking-tight">{t('admin.welcomeBack', { name: user?.firstName ?? '' })}</h1><p className="text-sm text-gray-500 mt-1">{t('admin.liveData')}</p></motion.div>
    <DashboardStats stats={stats} />
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border rounded-lg overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b"><h2 className="text-sm font-semibold">{t('admin.recentOrders')}</h2><Link href="/admin/orders" className="flex items-center gap-1 text-xs text-[#FF8C00] hover:underline">{t('admin.viewAll')} <ArrowUpRight className="w-3.5 h-3.5 rtl:rotate-180" /></Link></div>
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b">{headings.map((heading) => <th key={heading} className="px-6 py-3 text-start text-[10px] font-semibold tracking-widest uppercase text-gray-500">{t(heading)}</th>)}</tr></thead><tbody>
        {data.orders.items.length === 0 && <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">{t('admin.noRecentOrders')}</td></tr>}
        {data.orders.items.map((order) => <tr key={order.id} className="border-b"><td className="px-6 py-4 font-mono text-xs text-[#FF8C00]">{order.orderNumber}</td><td className="px-6 py-4">{order.itemCount}</td><td className="px-6 py-4 font-semibold">{formatMinorMoney(order.totals.totalMinor, order.totals.currency, undefined, locale)}</td><td className="px-6 py-4 text-xs">{t(`status.${order.paymentStatus}`)}</td><td className="px-6 py-4"><OrderStatusBadge status={order.status} /></td><td className="px-6 py-4 text-xs text-gray-500">{new Date(order.placedAt).toLocaleString(locale)}</td></tr>)}
      </tbody></table></div>
    </motion.div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{[
      { label: t('admin.addProduct'), desc: t('admin.addProductCopy'), href: '/admin/products/new' },
      { label: t('admin.viewOrders'), desc: t('admin.viewOrdersCopy'), href: '/admin/orders' },
      { label: t('admin.customersTitle'), desc: t('admin.customersCopy'), href: '/admin/customers' },
    ].map((card) => <Link key={card.label} href={card.href} className="group block bg-white border rounded-lg p-5 hover:border-[#FF8C00]/40 transition-all"><p className="text-sm font-semibold group-hover:text-[#FF8C00]">{card.label}</p><p className="text-xs text-gray-500 mt-1">{card.desc}</p><ArrowUpRight className="w-4 h-4 text-gray-500 mt-3 rtl:rotate-180" /></Link>)}</div>
  </div>;
}

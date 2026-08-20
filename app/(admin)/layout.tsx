'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  Grid,
  Award,
  Layers,
  Tag,
  Star,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { authApi } from '@/lib/api/auth';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Categories', href: '/admin/categories', icon: Grid },
  { label: 'Brands', href: '/admin/brands', icon: Award },
  { label: 'Collections', href: '/admin/collections', icon: Layers },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Promotions', href: '/admin/promotions', icon: Tag },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const isLoading = useAuthStore((s) => s.isLoading);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Guard: redirect non-admins ONLY once auth is fully resolved (initialized + not loading)
  useEffect(() => {
    if (!isInitialized || isLoading) return;
    if (!user || user.role !== 'ADMIN') {
      router.replace('/login');
    }
  }, [isInitialized, isLoading, user, router]);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await authApi.logout();
    } catch {
      // Clear state even if request fails
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  // Don't render until auth is fully resolved
  if (!isInitialized || isLoading || !user || user.role !== 'ADMIN') {
    return null;
  }

  const currentPage = navItems.find(
    (n) => pathname === n.href || (n.href !== '/admin' && pathname.startsWith(n.href))
  )?.label ?? 'Admin';

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-black flex">

      {/* ── Sidebar (desktop) ─────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#e5e5e5] fixed inset-y-0 left-0 z-40">
        {/* Logo */}
        <div className="flex items-center px-6 h-16 border-b border-[#e5e5e5]">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="relative w-[90px] h-[36px]">
              <Image
                src="/logo.png"
                alt="Shoezy"
                fill
                sizes="90px"
                className="object-contain"
              />
            </div>
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#FF8C00] border border-[#FF8C00]/40 px-1.5 py-0.5 rounded-sm">
              Admin
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-0.5" aria-label="Admin navigation">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                  active
                    ? 'bg-[#FF8C00]/10 text-[#FF8C00]'
                    : 'text-[#374151] hover:text-black hover:bg-[#f7f7f7]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    active ? 'text-[#FF8C00]' : 'text-[#6b7280] group-hover:text-black'
                  }`}
                />
                {label}
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#FF8C00]" />}
              </Link>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div className="px-3 pb-6 space-y-1 border-t border-[#e5e5e5] pt-4">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-[#FF8C00] flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-black truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-[#6b7280] truncate">{user.email}</p>
            </div>
          </div>
          <button
            id="admin-logout-btn"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#6b7280] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-all duration-150 disabled:opacity-50"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {loggingOut ? 'Signing out…' : 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* ── Mobile sidebar overlay ─────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-30 bg-black/30 lg:hidden"
            />
            <motion.aside
              key="mobile-sidebar"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#e5e5e5] flex flex-col lg:hidden"
            >
              {/* Logo */}
              <div className="flex items-center justify-between px-6 h-16 border-b border-[#e5e5e5]">
                <Link href="/admin" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
                  <div className="relative w-[80px] h-[32px]">
                    <Image src="/logo.png" alt="Shoezy" fill sizes="80px" className="object-contain" />
                  </div>
                  <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#FF8C00] border border-[#FF8C00]/40 px-1.5 py-0.5 rounded-sm">Admin</span>
                </Link>
                <button onClick={() => setSidebarOpen(false)} className="text-[#6b7280] hover:text-black p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nav */}
              <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-0.5">
                {navItems.map(({ label, href, icon: Icon }) => {
                  const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                        active
                          ? 'bg-[#FF8C00]/10 text-[#FF8C00]'
                          : 'text-[#374151] hover:text-black hover:bg-[#f7f7f7]'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {label}
                    </Link>
                  );
                })}
              </nav>

              {/* User */}
              <div className="px-3 pb-6 border-t border-[#e5e5e5] pt-4 space-y-1">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-[#FF8C00] flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-black truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-[#6b7280] truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-[#6b7280] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-all disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  {loggingOut ? 'Signing out…' : 'Sign Out'}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content area ─────────────────────────── */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen">

        {/* ── Admin Top Bar ─────────────────────────────
            Completely separate from the customer Header.
            Shows: hamburger (mobile) | page title | notifications | admin avatar
        ────────────────────────────────────────────── */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 h-16 bg-white border-b border-[#e5e5e5]">
          {/* Mobile: hamburger */}
          <button
            id="admin-mobile-menu-toggle"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-[#374151] hover:text-black transition-colors"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile: page title */}
          <span className="lg:hidden text-sm font-semibold text-black">{currentPage}</span>

          {/* Desktop: breadcrumb */}
          <div className="hidden lg:flex items-center gap-2 text-sm">
            <span className="text-[#6b7280]">Shoezy</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#9ca3af]" />
            <span className="text-black font-semibold">{currentPage}</span>
          </div>

          {/* Right: notifications + avatar */}
          <div className="flex items-center gap-4">
            {/* Notification bell */}
            <button
              id="admin-notifications-btn"
              aria-label="Notifications"
              className="relative p-1.5 text-[#374151] hover:text-black transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#FF8C00] text-white text-[10px] font-bold flex items-center justify-center leading-none">
                3
              </span>
            </button>

            {/* Admin info + avatar */}
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-black leading-none">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-[#6b7280] mt-0.5">Administrator</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#FF8C00] flex items-center justify-center text-sm font-bold text-white">
                {user.firstName[0]}{user.lastName[0]}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

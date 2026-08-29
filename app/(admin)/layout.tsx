'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronRight, Bell, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import { authApi } from '@/lib/api/auth';
import { productsApi } from '@/lib/api/products';
import { categoriesApi } from '@/lib/api/categories';
import { brandsApi } from '@/lib/api/brands';
import { collectionsApi } from '@/lib/api/collections';
import { adminUsersApi } from '@/lib/api/users';

import Sidebar, { navItems } from '@/components/admin/Sidebar';
import MobileNav from '@/components/admin/MobileNav';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const isLoading = useAuthStore((s) => s.isLoading);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [loggingOut, setLoggingOut] = useState(false);

  const handlePrefetch = (href: string) => {
    if (href === '/admin/products') {
      queryClient.prefetchQuery({
        queryKey: ['products', { page: 1, limit: 10 }],
        queryFn: () => productsApi.list({ page: 1, limit: 10 }).then((r) => r.data.data),
      });
    } else if (href === '/admin/categories') {
      queryClient.prefetchQuery({
        queryKey: ['categories', { page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' }],
        queryFn: () => categoriesApi.list({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' }).then((r) => r.data.data),
      });
    } else if (href === '/admin/brands') {
      queryClient.prefetchQuery({
        queryKey: ['brands', { page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' }],
        queryFn: () => brandsApi.list({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' }).then((r) => r.data.data),
      });
    } else if (href === '/admin/collections') {
      queryClient.prefetchQuery({
        queryKey: ['collections', { page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' }],
        queryFn: () => collectionsApi.list({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' }).then((r) => r.data.data),
      });
    } else if (href === '/admin/users') {
      queryClient.prefetchQuery({
        queryKey: ['users', { page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' }],
        queryFn: () => adminUsersApi.list({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' }).then((r) => r.data.data),
      });
    }
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAdminOrSuper = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  // Guard 1: redirect non-admin users to login
  useEffect(() => {
    if (!isInitialized || isLoading) return;
    if (!user || !isAdminOrSuper) {
      router.replace('/login');
    }
  }, [isInitialized, isLoading, user, isAdminOrSuper, router]);

  // Guard 2: intercept operational ADMIN users attempting to access /admin/users or /admin/settings
  useEffect(() => {
    if (!isInitialized || isLoading || !user) return;
    if (
      user.role === 'ADMIN' &&
      (pathname.startsWith('/admin/users') || pathname.startsWith('/admin/settings'))
    ) {
      router.replace('/admin');
    }
  }, [isInitialized, isLoading, user, pathname, router]);

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
  if (!isInitialized || isLoading || !user || !isAdminOrSuper) {
    return null;
  }

  const currentPage =
    navItems.find(
      (n) => pathname === n.href || (n.href !== '/admin' && pathname.startsWith(n.href))
    )?.label ?? 'Admin Dashboard';

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-gray-900 flex flex-col lg:flex-row antialiased">
      {/* ── Desktop Left Sidebar ───────────────────────────────────── */}
      <Sidebar
        user={user}
        isSuperAdmin={isSuperAdmin}
        onLogout={handleLogout}
        loggingOut={loggingOut}
        onPrefetch={handlePrefetch}
      />

      {/* ── Mobile Top Header & Navigation Drawer ─────────────────── */}
      <MobileNav
        user={user}
        isSuperAdmin={isSuperAdmin}
        currentPage={currentPage}
        onLogout={handleLogout}
        loggingOut={loggingOut}
        onPrefetch={handlePrefetch}
      />

      {/* ── Main Content Area ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen">
        {/* Desktop Premium Glassmorphism Header */}
        <header className="hidden lg:flex items-center justify-between px-8 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 shadow-2xs">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400 font-medium">Shoezy Admin</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-gray-900 font-bold tracking-tight">{currentPage}</span>
          </div>

          {/* Right Header Action Items */}
          <div className="flex items-center gap-4">
            {/* Storefront External Button */}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-600 hover:text-[#FF8C00] bg-gray-100/80 hover:bg-orange-50/80 border border-gray-200/60 hover:border-[#FF8C00]/30 transition-all duration-200"
              title="Open Live Shoezy Store"
            >
              <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
              <span>View Store</span>
            </Link>

            {/* Notification Bell with Indicator Badge */}
            <button
              id="admin-notifications-btn"
              aria-label="Notifications"
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-xl transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF8C00] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF8C00]" />
              </span>
            </button>

            <div className="h-5 w-px bg-gray-200" />

            {/* Super Admin / Admin User Pill */}
            <div className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full bg-gray-50/80 border border-gray-100 shadow-2xs">
              <div className="text-right leading-none">
                <p className="text-xs font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[10px] font-semibold text-[#FF8C00] mt-0.5 flex items-center justify-end gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  {isSuperAdmin ? 'SUPER ADMIN' : 'ADMIN'}
                </p>
              </div>

              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF8C00] to-amber-500 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Route Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

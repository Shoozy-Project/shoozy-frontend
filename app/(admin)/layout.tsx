'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronRight, ExternalLink, Sparkles } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import { authApi } from '@/lib/api/auth';
import { productsApi } from '@/lib/api/products';
import { categoriesApi } from '@/lib/api/categories';
import { brandsApi } from '@/lib/api/brands';
import { collectionsApi } from '@/lib/api/collections';
import { adminCustomersApi } from '@/lib/api/users';
import { useAdminCapability } from '@/lib/hooks/use-admin-capability';
import { isAxiosError } from 'axios';

import Sidebar, { navItems } from '@/components/admin/Sidebar';
import MobileNav from '@/components/admin/MobileNav';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { notificationKeys } from '@/lib/hooks/use-notifications';
import { useTranslations } from '@/lib/hooks/use-translations';

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
  const { t } = useTranslations();
  const capability = useAdminCapability(isInitialized && !isLoading && !!user, user?.id);
  const capabilityStatus = isAxiosError(capability.error) ? capability.error.response?.status : undefined;

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
    } else if (href === '/admin/customers') {
      queryClient.prefetchQuery({
        queryKey: ['customers', { page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' }],
        queryFn: () => adminCustomersApi.list({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' }).then((r) => r.data.data),
      });
    }
  };

  useEffect(() => {
    if (!isInitialized || isLoading) return;
    if (!user) {
      router.replace('/login');
    }
  }, [isInitialized, isLoading, user, router]);

  useEffect(() => {
    if (!capability.isError) return;
    const status = isAxiosError(capability.error) ? capability.error.response?.status : undefined;
    if (status === 401) {
      clearAuth();
      router.replace('/login');
    } else if (status === 403) {
      router.replace('/');
    }
  }, [capability.isError, capability.error, clearAuth, router]);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await authApi.logout();
    } catch {
      // Clear state even if request fails
    } finally {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });
      clearAuth();
      queryClient.removeQueries({ queryKey: notificationKeys.all });
      router.push('/login');
    }
  };

  // Don't render until auth is fully resolved
  if (!isInitialized || isLoading || !user || capability.isPending) {
    return null;
  }
  if (capability.isError) {
    if (capabilityStatus === 401 || capabilityStatus === 403) return null;
    return (
      <div className="min-h-screen grid place-items-center bg-background p-6">
        <div className="max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-foreground">{t('admin.accessUnavailable')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('admin.accessUnavailableCopy')}</p>
          <button type="button" onClick={() => capability.refetch()} className="mt-5 rounded-lg bg-[#FF8C00] px-4 py-2 text-sm font-semibold text-white hover:bg-[#e67e00]">{t('common.retry')}</button>
        </div>
      </div>
    );
  }

  const currentPage =
    navItems.find(
      (n) => pathname === n.href || (n.href !== '/admin' && pathname.startsWith(n.href))
    )?.labelKey ?? 'admin.dashboardTitle';
  const currentPageLabel = t(currentPage);

  return (
    <div className="admin-theme min-h-screen bg-background text-foreground flex flex-col lg:flex-row antialiased">
      {/* ── Desktop Left Sidebar ───────────────────────────────────── */}
      <Sidebar
        user={user}
        onLogout={handleLogout}
        loggingOut={loggingOut}
        onPrefetch={handlePrefetch}
      />

      {/* ── Mobile Top Header & Navigation Drawer ─────────────────── */}
      <MobileNav
        user={user}
        currentPage={currentPageLabel}
        onLogout={handleLogout}
        loggingOut={loggingOut}
        onPrefetch={handlePrefetch}
      />

      {/* ── Main Content Area ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:ms-64 min-h-screen">
        {/* Desktop Premium Glassmorphism Header */}
        <header className="hidden lg:flex items-center justify-between px-8 h-16 bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-30 shadow-2xs">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400 font-medium">Shoozy · {t('admin.dashboardTitle')}</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 rtl:rotate-180" />
            <span className="text-gray-900 font-bold tracking-tight">{currentPageLabel}</span>
          </div>

          {/* Right Header Action Items */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeToggle />
            {/* Storefront External Button */}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-600 hover:text-[#FF8C00] bg-gray-100/80 hover:bg-orange-50/80 border border-gray-200/60 hover:border-[#FF8C00]/30 transition-all duration-200"
              title={t('admin.openStore')}
            >
              <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
              <span>{t('admin.viewStore')}</span>
            </Link>

            <NotificationCenter admin compact />

            <div className="h-5 w-px bg-gray-200" />

            {/* Admin User Pill */}
            <div className="flex items-center gap-2.5 p-1.5 ps-3 rounded-full bg-gray-50/80 border border-gray-100 shadow-2xs">
              <div className="text-end leading-none">
                <p className="text-xs font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[10px] font-semibold text-[#FF8C00] mt-0.5 flex items-center justify-end gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  {t('admin.administrator')}
                </p>
              </div>

              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF8C00] to-amber-500 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </div>
                <span className="absolute bottom-0 end-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
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

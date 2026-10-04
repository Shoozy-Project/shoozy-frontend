'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Grid,
  Award,
  Layers,
  Tag,
  Star,
  ShieldCheck,
  Sparkles,
  Bell,
  MessageCircle,
  PanelsTopLeft,
  type LucideIcon,
} from 'lucide-react';
import { useTranslations } from '@/lib/hooks/use-translations';

export interface NavItem {
  labelKey: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

export interface NavGroup {
  groupLabelKey: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    groupLabelKey: 'admin.core',
    items: [{ labelKey: 'admin.dashboard', href: '/admin', icon: LayoutDashboard }],
  },
  {
    groupLabelKey: 'admin.commerce',
    items: [
      { labelKey: 'admin.products', href: '/admin/products', icon: Package },
      { labelKey: 'admin.categories', href: '/admin/categories', icon: Grid },
      { labelKey: 'admin.brands', href: '/admin/brands', icon: Award },
      { labelKey: 'admin.collections', href: '/admin/collections', icon: Layers },
      { labelKey: 'admin.orders', href: '/admin/orders', icon: ShoppingCart },
    ],
  },
  {
    groupLabelKey: 'admin.marketing',
    items: [
      { labelKey: 'admin.homepage', href: '/admin/homepage', icon: PanelsTopLeft },
      { labelKey: 'admin.discounts', href: '/admin/discounts', icon: Tag },
      { labelKey: 'admin.reviews', href: '/admin/reviews', icon: Star },
    ],
  },
  {
    groupLabelKey: 'admin.system',
    items: [
      { labelKey: 'admin.notifications', href: '/admin/notifications', icon: Bell },
      { labelKey: 'admin.support', href: '/admin/support', icon: MessageCircle },
      { labelKey: 'admin.customers', href: '/admin/customers', icon: Users },
      { labelKey: 'admin.settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

// Flat nav items list for fallback lookups
export const navItems: NavItem[] = navGroups.flatMap((g) => g.items);

interface SidebarProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  onLogout: () => void;
  loggingOut: boolean;
  onPrefetch?: (href: string) => void;
}

export default function Sidebar({
  user,
  onLogout,
  loggingOut,
  onPrefetch,
}: SidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslations();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-e border-gray-100 fixed inset-y-0 start-0 z-40 shadow-xs">
      {/* ── Brand Logo & Role Badge ── */}
      <div className="flex items-center justify-between px-6 h-16 border-b border-gray-100 bg-white/50 backdrop-blur-xs">
        <Link href="/admin" prefetch={true} className="flex items-center gap-2.5 group">
          <div className="relative w-[90px] h-[34px]">
            <Image
              src="/logo.png"
              alt="Shoozy Admin"
              fill
              sizes="90px"
              className="object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </div>
        </Link>
        <span
          className="inline-flex items-center gap-1 text-[9px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded-full border shadow-xs text-[#FF8C00] bg-orange-50 border-[#FF8C00]/30"
        >
          <Sparkles className="w-2.5 h-2.5 text-[#FF8C00]" />
          {t('admin.administrator')}
        </span>
      </div>

      {/* ── Navigation List with Group Headers ── */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6 custom-scrollbar" aria-label={t('admin.sidebarNavigation')}>
        {navGroups.map((group) => {
          const visibleItems = group.items;

          if (visibleItems.length === 0) return null;

          return (
            <div key={group.groupLabelKey} className="space-y-1">
              <p className="px-3 text-[10px] font-extrabold tracking-[0.2em] text-gray-400 uppercase mb-2">
                {t(group.groupLabelKey)}
              </p>
              {visibleItems.map(({ labelKey, href, icon: Icon }) => {
                const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));

                return (
                  <Link
                    key={href}
                    href={href}
                    prefetch={true}
                    onMouseEnter={() => onPrefetch?.(href)}
                    className={`flex items-center gap-3 px-3 py-2.25 rounded-xl text-xs font-semibold transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-50 via-orange-50/80 to-transparent text-[#FF8C00] font-bold border-s-3 border-[#FF8C00] ps-2.5 shadow-2xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-[#FF8C00]' : 'text-gray-400 group-hover:text-gray-700'
                      }`}
                    />
                    <span className="truncate">{t(labelKey)}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* ── Admin User Card & Logout Footer ── */}
      <div className="p-3 border-t border-gray-100 bg-gray-50/40 space-y-2">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-gray-100 shadow-2xs">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF8C00] to-amber-500 flex items-center justify-center text-xs font-bold text-white shadow-xs">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            {/* Online status indicator */}
            <span className="absolute bottom-0 end-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-gray-900 truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-[10px] font-medium text-gray-400 truncate flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#FF8C00]" />
              {t('admin.administrator')}
            </p>
          </div>
        </div>

        <button
          id="admin-sidebar-logout-btn"
          onClick={onLogout}
          disabled={loggingOut}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-red-50/80 border border-transparent hover:border-red-100 transition-all duration-150 disabled:opacity-50 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{loggingOut ? t('admin.signingOut') : t('admin.signOut')}</span>
        </button>
      </div>
    </aside>
  );
}

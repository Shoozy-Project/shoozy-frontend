'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, Bell, ChevronRight } from 'lucide-react';
import { navItems } from './Sidebar';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

interface MobileNavProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  currentPage: string;
  onLogout: () => void;
  loggingOut: boolean;
  onPrefetch?: (href: string) => void;
}

export default function MobileNav({
  user,
  currentPage,
  onLogout,
  loggingOut,
  onPrefetch,
}: MobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const visibleNavItems = navItems;

  return (
    <>
      {/* ── Sticky Mobile Top Header Bar ───────────────────────────────── */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 h-16 bg-card border-b border-border shadow-xs">
        {/* Left: Hamburger trigger */}
        <button
          id="admin-mobile-menu-toggle"
          onClick={() => setOpen(true)}
          className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
          aria-label="Open mobile navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Center: Store Logo + Page Title */}
        <div className="flex items-center gap-2">
          <Link href="/admin" prefetch={true} className="flex items-center gap-2">
            <div className="relative w-[70px] h-[28px]">
              <Image src="/logo.png" alt="Shoezy" fill sizes="70px" className="object-contain" />
            </div>
          </Link>
          <span className="text-gray-300 font-light">|</span>
          <span className="text-xs font-semibold text-gray-900 truncate max-w-[120px] sm:max-w-[200px]">
            {currentPage}
          </span>
        </div>

        {/* Right: Notifications + User Avatar */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            id="admin-mobile-notifications-btn"
            aria-label="Notifications"
            className="relative p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-[#FF8C00] text-white text-[10px] font-bold flex items-center justify-center">
              3
            </span>
          </button>

          <div className="w-8 h-8 rounded-full bg-[#FF8C00] flex items-center justify-center text-xs font-bold text-white shadow-xs">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
        </div>
      </header>

      {/* ── Slide-Over Mobile Drawer Sheet ────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
              aria-hidden="true"
            />

            {/* Slide-in Drawer Container */}
            <motion.aside
              key="mobile-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-card border-r border-border flex flex-col lg:hidden shadow-2xl"
              aria-label="Mobile Navigation Drawer"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 h-16 border-b border-border">
                <Link
                  href="/admin"
                  prefetch={true}
                  className="flex items-center gap-2.5"
                  onClick={() => setOpen(false)}
                >
                  <div className="relative w-[80px] h-[32px]">
                    <Image src="/logo.png" alt="Shoezy" fill sizes="80px" className="object-contain" />
                  </div>
                  <span
                    className="text-[9px] font-semibold tracking-[0.15em] uppercase px-1.5 py-0.5 rounded-sm border text-[#FF8C00] bg-orange-50/50 border-[#FF8C00]/40"
                  >
                    Admin
                  </span>
                </Link>

                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Navigation items */}
              <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
                {visibleNavItems.map(({ label, href, icon: Icon }) => {
                  const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));

                  return (
                    <Link
                      key={href}
                      href={href}
                      prefetch={true}
                      onMouseEnter={() => onPrefetch?.(href)}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-[#FF8C00]/10 text-[#FF8C00] font-semibold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-[#FF8C00]' : 'text-muted-foreground'
                        }`}
                      />
                      <span>{label}</span>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#FF8C00]" />}
                    </Link>
                  );
                })}
              </nav>

              {/* User Profile & Logout Section */}
              <div className="px-3 pb-6 border-t border-border pt-4 space-y-2">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-9 h-9 rounded-full bg-[#FF8C00] flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-black truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  disabled={loggingOut}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>{loggingOut ? 'Signing out…' : 'Sign Out'}</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

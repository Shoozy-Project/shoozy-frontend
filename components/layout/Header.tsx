'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, User, Search, Menu, X, LogOut, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';
import { authApi } from '@/lib/api/auth';

const navLinks = [
  { label: 'Men', href: '/men' },
  { label: 'Women', href: '/women' },
  { label: 'New Arrivals', href: '/new-arrivals' },
  { label: 'Collections', href: '/collections' },
  { label: 'Sale', href: '/sale' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await authApi.logout();
    } catch {
      // Even if the API call fails, clear local state
    } finally {
      clearAuth();
      setLoggingOut(false);
      router.push('/');
    }
  };

  // ── Determine right-side account element ──────────────────────
  const AccountElement = () => {
    if (user?.role === 'CUSTOMER') {
      return (
        <button
          id="header-logout-btn"
          aria-label="Logout"
          onClick={handleLogout}
          disabled={loggingOut}
          title="Sign out of Shoezy"
          className="p-1.5 text-[var(--text-secondary)] hover:text-[#dc2626] transition-colors disabled:opacity-50 relative group"
        >
          <LogOut className="w-5 h-5" />
          {/* Tooltip */}
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] bg-[var(--text-primary)] text-[var(--surface-primary)] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Sign out
          </span>
        </button>
      );
    }

    if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
      return (
        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            id="header-admin-dashboard-btn"
            aria-label="Admin Dashboard"
            title="Go to Admin Dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFF3E0] text-[#FF8C00] hover:bg-[#ffe6c7] font-semibold text-xs transition-colors border border-[#FF8C00]/30"
          >
            <User className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
          <button
            id="header-logout-btn"
            aria-label="Logout"
            onClick={handleLogout}
            disabled={loggingOut}
            title="Sign out of Shoezy"
            className="p-1.5 text-[var(--text-secondary)] hover:text-[#dc2626] transition-colors disabled:opacity-50 relative group"
          >
            <LogOut className="w-5 h-5" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] bg-[var(--text-primary)] text-[var(--surface-primary)] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Sign out
            </span>
          </button>
        </div>
      );
    }

    // Not logged in — guest visitor
    return (
      <Link
        href="/login"
        id="header-account-btn"
        aria-label="Sign In"
        title="Sign in to your account"
        className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors relative group"
      >
        <User className="w-5 h-5" />
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] bg-[var(--text-primary)] text-[var(--surface-primary)] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Sign in
        </span>
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-[var(--surface-primary)] border-b border-[var(--border-primary)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* ── Left: Nav Links (desktop) ── */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Primary navigation">
            {navLinks.slice(0, 3).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-medium tracking-widest uppercase text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ── Mobile: Hamburger ── */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* ── Center: Logo ── */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <div className="relative h-10 lg:h-14 w-[100px] lg:w-[120px]">
              <Image
                src="/logo.png"
                alt="Shoezy — Quality Shoes. Every Step."
                fill
                sizes="120px"
                priority
                className={`object-contain ${theme === 'dark' ? 'invert' : ''}`}
              />
            </div>
          </Link>

          {/* ── Right: Nav Links (desktop) + Icons ── */}
          <div className="flex items-center gap-6">
            <nav className="hidden lg:flex items-center gap-8" aria-label="Secondary navigation">
              {navLinks.slice(3).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs font-medium tracking-widest uppercase text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Icon cluster */}
            <div className="flex items-center gap-3">
              <button
                id="header-search-btn"
                aria-label="Search"
                className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Dark mode toggle */}
              <button
                id="header-theme-toggle"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                onClick={toggleTheme}
                className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--color-gold)] transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <AccountElement />

              <Link
                href="/cart"
                id="header-cart-btn"
                aria-label="Shopping bag"
                className="relative p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                {/* Cart badge placeholder */}
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#FF8C00] text-white text-[10px] font-semibold flex items-center justify-center leading-none">
                  0
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="lg:hidden overflow-hidden border-t border-[var(--border-primary)] bg-[var(--surface-primary)]"
          >
            <nav className="flex flex-col py-4 px-6 gap-1" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="py-3 text-sm font-medium tracking-widest uppercase text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-b border-[var(--border-secondary)] last:border-0 transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              {user?.role === 'CUSTOMER' ? (
                <button
                  onClick={() => { setMenuOpen(false); handleLogout(); }}
                  className="py-3 text-left text-sm font-medium tracking-widest uppercase text-[#dc2626] hover:text-[var(--text-primary)] transition-colors"
                >
                  Sign Out
                </button>
              ) : user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="py-3 text-sm font-medium tracking-widest uppercase text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="py-3 text-sm font-medium tracking-widest uppercase text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Sign In
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

'use client';

import { FormEvent, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from 'framer-motion';
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
  LogOut,
  Settings,
  Package,
  Sparkles,
  Phone,
} from 'lucide-react';
import { useCurrentCart } from '@/lib/hooks/use-commerce';
import { selectIsAuthenticated, selectUser, useAuthStore } from '@/stores/auth-store';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { useTranslations } from '@/lib/hooks/use-translations';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { authApi } from '@/lib/api/auth';
import { DesktopLiveSearch, MobileLiveSearchOverlay } from './LiveSearch';

const PROMOTIONAL_ANNOUNCEMENTS = [
  'Complimentary Express Delivery & Personalised In-Boutique Fitting Service',
  'Maison Shoezy • Handcrafted Luxury Footwear & Artisanal Shoemaking',
  'Private Appointments & Made-To-Measure Services Available Upon Request',
];

type NavItem = {
  label: string;
  href?: string;
  key: string;
  isModal?: boolean;
};

const CATEGORY_NAV_ITEMS: NavItem[] = [
  { label: 'MEN', href: '/products?gender=MALE', key: 'men' },
  { label: 'WOMEN', href: '/products?gender=FEMALE', key: 'women' },
  { label: 'COLLECTIONS', href: '/collections', key: 'collections' },
  { label: 'CATEGORIES', href: '/categories', key: 'categories' },
];

export default function StorefrontHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslations();
  const authenticated = useAuthStore(selectIsAuthenticated);
  const user = useAuthStore(selectUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const cart = useCurrentCart();
  const cartCount =
    cart.data?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      clearAuth();
      router.push('/');
    }
  };

  // Is this the homepage? (transparent header overlay on hero)
  const isHomepage = pathname === '/' || pathname === '';

  // Scroll state
  const [scrolled, setScrolled] = useState(false);
  const [announcementIndex, setAnnouncementIndex] = useState(0);

  // Modals & Drawers
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (current) => {
    setScrolled(current > 50);
  });

  // Rotate Promotional Ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % PROMOTIONAL_ANNOUNCEMENTS.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  // Close mobile drawer on route change
  /* eslint-disable react-hooks/set-state-in-effect -- Route changes close transient navigation surfaces. */
  useEffect(() => {
    setMobileDrawerOpen(false);
    setSearchOpen(false);
  }, [pathname]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchOpen(false);
    router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  // Determine visual mode: transparent (over hero) vs solid
  const isTransparent = isHomepage && !scrolled;

  // Dynamic color classes
  const textColor = isTransparent
    ? 'text-white'
    : 'text-neutral-900 dark:text-neutral-100';
  const textMuted = isTransparent
    ? 'text-white/70'
    : 'text-neutral-500 dark:text-neutral-400';
  const iconColor = isTransparent
    ? 'text-white/90 hover:text-white'
    : 'text-neutral-700 dark:text-neutral-200 hover:text-black dark:hover:text-white';

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-out ${
          isTransparent
            ? 'bg-transparent'
            : 'bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border-b border-neutral-200/40 dark:border-white/10 shadow-sm'
        }`}
      >
        {/* ──────────────────────────────────────────────────────────
            TIER 1: SLIM UTILITY BAR
        ────────────────────────────────────────────────────────── */}
        <div
          className={`w-full text-[10px] uppercase tracking-[0.18em] px-4 md:px-8 py-1.5 transition-colors duration-500 ${
            isTransparent
              ? 'bg-transparent border-b border-white/10 text-white/70'
              : 'bg-neutral-950 dark:bg-neutral-900 border-b border-neutral-800/70 dark:border-white/10 text-neutral-400'
          }`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Left: Concierge */}
            <div className="hidden lg:flex items-center gap-5">
              <a
                href="tel:+21671000000"
                className={`inline-flex items-center gap-1.5 transition-colors ${
                  isTransparent ? 'hover:text-white' : 'hover:text-white'
                }`}
              >
                <Phone className="size-3 text-[#FF8C00]" />
                <span>Concierge: +216 71 890 120</span>
              </a>
            </div>

            {/* Center: Dynamic Announcement Ticker */}
            <div className="flex-1 flex items-center justify-center overflow-hidden h-4 text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={announcementIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="flex items-center justify-center gap-2 font-medium truncate max-w-xl"
                >
                  <Sparkles className="size-3 text-[#FF8C00] shrink-0" />
                  <span className="truncate">
                    {PROMOTIONAL_ANNOUNCEMENTS[announcementIndex]}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right: Language & Theme */}
            <div className="flex items-center gap-3 md:gap-4 shrink-0">
              <LanguageSwitcher tone="inverse" className="text-xs" />
              <ThemeToggle tone="inverse" />
            </div>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────
            TIER 2: MAIN NAVIGATION BAR (Unified)
        ────────────────────────────────────────────────────────── */}
        <div className="w-full px-4 sm:px-6 lg:px-10 py-3 md:py-3.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Left: Navigation Links (Desktop) + Hamburger (Mobile) */}
            <div className="flex items-center gap-6 lg:gap-8 flex-1">
              {/* Mobile Hamburger */}
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(true)}
                aria-label={t('header.menuOpen')}
                className={`lg:hidden p-1 transition-colors ${iconColor}`}
              >
                <Menu className="size-5 stroke-[1.5]" />
              </button>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-7">
                {CATEGORY_NAV_ITEMS.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href || '#'}
                    className={`text-xs uppercase tracking-[0.18em] font-medium transition-all duration-300 relative group py-1 ${
                      isTransparent
                        ? 'text-white/80 hover:text-white'
                        : 'text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span
                      className={`absolute bottom-0 left-0 w-0 h-[1px] transition-all duration-300 group-hover:w-full ${
                        isTransparent ? 'bg-white' : 'bg-black dark:bg-white'
                      }`}
                    />
                  </Link>
                ))}
              </nav>
            </div>

            {/* Center: Logo */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <Link href="/" className="flex flex-col items-center group text-center py-0.5">
                <span
                  className={`font-serif text-2xl sm:text-3xl md:text-[2.2rem] tracking-[0.3em] font-light uppercase pl-[0.3em] transition-all duration-500 ${
                    isTransparent
                      ? 'text-white'
                      : 'text-neutral-950 dark:text-neutral-50'
                  } group-hover:tracking-[0.35em]`}
                >
                  SHOEZY
                </span>
                <span
                  className={`text-[7px] sm:text-[8px] uppercase tracking-[0.4em] pl-[0.4em] -mt-0.5 font-sans transition-colors duration-500 ${
                    isTransparent
                      ? 'text-white/50'
                      : 'text-neutral-400 dark:text-neutral-500'
                  }`}
                >
                  Maison Fondée en 1928
                </span>
              </Link>
            </div>

            {/* Right: Action Icons */}
            <div className="shrink-0 flex items-center gap-1.5 sm:gap-3 flex-1 justify-end">
              {/* Desktop Live Search */}
              <div className={isTransparent ? '[&_input]:text-white [&_input]:placeholder:text-white/50 [&_input]:border-white/20 [&_svg]:text-white/70' : ''}>
                <DesktopLiveSearch />
              </div>

              {/* Mobile Search Icon */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label={t('header.searchOpen')}
                className={`md:hidden w-8 h-8 flex items-center justify-center rounded-full shrink-0 transition-colors ${iconColor}`}
              >
                <Search className="size-[18px] stroke-[1.5]" />
              </button>

              {/* Notification Center */}
              {authenticated && <NotificationCenter compact />}

              {/* Wishlist */}
              <Link
                href={authenticated ? '/wishlist' : '/login'}
                aria-label={t('header.wishlist')}
                className={`hidden sm:inline-flex items-center justify-center p-1 transition-colors shrink-0 ${iconColor}`}
              >
                <Heart className="size-[18px] stroke-[1.5]" />
              </Link>

              {/* User Account */}
              {authenticated ? (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label={t('header.account')}
                      className={`inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border transition-colors focus:outline-none shrink-0 ${
                        isTransparent
                          ? 'border-white/40 bg-white/10 text-white hover:border-white hover:bg-white/20'
                          : 'border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 hover:border-black dark:hover:border-white'
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-semibold tracking-wider">
                        {(user?.firstName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 mt-2 z-[100] shadow-xl p-1 rounded-lg">
                    <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-900 mb-1">
                      <p className="text-xs font-semibold tracking-wider uppercase">{t('account.heading') || 'My Account'}</p>
                    </div>
                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 focus:bg-neutral-100 dark:focus:bg-neutral-900 rounded-md">
                      <Link href="/account" className="flex items-center w-full px-2 py-1.5 text-sm">
                        <Settings className="mr-3 size-4 text-neutral-500" />
                        {t('account.profile') || 'Profile Settings'}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 focus:bg-neutral-100 dark:focus:bg-neutral-900 rounded-md">
                      <Link href="/account?tab=orders" className="flex items-center w-full px-2 py-1.5 text-sm">
                        <Package className="mr-3 size-4 text-neutral-500" />
                        {t('account.orders') || 'Orders & Returns'}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1 bg-neutral-200 dark:bg-neutral-800" />
                    <DropdownMenuItem 
                      className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 focus:bg-neutral-100 dark:focus:bg-neutral-900 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 rounded-md px-2 py-1.5 text-sm"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-3 size-4" />
                      {t('account.logout') || 'Sign Out'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  href="/login"
                  aria-label={t('header.signIn')}
                  className={`inline-flex items-center justify-center p-1 transition-colors shrink-0 ${iconColor}`}
                >
                  <User className="size-[18px] stroke-[1.5]" />
                </Link>
              )}

              {/* Shopping Bag */}
              <Link
                href="/cart"
                aria-label={t('header.cart', { count: cartCount })}
                className={`shrink-0 inline-flex items-center justify-center gap-1.5 p-1 sm:px-3 sm:py-1.5 sm:rounded-full sm:border transition-all duration-300 group relative ${
                  isTransparent
                    ? 'text-white/90 hover:text-white sm:border-white/25 sm:hover:border-white/50 sm:bg-white/5'
                    : 'text-neutral-800 dark:text-neutral-200 sm:border-neutral-300 dark:sm:border-neutral-800 sm:hover:border-black dark:sm:hover:border-white sm:bg-neutral-50/60 dark:sm:bg-neutral-900/60'
                }`}
              >
                <ShoppingBag className="size-[18px] sm:size-4 stroke-[1.5]" />
                {/* Mobile Badge */}
                <span className="sm:hidden absolute top-0 right-0 inline-flex items-center justify-center w-3.5 h-3.5 text-[8px] font-bold text-white bg-[#FF8C00] rounded-full translate-x-1/4 -translate-y-1/4">
                  {cartCount}
                </span>
                {/* Desktop Text */}
                <span className={`hidden sm:inline-flex text-xs font-medium tracking-wider uppercase items-center ${
                  isTransparent ? 'text-white/90' : 'text-neutral-900 dark:text-neutral-100'
                }`}>
                  Bag <span className="text-[#FF8C00] font-semibold ml-1">({cartCount})</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────
          MOBILE SLIDE-OVER DRAWER
      ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Drawer Content */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative z-10 w-full max-w-sm bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 h-full flex flex-col justify-between shadow-2xl p-6 overflow-y-auto"
            >
              <div>
                {/* Header inside drawer */}
                <div className="flex items-center justify-between pb-6 border-b border-neutral-100 dark:border-neutral-900">
                  <div className="flex flex-col">
                    <span className="font-serif text-2xl tracking-[0.25em] font-light uppercase">
                      SHOEZY
                    </span>
                    <span className="text-[8px] tracking-[0.3em] text-neutral-400 uppercase">
                      Maison de Chaussures
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileDrawerOpen(false)}
                    aria-label={t('header.menuClose')}
                    className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {/* Mobile Search Form */}
                <form onSubmit={handleSearchSubmit} className="mt-6 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search catalog, brands, sizes…"
                    className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2.5 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-black dark:focus:border-white"
                  />
                  <button
                    type="submit"
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-black dark:hover:text-white"
                  >
                    <Search className="size-4" />
                  </button>
                </form>

                {/* Category Navigation Links */}
                <nav className="mt-8 flex flex-col gap-4">
                  {CATEGORY_NAV_ITEMS.map((item) => (
                    <Link
                      key={item.key}
                      href={item.href || '#'}
                      onClick={() => {
                        if (item.isModal) {
                          setAppointmentModalOpen(true);
                          setMobileDrawerOpen(false);
                        }
                      }}
                      className="text-base font-medium tracking-[0.18em] uppercase py-2 border-b border-neutral-100 dark:border-neutral-900/60 hover:text-[#FF8C00] transition-colors flex items-center justify-between"
                    >
                      <span>{item.label}</span>
                      <span className="text-xs text-neutral-400">→</span>
                    </Link>
                  ))}
                  <Link
                    href={authenticated ? '/wishlist' : '/login'}
                    className="text-base font-medium tracking-[0.18em] uppercase py-2 border-b border-neutral-100 dark:border-neutral-900/60 hover:text-[#FF8C00] transition-colors flex items-center justify-between"
                  >
                    <span>{t('header.wishlist')}</span>
                    <Heart className="size-4 text-neutral-400" />
                  </Link>
                </nav>
              </div>

              {/* Drawer Footer */}
              <div className="pt-6 border-t border-neutral-100 dark:border-neutral-900 text-xs text-neutral-500 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setAppointmentModalOpen(true);
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full py-2.5 bg-black text-white dark:bg-white dark:text-black text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity"
                >
                  Book Private Appointment
                </button>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] uppercase tracking-wider">
                    Customer Care
                  </span>
                  <a
                    href="tel:+21671000000"
                    className="font-mono text-neutral-700 dark:text-neutral-300 font-medium"
                  >
                    +216 71 890 120
                  </a>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Live Search Overlay */}
      <MobileLiveSearchOverlay 
        isOpen={searchOpen} 
        onClose={() => setSearchOpen(false)} 
      />

      {/* ──────────────────────────────────────────────────────────
          APPOINTMENT & CONCIERGE MODAL
      ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {appointmentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAppointmentModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative z-10 w-full max-w-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-8 shadow-2xl text-neutral-900 dark:text-neutral-50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#FF8C00] font-semibold">
                    Maison Shoezy Concierge
                  </span>
                  <h3 className="font-serif text-2xl md:text-3xl mt-1">
                    Book a Private Fitting
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setAppointmentModalOpen(false)}
                  className="p-1 text-neutral-400 hover:text-black dark:hover:text-white"
                >
                  <X className="size-5" />
                </button>
              </div>

              <p className="mt-3 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Enjoy a personalised bespoke consultation with our master bootmakers in Tunis or Paris. Select your preferred date and our private concierge will confirm within 2 hours.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Thank you. Our concierge team will contact you shortly to confirm your private fitting appointment.');
                  setAppointmentModalOpen(false);
                }}
                className="mt-6 space-y-4 text-xs"
              >
                <div>
                  <label className="block uppercase tracking-wider text-[10px] text-neutral-500 mb-1">
                    Full Name
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Jean Dupont"
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 rounded focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase tracking-wider text-[10px] text-neutral-500 mb-1">
                      Phone Number
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="+216 20 000 000"
                      className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 rounded focus:outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="block uppercase tracking-wider text-[10px] text-neutral-500 mb-1">
                      Preferred Boutique
                    </label>
                    <select className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 rounded focus:outline-none focus:border-black dark:focus:border-white">
                      <option>Maison Tunis - Les Berges du Lac</option>
                      <option>Maison Paris - Rue du Faubourg</option>
                      <option>Virtual Video Consultation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-[10px] text-neutral-500 mb-1">
                    Preferred Date & Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Saturday afternoon, looking for Oxford calfskin"
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 rounded focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#FF8C00] hover:bg-[#e67e00] text-white font-semibold uppercase tracking-widest text-xs transition-colors cursor-pointer"
                  >
                    Request Appointment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

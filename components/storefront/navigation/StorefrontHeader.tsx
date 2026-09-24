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
  Calendar,
  ChevronDown,
  Globe,
  Heart,
  MapPin,
  Menu,
  Phone,
  Search,
  ShoppingBag,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { useCurrentCart } from '@/lib/hooks/use-commerce';
import { selectIsAuthenticated, useAuthStore } from '@/stores/auth-store';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { useTranslations } from '@/lib/hooks/use-translations';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const PROMOTIONAL_ANNOUNCEMENTS = [
  'Complimentary Express Delivery & Personalised In-Boutique Fitting Service',
  'Maison Shoozy • Handcrafted Luxury Footwear & Artisanal Shoemaking',
  'Private Appointments & Made-To-Measure Services Available Upon Request',
];

const CATEGORY_NAV_ITEMS = [
  { label: 'MEN', href: '/products?gender=MALE', key: 'men' },
  { label: 'WOMEN', href: '/products?gender=FEMALE', key: 'women' },
  { label: 'COLLECTIONS', href: '/collections', key: 'collections' },
  { label: 'CATEGORIES', href: '/categories', key: 'categories' },
  { label: 'SERVICES', href: '#appointment', key: 'services', isModal: true },
  { label: 'THE HOUSE', href: '/collections', key: 'the-house' },
];

const CURRENCIES = [
  { code: 'TND', label: 'Tunisia (TND)', flag: '🇹🇳' },
  { code: 'EUR', label: 'France / EU (€)', flag: '🇫🇷' },
  { code: 'USD', label: 'International ($)', flag: '🌐' },
];

export default function StorefrontHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslations();
  const authenticated = useAuthStore(selectIsAuthenticated);
  const cart = useCurrentCart();
  const cartCount =
    cart.data?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;

  // Scroll state & direction
  const [isAtTop, setIsAtTop] = useState(true);
  const [isCategoryVisible, setIsCategoryVisible] = useState(true);
  const [announcementIndex, setAnnouncementIndex] = useState(0);

  // Modals & Drawers
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const lastScrollY = useRef(0);
  const { scrollY } = useScroll();

  // Dynamic Scroll Direction & Category Bar Animation
  useMotionValueEvent(scrollY, 'change', (current) => {
    const previous = lastScrollY.current;
    const delta = current - previous;

    if (current <= 20) {
      setIsAtTop(true);
      setIsCategoryVisible(true);
    } else {
      setIsAtTop(false);
      if (delta > 8 && current > 80) {
        // Scrolling Down: slide category bar out of view
        setIsCategoryVisible(false);
      } else if (delta < -8) {
        // Scrolling Up: slide category bar back in
        setIsCategoryVisible(true);
      }
    }
    lastScrollY.current = current;
  });

  // Rotate Promotional Ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % PROMOTIONAL_ANNOUNCEMENTS.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchOpen(false);
    router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-40 flex flex-col font-sans transition-all duration-300">
        {/* ──────────────────────────────────────────────────────────
            TIER 1: TOP UTILITY BAR (Sticky / Topmost Slim Bar)
        ────────────────────────────────────────────────────────── */}
        <div className="w-full bg-[#111111] text-neutral-300 dark:bg-black dark:text-neutral-400 border-b border-neutral-800/70 text-[11px] uppercase tracking-[0.16em] px-4 md:px-8 py-2 transition-colors">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Left: Concierge / Appointment */}
            <div className="hidden lg:flex items-center gap-5 text-neutral-300">
              <a
                href="tel:+21671000000"
                className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <Phone className="size-3 text-[#FF8C00]" />
                <span>Concierge: +216 71 890 120</span>
              </a>
              <span className="text-neutral-700">|</span>
              <button
                type="button"
                onClick={() => setAppointmentModalOpen(true)}
                className="inline-flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
              >
                <Calendar className="size-3 text-[#FF8C00]" />
                <span>Book an Appointment</span>
              </button>
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
                  className="flex items-center justify-center gap-2 text-neutral-200 dark:text-neutral-300 font-medium truncate max-w-xl"
                >
                  <Sparkles className="size-3 text-[#FF8C00] shrink-0" />
                  <span className="truncate">
                    {PROMOTIONAL_ANNOUNCEMENTS[announcementIndex]}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right: Currency & Language Switcher */}
            <div className="flex items-center gap-3 md:gap-4 shrink-0">
              {/* Currency Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 text-neutral-300 hover:text-white transition-colors focus:outline-none"
                  >
                    <span className="text-xs">{selectedCurrency.flag}</span>
                    <span className="hidden sm:inline">{selectedCurrency.code}</span>
                    <ChevronDown className="size-3 opacity-60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-neutral-900 border-neutral-800 text-white text-xs">
                  {CURRENCIES.map((curr) => (
                    <DropdownMenuItem
                      key={curr.code}
                      onClick={() => setSelectedCurrency(curr)}
                      className="flex items-center justify-between cursor-pointer hover:bg-neutral-800 px-3 py-2"
                    >
                      <span className="flex items-center gap-2">
                        <span>{curr.flag}</span>
                        <span>{curr.label}</span>
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <span className="text-neutral-700">|</span>

              {/* Language Switcher */}
              <LanguageSwitcher tone="inverse" className="text-xs" />

              {/* Dark / Light Theme Toggle */}
              <ThemeToggle tone="inverse" />
            </div>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────
            TIER 2: MAIN BRAND & ACTION BAR (Luxury Glassmorphism)
        ────────────────────────────────────────────────────────── */}
        <div
          className={`w-full bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-200/60 dark:border-neutral-850/60 transition-all duration-300 px-4 sm:px-6 md:px-10 py-3.5 ${
            !isAtTop ? 'shadow-sm' : ''
          }`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Left: Boutiques & Minimalist Search Pill */}
            <div className="flex items-center gap-3 sm:gap-6 flex-1 justify-start">
              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(true)}
                aria-label={t('header.menuOpen')}
                className="lg:hidden p-1.5 text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white transition-colors"
              >
                <Menu className="size-6 stroke-[1.5]" />
              </button>

              <Link
                href="/collections"
                className="hidden lg:inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.25em] text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white transition-colors"
              >
                <MapPin className="size-3.5 text-neutral-400" />
                <span>Boutiques</span>
              </Link>

              {/* Minimalist Search Pill (Desktop) */}
              <form
                onSubmit={handleSearchSubmit}
                className="hidden md:flex items-center relative rounded-full bg-neutral-100/90 dark:bg-neutral-900/90 border border-neutral-200/80 dark:border-neutral-800 px-3.5 py-1.5 transition-all duration-300 w-48 lg:w-60 focus-within:w-72 focus-within:border-black dark:focus-within:border-white focus-within:bg-white dark:focus-within:bg-black shadow-none"
              >
                <Search className="size-3.5 text-neutral-400 shrink-0 me-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Maison Shoozy…"
                  aria-label={t('header.search')}
                  className="w-full bg-transparent text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none"
                />
              </form>
            </div>

            {/* Center: Editorial Brand Typography */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <Link href="/" className="flex flex-col items-center group text-center py-1">
                <span className="font-serif text-2xl sm:text-3xl md:text-4xl tracking-[0.32em] font-light text-neutral-950 dark:text-neutral-50 group-hover:tracking-[0.35em] transition-all duration-300 uppercase pl-[0.32em]">
                  SHOOZY
                </span>
                <span className="text-[7.5px] sm:text-[8px] uppercase tracking-[0.45em] text-neutral-400 dark:text-neutral-500 pl-[0.45em] -mt-1 font-sans">
                  Maison Fondée en 1928
                </span>
              </Link>
            </div>

            {/* Right: Actions (Wishlist, Account, Bag) */}
            <div className="flex items-center gap-3 sm:gap-5 flex-1 justify-end text-neutral-800 dark:text-neutral-200">
              {/* Mobile Search Icon */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label={t('header.searchOpen')}
                className="md:hidden p-1 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white"
              >
                <Search className="size-5 stroke-[1.5]" />
              </button>

              {/* Notification Center */}
              {authenticated && <NotificationCenter compact tone="default" />}

              {/* Wishlist Link */}
              <Link
                href={authenticated ? '/wishlist' : '/login'}
                aria-label={t('header.wishlist')}
                className="hidden sm:inline-flex items-center justify-center p-1 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors"
              >
                <Heart className="size-5 stroke-[1.5]" />
              </Link>

              {/* User Account Trigger */}
              <Link
                href={authenticated ? '/account' : '/login'}
                aria-label={authenticated ? t('header.account') : t('header.signIn')}
                className="inline-flex items-center justify-center p-1 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors"
              >
                <User className="size-5 stroke-[1.5]" />
              </Link>

              {/* Shopping Bag Luxury Pill Trigger */}
              <Link
                href="/cart"
                aria-label={t('header.cart', { count: cartCount })}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white bg-neutral-50/60 dark:bg-neutral-900/60 transition-all duration-200 group"
              >
                <ShoppingBag className="size-4 text-neutral-800 dark:text-neutral-200 group-hover:text-black dark:group-hover:text-white stroke-[1.5]" />
                <span className="text-xs font-medium tracking-wider uppercase text-neutral-900 dark:text-neutral-100">
                  Bag{' '}
                  <span className="text-[#FF8C00] font-semibold">
                    ({cartCount})
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────
            TIER 3: SECONDARY CATEGORY NAVIGATION (Animated Tier)
        ────────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {isCategoryVisible && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:block w-full bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-b border-neutral-200/50 dark:border-neutral-850/50 overflow-hidden"
              aria-label="Secondary Storefront Navigation"
            >
              <div className="max-w-7xl mx-auto flex items-center justify-center gap-8 md:gap-12 py-2.5 px-4">
                {CATEGORY_NAV_ITEMS.map((item) => {
                  if (item.isModal) {
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setAppointmentModalOpen(true)}
                        className="text-[12px] font-medium tracking-[0.22em] text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors duration-200 relative group py-1 cursor-pointer"
                      >
                        <span>{item.label}</span>
                        <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#FF8C00] transition-all duration-300 group-hover:w-full" />
                      </button>
                    );
                  }
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      className="text-[12px] font-medium tracking-[0.22em] text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors duration-200 relative group py-1"
                    >
                      <span>{item.label}</span>
                      <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-black dark:bg-white transition-all duration-300 group-hover:w-full" />
                    </Link>
                  );
                })}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
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
                      SHOOZY
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
                      href={item.href}
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

              {/* Drawer Footer info */}
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

      {/* ──────────────────────────────────────────────────────────
          MOBILE SEARCH OVERLAY
      ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-0 top-0 z-50 bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-800 p-4 shadow-xl"
          >
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex items-center gap-3">
              <Search className="size-5 text-neutral-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, boots, loafers, sneakers…"
                className="w-full bg-transparent text-sm md:text-base text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none py-2"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-black text-white dark:bg-white dark:text-black text-xs uppercase tracking-wider font-semibold"
              >
                {t('common.search')}
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-2 text-neutral-500 hover:text-black dark:hover:text-white"
              >
                <X className="size-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

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
                    Maison Shoozy Concierge
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

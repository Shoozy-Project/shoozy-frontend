'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import AnnouncementBar from './AnnouncementBar';
import { useCurrentCart } from '@/lib/hooks/use-commerce';
import { selectIsAuthenticated, useAuthStore } from '@/stores/auth-store';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { useTranslations } from '@/lib/hooks/use-translations';

const navLinks = [
  { href: '/products', key: 'header.shop' },
  { href: '/categories', key: 'header.categories' },
  { href: '/collections', key: 'header.collections' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const authenticated = useAuthStore(selectIsAuthenticated);
  const cart = useCurrentCart();
  const { t } = useTranslations();
  const count = cart.data?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;
  const solid = pathname !== '/' || isScrolled || searchOpen || menuOpen;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const search = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get('search') ?? '').trim();
    if (!value) return;
    setSearchOpen(false);
    router.push(`/products?search=${encodeURIComponent(value)}`);
  };

  return (
    <header className="fixed left-0 top-0 z-50 flex w-full flex-col">
      <AnnouncementBar />
      <div className={`w-full transition-all duration-300 ${solid ? 'bg-black/95 shadow-md backdrop-blur-md' : 'bg-gradient-to-b from-black/80 via-black/30 to-transparent'}`}>
        <div className="flex items-center justify-between px-4 py-4 sm:px-6 md:px-12">
          <div className="flex flex-1 items-center justify-start gap-3">
            <button type="button" onClick={() => setSearchOpen((value) => !value)} aria-label={searchOpen ? t('header.searchClose') : t('header.searchOpen')} aria-expanded={searchOpen} className="text-white transition-colors hover:text-white/80">
              {searchOpen ? <X className="size-5" /> : <Search className="size-5" strokeWidth={1.5} />}
            </button>
            <button type="button" onClick={() => setMenuOpen((value) => !value)} aria-label={menuOpen ? t('header.menuClose') : t('header.menuOpen')} aria-expanded={menuOpen} className="text-white md:hidden">
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
          <Link href="/" className="flex-shrink-0 font-serif text-3xl font-medium tracking-wide text-white drop-shadow-md md:text-4xl">SHOOZY</Link>
          <div className="flex flex-1 items-center justify-end gap-4 sm:gap-6">
            <LanguageSwitcher tone="inverse" />
            <ThemeToggle tone="inverse" />
            {authenticated && <NotificationCenter tone="inverse" compact />}
            <Link href={authenticated ? '/wishlist' : '/login'} aria-label={t('header.wishlist')} className="hidden text-white transition-colors hover:text-white/80 sm:block"><Heart className="size-5" strokeWidth={1.5} /></Link>
            <Link href={authenticated ? '/account' : '/login'} aria-label={authenticated ? t('header.account') : t('header.signIn')} className="text-white transition-colors hover:text-white/80"><User className="size-5" strokeWidth={1.5} /></Link>
            <Link href="/cart" aria-label={t('header.cart', { count })} className="relative text-white transition-colors hover:text-white/80">
              <ShoppingBag className="size-5" strokeWidth={1.5} />
              {count > 0 && <span className="absolute -right-2.5 -top-2.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[#fff] px-1 text-[10px] font-bold text-[#000]">{count > 99 ? '99+' : count}</span>}
            </Link>
          </div>
        </div>
        <nav className="hidden items-center justify-center gap-8 pb-4 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => <Link key={link.href} href={link.href} className="text-xs font-medium uppercase tracking-widest text-white/90 transition-colors hover:text-white">{t(link.key)}</Link>)}
        </nav>
        {searchOpen && (
          <form onSubmit={search} role="search" className="border-t border-white/15 px-4 py-4 sm:px-6 md:px-12">
            <div className="mx-auto flex max-w-2xl items-center gap-3 border-b border-white/50 pb-2">
              <Search className="size-5 text-white/70" aria-hidden="true" />
              <input name="search" autoFocus maxLength={100} placeholder={t('header.search')} aria-label={t('header.search')} className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/60" />
              <button type="submit" className="text-xs font-medium uppercase tracking-wider text-white">{t('common.search')}</button>
            </div>
          </form>
        )}
        {menuOpen && (
          <nav className="border-t border-white/15 px-5 py-4 md:hidden" aria-label="Mobile navigation">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="text-sm font-medium uppercase tracking-widest text-white">{t(link.key)}</Link>)}
              <Link href={authenticated ? '/wishlist' : '/login'} onClick={() => setMenuOpen(false)} className="text-sm font-medium uppercase tracking-widest text-white">{t('header.wishlist')}</Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

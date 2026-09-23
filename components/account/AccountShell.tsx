'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Heart, Home, LoaderCircle, LogOut, MapPin, Package, Repeat2, RotateCcw, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth';
import { selectIsAuthenticated, useAuthStore } from '@/stores/auth-store';
import { useTranslations } from '@/lib/hooks/use-translations';

const links = [
  { href: '/account', labelKey: 'account.overview', icon: Home },
  { href: '/account/profile', labelKey: 'account.profile', icon: UserRound },
  { href: '/account/addresses', labelKey: 'account.addresses', icon: MapPin },
  { href: '/account/orders', labelKey: 'account.orders', icon: Package },
  { href: '/account/returns', labelKey: 'account.returns', icon: RotateCcw },
  { href: '/account/exchanges', labelKey: 'account.exchanges', icon: Repeat2 },
  { href: '/account/notifications', labelKey: 'account.notifications', icon: Bell },
  { href: '/wishlist', labelKey: 'account.wishlist', icon: Heart },
];

function isCustomerSessionQuery(query: { queryKey: readonly unknown[] }) {
  const [root, resource, audience] = query.queryKey;
  return root === 'account'
    || root === 'notifications'
    || root === 'admin-capability'
    || (root === 'commerce' && resource === 'wishlist')
    || (root === 'commerce' && resource === 'cart' && audience === 'account');
}

export function AccountShell({ children }: { children: React.ReactNode }) {
  const authenticated = useAuthStore(selectIsAuthenticated);
  const initialized = useAuthStore((state) => state.isInitialized);
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslations();
  const logoutStarted = useRef(false);
  const logout = useMutation({
    mutationFn: authApi.logout,
    onMutate: () => {
      logoutStarted.current = true;
    },
    onSettled: async (_data, error) => {
      await queryClient.cancelQueries({ predicate: isCustomerSessionQuery });
      useAuthStore.getState().clearAuth();
      queryClient.removeQueries({ predicate: isCustomerSessionQuery });

      if (error) toast.info(t('account.localSessionCleared'));
      else toast.success(t('account.loggedOut'));

      router.replace('/');
      router.refresh();
    },
  });

  useEffect(() => {
    if (initialized && !authenticated && !logoutStarted.current) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [authenticated, initialized, pathname, router]);

  if (!initialized || !authenticated) return <div className="px-4 pb-24 pt-40 text-center text-muted-foreground">{t('account.checking')}</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-40 sm:px-6 lg:px-8">
      <div className="mb-10"><p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{t('account.kicker')}</p><h1 className="mt-3 font-serif text-4xl md:text-5xl">{t('account.heading')}</h1></div>
      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label={t('account.navigation')} className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
          {links.map((item) => {
            const active = pathname === item.href || (item.href !== '/account' && pathname.startsWith(`${item.href}/`));
            const Icon = item.icon;
            return <Link key={item.href} href={item.href} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm ${active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}><Icon className="size-4" />{t(item.labelKey)}</Link>;
          })}
          <button
            type="button"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            {logout.isPending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <LogOut className="size-4" aria-hidden="true" />}
            {logout.isPending ? t('account.loggingOut') : t('account.logout')}
          </button>
        </nav>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

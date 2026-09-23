'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, Home, LoaderCircle, LogOut, MapPin, Package, Repeat2, RotateCcw, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth';
import { selectIsAuthenticated, useAuthStore } from '@/stores/auth-store';

const links = [
  { href: '/account', label: 'Overview', icon: Home },
  { href: '/account/profile', label: 'Profile', icon: UserRound },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin },
  { href: '/account/orders', label: 'Orders', icon: Package },
  { href: '/account/returns', label: 'Returns', icon: RotateCcw },
  { href: '/account/exchanges', label: 'Exchanges', icon: Repeat2 },
  { href: '/wishlist', label: 'Wishlist', icon: Heart },
];

function isCustomerSessionQuery(query: { queryKey: readonly unknown[] }) {
  const [root, resource, audience] = query.queryKey;
  return root === 'account'
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

      if (error) toast.info('Your local session has been cleared.');
      else toast.success('You have been logged out.');

      router.replace('/');
      router.refresh();
    },
  });

  useEffect(() => {
    if (initialized && !authenticated && !logoutStarted.current) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [authenticated, initialized, pathname, router]);

  if (!initialized || !authenticated) return <div className="px-4 pb-24 pt-40 text-center text-muted-foreground">Checking your Shoozy account…</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-40 sm:px-6 lg:px-8">
      <div className="mb-10"><p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Customer account</p><h1 className="mt-3 font-serif text-4xl md:text-5xl">My Shoozy</h1></div>
      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Account navigation" className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
          {links.map((item) => {
            const active = pathname === item.href || (item.href !== '/account' && pathname.startsWith(`${item.href}/`));
            const Icon = item.icon;
            return <Link key={item.href} href={item.href} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm ${active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}><Icon className="size-4" />{item.label}</Link>;
          })}
          <button
            type="button"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            {logout.isPending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <LogOut className="size-4" aria-hidden="true" />}
            {logout.isPending ? 'Logging out…' : 'Log out'}
          </button>
        </nav>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

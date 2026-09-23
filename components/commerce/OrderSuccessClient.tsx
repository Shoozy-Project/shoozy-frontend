'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { accountApi } from '@/lib/api/account';
import { checkoutApi } from '@/lib/api/checkout';
import { formatMinorMoney } from '@/lib/format-money';
import { selectIsAuthenticated, useAuthStore } from '@/stores/auth-store';
import type { OrderDetailDto } from '@/types/commerce';

interface StoredSuccess { order: OrderDetailDto; whatsappConfirmation: { enabled: boolean; url: string | null } }

export function OrderSuccessClient({ orderNumber }: { orderNumber: string }) {
  const authenticated = useAuthStore(selectIsAuthenticated);
  const authReady = useAuthStore((state) => state.isInitialized);
  const storage = useQuery({
    queryKey: ['commerce', 'order-success-storage', orderNumber],
    queryFn: () => {
      const raw = window.sessionStorage.getItem(`shoozy:order-success:${orderNumber}`);
      let stored: StoredSuccess | null = null;
      if (raw) try { stored = JSON.parse(raw) as StoredSuccess; } catch { stored = null; }
      return { stored, guestToken: window.sessionStorage.getItem(`shoozy:guest-order-token:${orderNumber}`) };
    },
    staleTime: Infinity,
  });
  const stored = storage.data?.stored ?? null;
  const guestToken = storage.data?.guestToken ?? null;
  const orderId = stored?.order.id;
  const order = useQuery({
    queryKey: ['commerce', 'order-success', orderNumber, authenticated ? 'account' : 'guest'],
    queryFn: () => authenticated ? accountApi.order(orderId!) : checkoutApi.getGuestOrder(orderNumber, guestToken!),
    enabled: authReady && Boolean(authenticated ? orderId : guestToken),
    staleTime: 30_000,
  });

  if (storage.isLoading || !authReady || (!stored && order.isLoading)) return <p className="py-20 text-center text-muted-foreground">Loading order confirmation…</p>;
  const value = order.data ?? stored?.order;
  if (!value) return <div className="rounded-xl border p-10 text-center"><h1 className="font-serif text-3xl">Order confirmation unavailable</h1><p className="mt-3 text-muted-foreground">For privacy, guest order access remains in the browser session that placed the order.</p><Button asChild className="mt-6"><Link href="/products">Continue shopping</Link></Button></div>;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center"><CheckCircle2 className="mx-auto size-14 text-green-600 dark:text-green-400" /><p className="mt-5 text-xs uppercase tracking-[0.3em] text-muted-foreground">Order placed</p><h1 className="mt-3 font-serif text-4xl md:text-5xl">Thank you</h1><p className="mt-3 text-muted-foreground">Order {value.orderNumber}</p></div>
      <div className="mt-10 rounded-xl border p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm text-muted-foreground">Status</p><p className="mt-1 font-medium">{value.status}</p></div><div className="text-right"><p className="text-sm text-muted-foreground">Total on delivery</p><p className="mt-1 text-xl font-semibold">{formatMinorMoney(value.totals.totalMinor, value.totals.currency, 3)}</p></div></div>
        <div className="mt-6 rounded-lg bg-muted p-4"><p className="font-medium">Cash on Delivery</p><p className="mt-1 text-sm text-muted-foreground">Pay this total when your Shoozy order is delivered.</p></div>
        <div className="mt-6 space-y-3 border-t pt-5">{value.items.map((item) => <div key={item.id} className="flex justify-between gap-4 text-sm"><span>{item.productName} · {item.variantName} × {item.quantity}</span><span>{formatMinorMoney(item.lineTotalMinor, value.totals.currency, 3)}</span></div>)}</div>
        {value.address && <div className="mt-6 border-t pt-5 text-sm"><p className="font-medium">Delivery address</p><p className="mt-1 text-muted-foreground">{value.address.recipientName}<br />{value.address.line1}{value.address.line2 ? `, ${value.address.line2}` : ''}<br />{[value.address.area, value.address.city, value.address.state].filter(Boolean).join(', ')}</p></div>}
      </div>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        {stored?.whatsappConfirmation.enabled && stored.whatsappConfirmation.url && <Button asChild className="h-11"><a href={stored.whatsappConfirmation.url} target="_blank" rel="noreferrer"><MessageCircle /> Confirm on WhatsApp</a></Button>}
        <Button asChild variant="outline" className="h-11"><Link href={authenticated ? `/account/orders/${value.id}` : '/products'}>{authenticated ? 'View order' : 'Continue shopping'}</Link></Button>
      </div>
    </div>
  );
}

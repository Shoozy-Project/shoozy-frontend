'use client';

import { Bell, CheckCheck, LoaderCircle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useNotificationActions,
  useNotifications,
  useNotificationUnreadCount,
} from '@/lib/hooks/use-notifications';
import { notificationHref } from '@/lib/notifications';
import { cn } from '@/lib/utils';
import { useLocaleStore } from '@/stores/locale-store';
import type { NotificationDto } from '@/types/notifications';

function relativeTime(value: string, locale: 'ar' | 'en') {
  const delta = Date.parse(value) - Date.now();
  const absolute = Math.abs(delta);
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['day', 86_400_000], ['hour', 3_600_000], ['minute', 60_000], ['second', 1_000],
  ];
  const [unit, divisor] = units.find(([, size]) => absolute >= size) ?? units.at(-1)!;
  return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(Math.round(delta / divisor), unit);
}

export function NotificationCenter({
  admin = false,
  tone = 'default',
  compact = false,
}: {
  admin?: boolean;
  tone?: 'default' | 'inverse';
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const locale = useLocaleStore((state) => state.locale);
  const list = useNotifications({ page: 1, limit: 6 });
  const unread = useNotificationUnreadCount();
  const { markRead, markAllRead, remove } = useNotificationActions();
  const count = unread.data?.count ?? 0;
  const labels = locale === 'ar'
    ? { notifications: 'الإشعارات', allRead: 'تحديد الكل كمقروء', empty: 'لا توجد إشعارات.', retry: 'إعادة المحاولة', all: 'عرض كل الإشعارات', delete: 'حذف الإشعار' }
    : { notifications: 'Notifications', allRead: 'Mark all as read', empty: 'No notifications yet.', retry: 'Try again', all: 'View all notifications', delete: 'Delete notification' };

  const openNotification = async (notification: NotificationDto) => {
    if (!notification.readAt) {
      try {
        await markRead.mutateAsync(notification.id);
      } catch {
        // Navigation remains available if the read-state request fails.
      }
    }
    const href = notificationHref(notification, admin);
    if (href) {
      setOpen(false);
      router.push(href);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`${labels.notifications}${count ? ` (${count})` : ''}`}
          className={cn(
            'relative inline-flex size-8 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400',
            tone === 'inverse' ? 'text-white hover:bg-white/10' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          <Bell className={compact ? 'size-4' : 'size-5'} aria-hidden="true" />
          {count > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[#FF8C00] px-1 text-[10px] font-bold leading-none text-white">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={10} className="w-[min(24rem,calc(100vw-1rem))] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="font-semibold">{labels.notifications}</p>
            {count > 0 && <p className="text-xs text-muted-foreground">{count} {locale === 'ar' ? 'غير مقروء' : 'unread'}</p>}
          </div>
          {count > 0 && (
            <button type="button" onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending} className="inline-flex items-center gap-1.5 text-xs font-medium text-[#d97706] hover:underline disabled:opacity-50">
              {markAllRead.isPending ? <LoaderCircle className="size-3.5 animate-spin" /> : <CheckCheck className="size-3.5" />}
              {labels.allRead}
            </button>
          )}
        </div>
        <div className="max-h-[min(28rem,70vh)] overflow-y-auto">
          {list.isPending && <div className="flex justify-center p-8"><LoaderCircle className="size-5 animate-spin text-muted-foreground" /></div>}
          {list.isError && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <p>{locale === 'ar' ? 'تعذر تحميل الإشعارات.' : 'Notifications could not be loaded.'}</p>
              <button type="button" className="mt-2 font-medium text-foreground underline" onClick={() => list.refetch()}>{labels.retry}</button>
            </div>
          )}
          {!list.isPending && !list.isError && list.data?.items.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">{labels.empty}</p>}
          {list.data?.items.map((notification) => {
            const navigable = !!notificationHref(notification, admin);
            return (
              <div key={notification.id} className={cn('group relative border-b px-4 py-3 last:border-b-0', !notification.readAt && 'bg-orange-50/60 dark:bg-orange-950/20')}>
                <button type="button" onClick={() => void openNotification(notification)} className={cn('block w-full pe-8 text-start', !navigable && 'cursor-default')}>
                  <span className="flex items-start gap-2">
                    {!notification.readAt && <span className="mt-2 size-2 shrink-0 rounded-full bg-[#FF8C00]" aria-label={locale === 'ar' ? 'غير مقروء' : 'Unread'} />}
                    <span className={cn(notification.readAt && 'ps-4')}>
                      <span className="block text-sm font-semibold leading-snug">{notification.title}</span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{notification.message}</span>
                      <time dateTime={notification.createdAt} className="mt-1.5 block text-[11px] text-muted-foreground">{relativeTime(notification.createdAt, locale)}</time>
                    </span>
                  </span>
                </button>
                <button type="button" aria-label={labels.delete} title={labels.delete} disabled={remove.isPending} onClick={() => remove.mutate(notification.id)} className="absolute end-2 top-3 rounded p-1.5 text-muted-foreground opacity-70 hover:bg-muted hover:text-destructive focus:opacity-100 group-hover:opacity-100 disabled:opacity-40">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            );
          })}
        </div>
        <button type="button" onClick={() => { setOpen(false); router.push(admin ? '/admin/notifications' : '/account/notifications'); }} className="w-full border-t px-4 py-3 text-center text-sm font-medium hover:bg-muted">
          {labels.all}
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


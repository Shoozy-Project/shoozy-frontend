'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, ExternalLink, LoaderCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { useNotificationActions, useNotifications } from '@/lib/hooks/use-notifications';
import { notificationHref } from '@/lib/notifications';
import { useLocaleStore } from '@/stores/locale-store';
import { NOTIFICATION_TYPES, type NotificationDto, type NotificationType } from '@/types/notifications';

export function NotificationInbox({ admin = false }: { admin?: boolean }) {
  const locale = useLocaleStore((state) => state.locale);
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [type, setType] = useState<NotificationType | ''>('');
  const list = useNotifications({ page, limit, unreadOnly, type: type || undefined });
  const { markRead, markAllRead, remove } = useNotificationActions();
  const ar = locale === 'ar';

  const open = async (notification: NotificationDto) => {
    if (!notification.readAt) {
      try { await markRead.mutateAsync(notification.id); } catch { /* Keep navigation usable. */ }
    }
    const href = notificationHref(notification, admin);
    if (href) router.push(href);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold"><Bell className="size-6 text-[#FF8C00]" />{ar ? 'الإشعارات' : 'Notifications'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{ar ? 'سجل التنبيهات الخاص بحسابك.' : 'Your account notification history.'}</p>
        </div>
        <Button variant="outline" onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
          {markAllRead.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <CheckCheck className="size-4" />}
          {ar ? 'تحديد الكل كمقروء' : 'Mark all as read'}
        </Button>
      </div>
      <div className="flex flex-wrap gap-3 rounded-xl border bg-card p-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={unreadOnly} onChange={(event) => { setUnreadOnly(event.target.checked); setPage(1); }} />
          {ar ? 'غير المقروء فقط' : 'Unread only'}
        </label>
        <select value={type} onChange={(event) => { setType(event.target.value as NotificationType | ''); setPage(1); }} className="rounded-lg border px-3 py-2 text-sm" aria-label={ar ? 'نوع الإشعار' : 'Notification type'}>
          <option value="">{ar ? 'كل الأنواع' : 'All types'}</option>
          {NOTIFICATION_TYPES.map((value) => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}
        </select>
      </div>
      <div className="overflow-hidden rounded-xl border bg-card">
        {list.isPending && <div className="flex justify-center p-14"><LoaderCircle className="size-6 animate-spin text-muted-foreground" /></div>}
        {list.isError && <div className="p-12 text-center"><p className="text-sm text-destructive">{ar ? 'تعذر تحميل الإشعارات.' : 'Notifications could not be loaded.'}</p><Button variant="outline" className="mt-4" onClick={() => list.refetch()}>{ar ? 'إعادة المحاولة' : 'Try again'}</Button></div>}
        {!list.isPending && !list.isError && list.data?.items.length === 0 && <div className="p-14 text-center"><Bell className="mx-auto size-9 text-muted-foreground/40" /><p className="mt-3 text-sm text-muted-foreground">{ar ? 'لا توجد إشعارات مطابقة.' : 'No matching notifications.'}</p></div>}
        <div className="divide-y">
          {list.data?.items.map((notification) => {
            const href = notificationHref(notification, admin);
            return <article key={notification.id} className={`flex items-start gap-3 p-4 sm:p-5 ${notification.readAt ? '' : 'bg-orange-50/60 dark:bg-orange-950/20'}`}>
              {!notification.readAt && <span className="mt-2 size-2 shrink-0 rounded-full bg-[#FF8C00]" />}
              <button type="button" onClick={() => void open(notification)} className="min-w-0 flex-1 text-start">
                <span className="font-semibold">{notification.title}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{notification.message}</span>
                <time dateTime={notification.createdAt} className="mt-2 block text-xs text-muted-foreground" dir="auto">{new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(notification.createdAt))}</time>
              </button>
              <div className="flex shrink-0 gap-1">
                {href && <Button variant="ghost" size="icon" onClick={() => void open(notification)} aria-label={ar ? 'فتح' : 'Open'}><ExternalLink className="size-4" /></Button>}
                <Button variant="ghost" size="icon" onClick={() => remove.mutate(notification.id)} disabled={remove.isPending} aria-label={ar ? 'حذف' : 'Delete'}><Trash2 className="size-4" /></Button>
              </div>
            </article>;
          })}
        </div>
        {list.data?.pagination && <DataTablePagination currentPage={list.data.pagination.page} pageSize={list.data.pagination.limit} totalItems={list.data.pagination.total} totalPages={list.data.pagination.totalPages} onPageChange={setPage} onPageSizeChange={(size) => { setLimit(size); setPage(1); }} itemLabel={ar ? 'إشعار' : 'notifications'} />}
      </div>
    </section>
  );
}

